import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
    name: z.string().min(3).max(200),
    description: z.string().optional(),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive(),
    minPurchaseAmount: z.number().positive().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    applicableTo: z.enum(['all', 'products', 'categories']).default('all'),
    applicableProductIds: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().optional().default(1),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
    isActive: z.boolean().default(true),
    firstTimeOnly: z.boolean().default(false),
    userSpecific: z.array(z.string()).optional(),
    excludeProducts: z.array(z.string()).optional(),
    stackable: z.boolean().default(false)
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

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/).optional(),
    name: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().positive().optional(),
    minPurchaseAmount: z.number().positive().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    applicableTo: z.enum(['all', 'products', 'categories']).optional(),
    applicableProductIds: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().optional(),
    startDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
    endDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
    isActive: z.boolean().optional(),
    firstTimeOnly: z.boolean().optional(),
    userSpecific: z.array(z.string()).optional(),
    excludeProducts: z.array(z.string()).optional(),
    stackable: z.boolean().optional()
  }).strict(),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const getCouponSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const deleteCouponSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    userId: z.string().optional(),
    cartTotal: z.number().positive(),
    productIds: z.array(z.string()).optional()
  }),
  query: empty,
  params: empty
});

