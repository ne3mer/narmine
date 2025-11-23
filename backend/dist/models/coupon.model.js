"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponModel = void 0;
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minPurchaseAmount: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    applicableTo: { type: String, enum: ['all', 'products', 'categories'], default: 'all' },
    applicableProductIds: [{ type: String }],
    applicableCategories: [{ type: String }],
    usageLimit: { type: Number, min: 0 },
    usageLimitPerUser: { type: Number, min: 0, default: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    firstTimeOnly: { type: Boolean, default: false },
    userSpecific: [{ type: String }],
    excludeProducts: [{ type: String }],
    stackable: { type: Boolean, default: false },
    totalDiscountGiven: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
}, { timestamps: true });
// Indexes for performance
// couponSchema.index({ code: 1 }); // Already unique in schema
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ applicableTo: 1 });
// Validation
couponSchema.pre('save', function (next) {
    if (this.type === 'percentage' && this.value > 100) {
        return next(new Error('Percentage value cannot exceed 100'));
    }
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }
    next();
});
couponSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { ...rest, id: _id };
    }
});
exports.CouponModel = (0, mongoose_1.model)('Coupon', couponSchema);
//# sourceMappingURL=coupon.model.js.map