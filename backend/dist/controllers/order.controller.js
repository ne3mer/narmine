"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarranty = exports.verifyPayment = exports.acknowledgeOrderDeliveryHandler = exports.updateOrderDeliveryHandler = exports.notifyCustomer = exports.searchAdminOrders = exports.getAllOrders = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const orderService = __importStar(require("../services/order.service"));
const createOrder = async (req, res) => {
    const { customerInfo, items, totalAmount, couponCode, discountAmount, note, paymentMethod, shippingMethod, shippingPreferences } = req.body;
    let userId = req.user?.id;
    if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                userId = (decoded.id || decoded.sub);
            }
            catch (error) {
                console.warn('اختیاری: توکن نامعتبر در ایجاد سفارش، به صورت مهمان ادامه می‌یابد.');
            }
        }
    }
    try {
        const normalizedCustomerInfo = {
            ...customerInfo
        };
        if (!normalizedCustomerInfo.shippingAddress) {
            const legacyAddressExists = normalizedCustomerInfo.address || normalizedCustomerInfo.city || normalizedCustomerInfo.postalCode;
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
        const sanitizedShippingMethod = shippingMethod && shippingMethod.name
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
        // Record coupon usage if coupon was applied
        if (couponCode && discountAmount && discountAmount > 0) {
            try {
                const { recordCouponUsage } = await Promise.resolve().then(() => __importStar(require('../services/coupon.service')));
                await recordCouponUsage(couponCode, discountAmount);
            }
            catch (error) {
                console.warn('Failed to record coupon usage:', error);
                // Don't fail the order if coupon recording fails
            }
        }
        res.status(201).json({
            message: 'سفارش با موفقیت ثبت شد',
            data: order
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            message: 'خطا در ثبت سفارش'
        });
    }
};
exports.createOrder = createOrder;
const getUserOrders = async (req, res) => {
    const userId = req.user?.id;
    const { status } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    try {
        const orders = await orderService.getUserOrders(userId, status);
        res.json({ data: orders });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'خطا در دریافت سفارشات' });
    }
};
exports.getUserOrders = getUserOrders;
const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const order = await orderService.getOrderById(id, userId);
        if (!order) {
            return res.status(404).json({ message: 'سفارش یافت نشد' });
        }
        res.json({ data: order });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'خطا در دریافت سفارش' });
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'خطا در به‌روزرسانی سفارش' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json({ data: orders });
    }
    catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'خطا در دریافت سفارشات' });
    }
};
exports.getAllOrders = getAllOrders;
const searchAdminOrders = async (req, res) => {
    const { search, paymentStatus, fulfillmentStatus, fromDate, toDate, page, limit } = req.query;
    try {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 20;
        const from = typeof fromDate === 'string' && fromDate ? new Date(fromDate) : undefined;
        const to = typeof toDate === 'string' && toDate ? new Date(toDate) : undefined;
        const { orders, total } = await orderService.searchAdminOrders({
            search: typeof search === 'string' ? search : undefined,
            paymentStatus: typeof paymentStatus === 'string' ? paymentStatus : undefined,
            fulfillmentStatus: typeof fulfillmentStatus === 'string' ? fulfillmentStatus : undefined,
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
    }
    catch (error) {
        console.error('Error searching orders:', error);
        res.status(500).json({ message: 'خطا در جستجوی سفارشات' });
    }
};
exports.searchAdminOrders = searchAdminOrders;
const notifyCustomer = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error notifying customer:', error);
        res.status(500).json({ message: 'ارسال ایمیل با مشکل مواجه شد' });
    }
};
exports.notifyCustomer = notifyCustomer;
const updateOrderDeliveryHandler = async (req, res) => {
    const { id } = req.params;
    const { message, credentials, deliveredAt } = req.body ?? {};
    const adminId = req.user?.id;
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
exports.updateOrderDeliveryHandler = updateOrderDeliveryHandler;
const acknowledgeOrderDeliveryHandler = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
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
exports.acknowledgeOrderDeliveryHandler = acknowledgeOrderDeliveryHandler;
// ZarinPal payment verification (placeholder)
const verifyPayment = async (req, res) => {
    const { Authority, Status } = req.body;
    try {
        // TODO: Implement actual ZarinPal verification
        // For now, just update order status based on Status
        if (Status === 'OK') {
            // Find order by payment reference
            const order = await orderService.updateOrderStatus(Authority, {
                paymentStatus: 'paid',
                paymentReference: Authority
            });
            if (order) {
                return res.json({
                    message: 'پرداخت با موفقیت انجام شد',
                    data: order
                });
            }
        }
        res.status(400).json({ message: 'پرداخت ناموفق بود' });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در تأیید پرداخت' });
    }
};
exports.verifyPayment = verifyPayment;
const updateWarranty = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error updating warranty:', error);
        res.status(500).json({ message: 'خطا در به‌روزرسانی گارانتی' });
    }
};
exports.updateWarranty = updateWarranty;
//# sourceMappingURL=order.controller.js.map