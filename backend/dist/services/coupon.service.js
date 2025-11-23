"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCouponCode = exports.recordCouponUsage = exports.applyCoupon = exports.validateCoupon = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponByCode = exports.getCouponById = exports.listCoupons = void 0;
const coupon_model_1 = require("../models/coupon.model");
const order_model_1 = require("../models/order.model");
const listCoupons = async () => {
    return coupon_model_1.CouponModel.find().sort({ createdAt: -1 });
};
exports.listCoupons = listCoupons;
const getCouponById = async (id) => {
    return coupon_model_1.CouponModel.findById(id);
};
exports.getCouponById = getCouponById;
const getCouponByCode = async (code) => {
    return coupon_model_1.CouponModel.findOne({ code: code.toUpperCase() });
};
exports.getCouponByCode = getCouponByCode;
const createCoupon = async (payload) => {
    // Check if code already exists
    const existing = await coupon_model_1.CouponModel.findOne({ code: payload.code.toUpperCase() });
    if (existing) {
        throw new Error('Coupon code already exists');
    }
    return coupon_model_1.CouponModel.create({
        ...payload,
        code: payload.code.toUpperCase()
    });
};
exports.createCoupon = createCoupon;
const updateCoupon = async (id, payload) => {
    if (payload.code) {
        // Check if new code already exists (excluding current coupon)
        const existing = await coupon_model_1.CouponModel.findOne({
            code: payload.code.toUpperCase(),
            _id: { $ne: id }
        });
        if (existing) {
            throw new Error('Coupon code already exists');
        }
        payload.code = payload.code.toUpperCase();
    }
    return coupon_model_1.CouponModel.findByIdAndUpdate(id, payload, { new: true });
};
exports.updateCoupon = updateCoupon;
const deleteCoupon = async (id) => {
    return coupon_model_1.CouponModel.findByIdAndDelete(id);
};
exports.deleteCoupon = deleteCoupon;
const validateCoupon = async (input) => {
    const { code, userId, cartTotal, productIds = [] } = input;
    const coupon = await (0, exports.getCouponByCode)(code);
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
        const hasApplicableProduct = productIds.some(id => coupon.applicableProductIds?.includes(id));
        if (!hasApplicableProduct) {
            return {
                valid: false,
                error: 'این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود'
            };
        }
    }
    // Check excluded products
    if (coupon.excludeProducts && coupon.excludeProducts.length > 0) {
        const hasExcludedProduct = productIds.some(id => coupon.excludeProducts?.includes(id));
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
        const userOrders = await order_model_1.OrderModel.countDocuments({
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
        const userCouponUsage = await order_model_1.OrderModel.countDocuments({
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
    }
    else {
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
exports.validateCoupon = validateCoupon;
const applyCoupon = async (couponId) => {
    const coupon = await coupon_model_1.CouponModel.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    coupon.usedCount += 1;
    await coupon.save();
    return coupon;
};
exports.applyCoupon = applyCoupon;
const recordCouponUsage = async (code, discountAmount) => {
    const coupon = await (0, exports.getCouponByCode)(code);
    if (!coupon)
        return;
    coupon.totalDiscountGiven += discountAmount;
    coupon.totalOrders += 1;
    await coupon.save();
};
exports.recordCouponUsage = recordCouponUsage;
// Generate random coupon code
const generateCouponCode = (length = 8) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
exports.generateCouponCode = generateCouponCode;
//# sourceMappingURL=coupon.service.js.map