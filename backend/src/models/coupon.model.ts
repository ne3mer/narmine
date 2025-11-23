import { Schema, model, type Document } from 'mongoose';

export interface CouponDocument extends Document {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number; // Percentage (0-100) or fixed amount
  minPurchaseAmount?: number; // Minimum purchase to use coupon
  maxDiscountAmount?: number; // Maximum discount for percentage coupons
  applicableTo: 'all' | 'products' | 'categories';
  applicableProductIds?: string[];
  applicableCategories?: string[];
  usageLimit?: number; // Total usage limit
  usageLimitPerUser?: number; // Usage limit per user
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  // Advanced features
  firstTimeOnly: boolean; // Only for first-time customers
  userSpecific?: string[]; // Array of user IDs who can use this
  excludeProducts?: string[]; // Products excluded from coupon
  stackable: boolean; // Can be combined with other coupons
  // Analytics
  totalDiscountGiven: number;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<CouponDocument>(
  {
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
  },
  { timestamps: true }
);

// Indexes for performance
couponSchema.index({ code: 1 });
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

export const CouponModel = model<CouponDocument>('Coupon', couponSchema);

