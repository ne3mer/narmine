"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponSchema = exports.deleteCouponSchema = exports.getCouponSchema = exports.updateCouponSchema = exports.createCouponSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.createCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
        name: zod_1.z.string().min(3).max(200),
        description: zod_1.z.string().optional(),
        type: zod_1.z.enum(['percentage', 'fixed']),
        value: zod_1.z.number().positive(),
        minPurchaseAmount: zod_1.z.number().positive().optional(),
        maxDiscountAmount: zod_1.z.number().positive().optional(),
        applicableTo: zod_1.z.enum(['all', 'products', 'categories']).default('all'),
        applicableProductIds: zod_1.z.array(zod_1.z.string()).optional(),
        applicableCategories: zod_1.z.array(zod_1.z.string()).optional(),
        usageLimit: zod_1.z.number().int().positive().optional(),
        usageLimitPerUser: zod_1.z.number().int().positive().optional().default(1),
        startDate: zod_1.z.string().transform((val) => new Date(val)),
        endDate: zod_1.z.string().transform((val) => new Date(val)),
        isActive: zod_1.z.boolean().default(true),
        firstTimeOnly: zod_1.z.boolean().default(false),
        userSpecific: zod_1.z.array(zod_1.z.string()).optional(),
        excludeProducts: zod_1.z.array(zod_1.z.string()).optional(),
        stackable: zod_1.z.boolean().default(false)
    }).refine((data) => {
        if (data.type === 'percentage' && data.value > 100) {
            return false;
        }
        return true;
    }, {
        message: 'Percentage value cannot exceed 100',
        path: ['value']
    }).refine((data) => {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate > startDate;
    }, {
        message: 'End date must be after start date',
        path: ['endDate']
    }),
    query: empty,
    params: empty
});
exports.updateCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/).optional(),
        name: zod_1.z.string().min(3).max(200).optional(),
        description: zod_1.z.string().optional(),
        type: zod_1.z.enum(['percentage', 'fixed']).optional(),
        value: zod_1.z.number().positive().optional(),
        minPurchaseAmount: zod_1.z.number().positive().optional(),
        maxDiscountAmount: zod_1.z.number().positive().optional(),
        applicableTo: zod_1.z.enum(['all', 'products', 'categories']).optional(),
        applicableProductIds: zod_1.z.array(zod_1.z.string()).optional(),
        applicableCategories: zod_1.z.array(zod_1.z.string()).optional(),
        usageLimit: zod_1.z.number().int().positive().optional(),
        usageLimitPerUser: zod_1.z.number().int().positive().optional(),
        startDate: zod_1.z.string().transform((val) => val ? new Date(val) : undefined).optional(),
        endDate: zod_1.z.string().transform((val) => val ? new Date(val) : undefined).optional(),
        isActive: zod_1.z.boolean().optional(),
        firstTimeOnly: zod_1.z.boolean().optional(),
        userSpecific: zod_1.z.array(zod_1.z.string()).optional(),
        excludeProducts: zod_1.z.array(zod_1.z.string()).optional(),
        stackable: zod_1.z.boolean().optional()
    }).strict(),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.getCouponSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.deleteCouponSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.validateCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(1),
        userId: zod_1.z.string().optional(),
        cartTotal: zod_1.z.number().positive(),
        productIds: zod_1.z.array(zod_1.z.string()).optional()
    }),
    query: empty,
    params: empty
});
//# sourceMappingURL=coupon.schema.js.map