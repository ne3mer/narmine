"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOrderSchema = exports.adminSearchOrdersSchema = exports.acknowledgeDeliverySchema = exports.updateDeliverySchema = exports.verifyPaymentSchema = exports.updateOrderStatusSchema = exports.getOrderByIdSchema = exports.getOrdersSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
const shippingAddressSchema = zod_1.z.object({
    province: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2, 'شهر را وارد کنید'),
    address: zod_1.z.string().min(5, 'آدرس را کامل وارد کنید'),
    postalCode: zod_1.z.string().min(5, 'کد پستی حداقل ۵ رقم باشد').max(15).optional(),
    recipientName: zod_1.z.string().optional(),
    recipientPhone: zod_1.z.string().optional()
});
const customerInfoSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email('ایمیل معتبر وارد کنید'),
    phone: zod_1.z.string().min(10, 'شماره تلفن معتبر وارد کنید').max(15),
    province: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    recipientName: zod_1.z.string().optional(),
    recipientPhone: zod_1.z.string().optional(),
    shippingAddress: shippingAddressSchema.optional()
});
const orderItemSchema = zod_1.z.object({
    gameId: zod_1.z.string().min(1),
    variantId: zod_1.z.string().optional(),
    selectedOptions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    pricePaid: zod_1.z.number().positive(),
    quantity: zod_1.z.number().int().positive().default(1)
});
const shippingMethodSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2, 'نام روش ارسال را وارد کنید'),
    price: zod_1.z.number().nonnegative(),
    priceLabel: zod_1.z.string().optional(),
    eta: zod_1.z.string().optional(),
    badge: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    perks: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    freeThreshold: zod_1.z.number().nonnegative().optional()
});
const shippingPreferencesSchema = zod_1.z
    .object({
    deliveryDate: zod_1.z.string().optional(),
    instructions: zod_1.z.string().optional()
})
    .optional();
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerInfo: customerInfoSchema,
        items: zod_1.z.array(orderItemSchema).min(1, 'حداقل یک محصول باید در سفارش باشد'),
        totalAmount: zod_1.z.number().positive(),
        couponCode: zod_1.z.string().optional(),
        discountAmount: zod_1.z.number().nonnegative().optional(),
        note: zod_1.z.string().optional(),
        paymentMethod: zod_1.z.string().optional(),
        shippingMethod: shippingMethodSchema.optional(),
        shippingPreferences: shippingPreferencesSchema
    }),
    query: empty,
    params: empty
});
exports.getOrdersSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'paid', 'failed']).optional()
    }),
    params: empty
});
exports.getOrderByIdSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.updateOrderStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        paymentStatus: zod_1.z.enum(['pending', 'paid', 'failed']).optional(),
        fulfillmentStatus: zod_1.z.enum(['pending', 'assigned', 'delivered', 'refunded']).optional(),
        paymentReference: zod_1.z.string().optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        Authority: zod_1.z.string().min(1),
        Status: zod_1.z.string().min(1)
    }),
    query: empty,
    params: empty
});
exports.updateDeliverySchema = zod_1.z.object({
    body: zod_1.z
        .object({
        message: zod_1.z.string().optional(),
        credentials: zod_1.z.string().optional(),
        deliveredAt: zod_1.z.string().optional()
    })
        .strict(),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.acknowledgeDeliverySchema = zod_1.z.object({
    body: zod_1.z
        .object({
        acknowledged: zod_1.z.boolean().optional()
    })
        .optional()
        .transform(() => ({})),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.adminSearchOrdersSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        paymentStatus: zod_1.z.enum(['pending', 'paid', 'failed']).optional(),
        fulfillmentStatus: zod_1.z.enum(['pending', 'assigned', 'delivered', 'refunded']).optional(),
        fromDate: zod_1.z.string().optional(),
        toDate: zod_1.z.string().optional(),
        page: zod_1.z.coerce.number().int().min(1).optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(1000).optional()
    }),
    params: empty
});
exports.notifyOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().optional(),
        message: zod_1.z.string().min(3, 'متن ایمیل باید حداقل ۳ کاراکتر باشد').optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=order.schema.js.map