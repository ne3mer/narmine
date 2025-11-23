"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePriceAlertSchema = exports.updatePriceAlertSchema = exports.getPriceAlertByIdSchema = exports.getUserPriceAlertsSchema = exports.createPriceAlertSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.createPriceAlertSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameId: zod_1.z.string().min(1, 'شناسه بازی الزامی است'),
        targetPrice: zod_1.z.number().positive('قیمت هدف باید مثبت باشد'),
        channel: zod_1.z.enum(['email', 'telegram']),
        destination: zod_1.z.string().min(1, 'مقصد اعلان الزامی است')
    }),
    query: empty,
    params: empty
});
exports.getUserPriceAlertsSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
exports.getPriceAlertByIdSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.updatePriceAlertSchema = zod_1.z.object({
    body: zod_1.z.object({
        targetPrice: zod_1.z.number().positive().optional(),
        channel: zod_1.z.enum(['email', 'telegram']).optional(),
        destination: zod_1.z.string().min(1).optional(),
        active: zod_1.z.boolean().optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.deletePriceAlertSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=priceAlert.schema.js.map