import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as orderService from '../services/order.service';
import type { AdminOrderFilters } from '../services/order.service';

export const createOrder = async (req: Request, res: Response) => {
  const {
    customerInfo,
    items,
    totalAmount,
    couponCode,
    discountAmount,
    note,
    paymentMethod,
    shippingMethod,
    shippingPreferences
  } = req.body;
  let userId = (req as any).user?.id as string | undefined;

  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
        userId = (decoded.id || decoded.sub) as string | undefined;
      } catch (error) {
        console.warn('اختیاری: توکن نامعتبر در ایجاد سفارش، به صورت مهمان ادامه می‌یابد.');
      }
    }
  }

  try {
    const normalizedCustomerInfo = {
      ...customerInfo
    };

    if (!normalizedCustomerInfo.shippingAddress) {
      const legacyAddressExists =
        normalizedCustomerInfo.address || normalizedCustomerInfo.city || normalizedCustomerInfo.postalCode;
      if (legacyAddressExists) {
        normalizedCustomerInfo.shippingAddress = {
          province: normalizedCustomerInfo.province,
          city: normalizedCustomerInfo.city,
          address: normalizedCustomerInfo.address,
          postalCode: normalizedCustomerInfo.postalCode,
          recipientName: normalizedCustomerInfo.recipientName ?? normalizedCustomerInfo.name,
          recipientPhone: normalizedCustomerInfo.recipientPhone ?? normalizedCustomerInfo.phone
        };
      }
    }

    const sanitizedShippingMethod =
      shippingMethod && shippingMethod.name
        ? {
            ...shippingMethod,
            price: Number.isFinite(shippingMethod.price) ? shippingMethod.price : 0
          }
        : undefined;

    const order = await orderService.createOrder({
      userId,
      customerInfo: normalizedCustomerInfo,
      items,
      totalAmount,
      couponCode,
      discountAmount,
      note,
      paymentMethod,
      shippingMethod: sanitizedShippingMethod,
      shippingPreferences
    });

    // Handle Online Payment (ZarinPal)
    if (paymentMethod === 'online' || paymentMethod === 'zarinpal') {
      try {
        const { zarinpalService } = await import('../services/zarinpal.service');
        const callbackUrl = `${env.CLIENT_URL}/orders/verify`;
        const description = `Order: ${order.orderNumber}`;
        const mobile = normalizedCustomerInfo.phone;
        const email = normalizedCustomerInfo.email;
        
        // ZarinPal Amount is in Toman, ensure totalAmount is correct
        const paymentResponse = await zarinpalService.requestPayment(
          totalAmount, 
          description, 
          callbackUrl, 
          mobile, 
          email
        ); // totalAmount is Toman

        if (paymentResponse.success && paymentResponse.authority) {
          // Update order with authority
          await orderService.updateOrderStatus(order._id.toString(), {
            paymentReference: paymentResponse.authority
          });

          // Record coupon usage if coupon was applied
          if (couponCode && discountAmount && discountAmount > 0) {
            try {
              const { recordCouponUsage } = await import('../services/coupon.service');
              await recordCouponUsage(couponCode, discountAmount);
            } catch (error) {
              console.warn('Failed to record coupon usage:', error);
            }
          }

          return res.status(201).json({
            message: 'سفارش با موفقیت ثبت شد',
            data: {
              ...order.toObject(),
              paymentUrl: paymentResponse.paymentUrl
            }
          });
        }
      } catch (paymentError) {
        console.error('Payment Request Failed:', paymentError);
        // Fallback or just return order
      }
    }

    // Record coupon usage if coupon was applied
    if (couponCode && discountAmount && discountAmount > 0) {
      try {
        const { recordCouponUsage } = await import('../services/coupon.service');
        await recordCouponUsage(couponCode, discountAmount);
      } catch (error) {
        console.warn('Failed to record coupon usage:', error);
      }
    }

    res.status(201).json({
      message: 'سفارش با موفقیت ثبت شد',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'خطا در ثبت سفارش'
    });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { status } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  try {
    const orders = await orderService.getUserOrders(userId, status as string);
    res.json({ data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'خطا در دریافت سفارشات' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const order = await orderService.getOrderById(id, userId);
    
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    res.json({ data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'خطا در دریافت سفارش' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const order = await orderService.updateOrderStatus(id, updates);
    
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    res.json({
      message: 'وضعیت سفارش به‌روزرسانی شد',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'خطا در به‌روزرسانی سفارش' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'خطا در دریافت سفارشات' });
  }
};

export const searchAdminOrders = async (req: Request, res: Response) => {
  const { search, paymentStatus, fulfillmentStatus, fromDate, toDate, page, limit } = req.query;

  try {
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 20;
    const from = typeof fromDate === 'string' && fromDate ? new Date(fromDate) : undefined;
    const to = typeof toDate === 'string' && toDate ? new Date(toDate) : undefined;

    const { orders, total } = await orderService.searchAdminOrders({
      search: typeof search === 'string' ? search : undefined,
      paymentStatus: typeof paymentStatus === 'string' ? (paymentStatus as AdminOrderFilters['paymentStatus']) : undefined,
      fulfillmentStatus: typeof fulfillmentStatus === 'string' ? (fulfillmentStatus as AdminOrderFilters['fulfillmentStatus']) : undefined,
      fromDate: from && !Number.isNaN(from.getTime()) ? from : undefined,
      toDate: to && !Number.isNaN(to.getTime()) ? to : undefined,
      page: pageNumber,
      limit: limitNumber
    });

    res.json({
      data: orders,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ message: 'خطا در جستجوی سفارشات' });
  }
};

export const notifyCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subject, message } = req.body ?? {};

  try {
    const result = await orderService.notifyCustomerByEmail(id, { subject, message });

    if (!result) {
      return res.status(404).json({ message: 'سفارشی با این شناسه یافت نشد' });
    }

    res.json({
      message: 'ایمیل سفارش برای مشتری ارسال شد (شبیه‌سازی)',
      data: result
    });
  } catch (error) {
    console.error('Error notifying customer:', error);
    res.status(500).json({ message: 'ارسال ایمیل با مشکل مواجه شد' });
  }
};

export const updateOrderDeliveryHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, credentials, deliveredAt } = req.body ?? {};
  const adminId = (req as any).user?.id;

  const order = await orderService.updateOrderDelivery(id, {
    message,
    credentials,
    deliveredAt: deliveredAt ? new Date(deliveredAt) : undefined,
    updatedBy: adminId
  });

  if (!order) {
    return res.status(404).json({ message: 'سفارشی با این شناسه یافت نشد' });
  }

  res.json({
    message: 'اطلاعات تحویل ذخیره شد',
    data: order
  });
};

export const acknowledgeOrderDeliveryHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const order = await orderService.acknowledgeOrderDelivery(id, userId);

  if (!order) {
    return res.status(404).json({ message: 'سفارش یافت نشد یا متعلق به شما نیست' });
  }

  res.json({
    message: 'دریافت سفارش تایید شد',
    data: order
  });
};

// ZarinPal payment verification
export const verifyPayment = async (req: Request, res: Response) => {
  const { Authority, Status } = req.body; // Changed to body as schema might expect post body. Or if GET callback, need to check. Usually callbacks are GET.
  // Actually ZarinPal callbacks are GET usually. But the router defined it as POST in route.ts: router.post('/verify-payment', ...). 
  // Wait, standard ZarinPal callback is a redirect (GET). The frontend usually handles the callback page, then calls backend.
  // Let's assume frontend calls this endpoint with Authority and Status from query params.
  // Checking route `router.post('/verify-payment', ...)` -> Frontend receives callback, then POSTs to backend. Correct.

  try {
    const { OrderModel } = await import('../models/order.model');
    const { zarinpalService } = await import('../services/zarinpal.service');
    
    // Find order by authority (stored in paymentReference)
    // Note: In createOrder we stored authority in paymentReference
    const order = await OrderModel.findOne({ paymentReference: Authority });

    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    if (Status === 'NOK') {
      return res.status(400).json({ 
        success: false, 
        message: 'پرداخت توسط کاربر لغو شد یا ناموفق بود' 
      });
    }

    if (Status === 'OK') {
      const amount = order.totalAmount;
      const verifyResult = await zarinpalService.verifyPayment(amount, Authority);

      if (verifyResult.success) {
        // Payment Verified
        const updatedOrder = await orderService.updateOrderStatus(order._id.toString(), {
          paymentStatus: 'paid',
          paymentReference: Authority // keep it or update with refId if needed
          // We could add refId to a new field if schema supports it, for now paymentReference is good.
        });

        if (updatedOrder) {
          return res.json({
            success: true,
            message: 'پرداخت با موفقیت انجام شد',
            data: {
              ...updatedOrder.toObject(),
              refId: verifyResult.refId
            }
          });
        }
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'تایید پرداخت با خطا مواجه شد',
          error: verifyResult.code
        });
      }
    }

    res.status(400).json({ success: false, message: 'وضعیت پرداخت نامعتبر است' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, message: 'خطا در تأیید پرداخت' });
  }
};

export const updateWarranty = async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const warrantyData = req.body;

  try {
    const order = await orderService.updateOrderItemWarranty(id, itemId, warrantyData);

    if (!order) {
      return res.status(404).json({ message: 'سفارش یا آیتم یافت نشد' });
    }

    res.json({
      message: 'گارانتی با موفقیت به‌روزرسانی شد',
      data: order
    });
  } catch (error) {
    console.error('Error updating warranty:', error);
    res.status(500).json({ message: 'خطا در به‌روزرسانی گارانتی' });
  }
};
