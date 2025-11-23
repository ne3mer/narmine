"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartSchema = exports.removeFromCartSchema = exports.updateCartItemSchema = exports.getCartSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameId: zod_1.z.string().min(1, 'Game ID is required'),
        quantity: zod_1.z.number().int().min(1).default(1),
        variantId: zod_1.z.string().optional(),
        selectedOptions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional()
    }),
    query: empty,
    params: empty
});
exports.getCartSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
exports.updateCartItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().min(0)
    }),
    query: empty,
    params: zod_1.z.object({
        gameId: zod_1.z.string().min(1)
    })
});
exports.removeFromCartSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        gameId: zod_1.z.string().min(1)
    })
});
exports.clearCartSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
//# sourceMappingURL=cart.schema.js.map