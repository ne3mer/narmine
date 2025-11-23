import { CouponModel, type CouponDocument } from '../models/coupon.model';
import type { z } from 'zod';
import type { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../schemas/coupon.schema';
import { UserModel } from '../models/user.model';
import { OrderModel } from '../models/order.model';

export type CreateCouponInput = z.infer<typeof createCouponSchema>['body'];
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>['body'];
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>['body'];

export const listCoupons = async () => {
  return CouponModel.find().sort({ createdAt: -1 });
};

export const getCouponById = async (id: string) => {
  return CouponModel.findById(id);
};

export const getCouponByCode = async (code: string) => {
  return CouponModel.findOne({ code: code.toUpperCase() });
};

export const createCoupon = async (payload: CreateCouponInput) => {
  // Check if code already exists
  const existing = await CouponModel.findOne({ code: payload.code.toUpperCase() });
  if (existing) {
    throw new Error('Coupon code already exists');
  }

  return CouponModel.create({
    ...payload,
    code: payload.code.toUpperCase()
  });
};

export const updateCoupon = async (id: string, payload: UpdateCouponInput) => {
  if (payload.code) {
    // Check if new code already exists (excluding current coupon)
    const existing = await CouponModel.findOne({ 
      code: payload.code.toUpperCase(),
      _id: { $ne: id }
    });
    if (existing) {
      throw new Error('Coupon code already exists');
    }
    payload.code = payload.code.toUpperCase() as any;
  }

  return CouponModel.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteCoupon = async (id: string) => {
  return CouponModel.findByIdAndDelete(id);
};

export const validateCoupon = async (input: ValidateCouponInput) => {
  const { code, userId, cartTotal, productIds = [] } = input;
  
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return {
      valid: false,
      error: 'کد تخفیف معتبر نیست'
    };
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    return {
      valid: false,
      error: 'این کد تخفیف غیرفعال است'
    };
  }

  // Check date validity
  const now = new Date();
  if (now < coupon.startDate) {
    return {
      valid: false,
      error: 'این کد تخفیف هنوز فعال نشده است'
    };
  }

  if (now > coupon.endDate) {
    return {
      valid: false,
      error: 'این کد تخفیف منقضی شده است'
    };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      error: 'این کد تخفیف به پایان رسیده است'
    };
  }

  // Check minimum purchase amount
  if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
    return {
      valid: false,
      error: `حداقل مبلغ خرید باید ${coupon.minPurchaseAmount} تومان باشد`
    };
  }

  // Check applicable products
  if (coupon.applicableTo === 'products' && coupon.applicableProductIds) {
    const hasApplicableProduct = productIds.some(id => 
      coupon.applicableProductIds?.includes(id)
    );
    if (!hasApplicableProduct) {
      return {
        valid: false,
        error: 'این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود'
      };
    }
  }

  // Check excluded products
  if (coupon.excludeProducts && coupon.excludeProducts.length > 0) {
    const hasExcludedProduct = productIds.some(id => 
      coupon.excludeProducts?.includes(id)
    );
    if (hasExcludedProduct) {
      return {
        valid: false,
        error: 'این کد تخفیف برای برخی از محصولات انتخابی شما قابل استفاده نیست'
      };
    }
  }

  // Check user-specific coupons
  if (coupon.userSpecific && coupon.userSpecific.length > 0) {
    if (!userId || !coupon.userSpecific.includes(userId)) {
      return {
        valid: false,
        error: 'شما مجاز به استفاده از این کد تخفیف نیستید'
      };
    }
  }

  // Check first-time only
  if (coupon.firstTimeOnly && userId) {
    const userOrders = await OrderModel.countDocuments({ 
      userId,
      paymentStatus: 'paid'
    });
    if (userOrders > 0) {
      return {
        valid: false,
        error: 'این کد تخفیف فقط برای مشتریان جدید است'
      };
    }
  }

  // Check per-user usage limit
  if (userId && coupon.usageLimitPerUser) {
    const userCouponUsage = await OrderModel.countDocuments({
      userId,
      'couponCode': coupon.code,
      paymentStatus: 'paid'
    });
    if (userCouponUsage >= coupon.usageLimitPerUser) {
      return {
        valid: false,
        error: 'شما از این کد تخفیف استفاده کرده‌اید'
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = Math.min(coupon.value, cartTotal);
  }

  return {
    valid: true,
    coupon: {
      id: coupon._id.toString(),
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
      stackable: coupon.stackable
    }
  };
};

export const applyCoupon = async (couponId: string) => {
  const coupon = await CouponModel.findById(couponId);
  if (!coupon) {
    throw new Error('Coupon not found');
  }

  coupon.usedCount += 1;
  await coupon.save();

  return coupon;
};

export const recordCouponUsage = async (code: string, discountAmount: number) => {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;

  coupon.totalDiscountGiven += discountAmount;
  coupon.totalOrders += 1;
  await coupon.save();
};

// Generate random coupon code
export const generateCouponCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

