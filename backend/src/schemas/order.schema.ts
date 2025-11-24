import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

const shippingAddressSchema = z.object({
  province: z.string().optional(),
  city: z.string().min(2, 'شهر را وارد کنید'),
  address: z.string().min(5, 'آدرس را کامل وارد کنید'),
  postalCode: z.string().min(5, 'کد پستی حداقل ۵ رقم باشد').max(15).optional().or(z.literal('')),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional()
});

const customerInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().min(10, 'شماره تلفن معتبر وارد کنید').max(15),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional()
});

const orderItemSchema = z.object({
  gameId: z.string().min(1),
  variantId: z.string().optional(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
  pricePaid: z.number().positive(),
  quantity: z.number().int().positive().default(1)
});

const shippingMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'نام روش ارسال را وارد کنید'),
  price: z.number().nonnegative(),
  priceLabel: z.string().optional(),
  eta: z.string().optional(),
  badge: z.string().optional(),
  icon: z.string().optional(),
  perks: z.array(z.string().min(1)).optional(),
  freeThreshold: z.number().nonnegative().optional()
});

const shippingPreferencesSchema = z
  .object({
    deliveryDate: z.string().optional(),
    instructions: z.string().optional()
  })
  .optional();

export const createOrderSchema = z.object({
  body: z.object({
    customerInfo: customerInfoSchema,
    items: z.array(orderItemSchema).min(1, 'حداقل یک محصول باید در سفارش باشد'),
    totalAmount: z.number().nonnegative(),
    couponCode: z.string().optional(),
    discountAmount: z.number().nonnegative().optional(),
    note: z.string().optional(),
    paymentMethod: z.string().optional(),
    shippingMethod: shippingMethodSchema.optional(),
    shippingPreferences: shippingPreferencesSchema
  }),
  query: empty,
  params: empty
});

export const getOrdersSchema = z.object({
  body: empty,
  query: z.object({
    status: z.enum(['pending', 'paid', 'failed']).optional()
  }),
  params: empty
});

export const getOrderByIdSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
    fulfillmentStatus: z.enum(['pending', 'assigned', 'delivered', 'refunded']).optional(),
    paymentReference: z.string().optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    Authority: z.string().min(1),
    Status: z.string().min(1)
  }),
  query: empty,
  params: empty
});

export const updateDeliverySchema = z.object({
  body: z
    .object({
      message: z.string().optional(),
      credentials: z.string().optional(),
      deliveredAt: z.string().optional()
    })
    .strict(),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const acknowledgeDeliverySchema = z.object({
  body: z
    .object({
      acknowledged: z.boolean().optional()
    })
    .optional()
    .transform(() => ({})),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const adminSearchOrdersSchema = z.object({
  body: empty,
  query: z.object({
    search: z.string().optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
    fulfillmentStatus: z.enum(['pending', 'assigned', 'delivered', 'refunded']).optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(1000).optional()
  }),
  params: empty
});

export const notifyOrderSchema = z.object({
  body: z.object({
    subject: z.string().optional(),
    message: z.string().min(3, 'متن ایمیل باید حداقل ۳ کاراکتر باشد').optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});
