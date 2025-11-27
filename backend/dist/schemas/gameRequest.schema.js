"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameRequestSchema = exports.getGameRequestsSchema = exports.updateGameRequestStatusSchema = exports.createGameRequestSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.createGameRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        productName: zod_1.z.string().min(1, 'Product name is required'),
        category: zod_1.z.string().min(1, 'Category is required'),
        brand: zod_1.z.string().min(1, 'Brand is required'),
        description: zod_1.z.string().optional()
    }),
    query: empty,
    params: empty
});
exports.updateGameRequestStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'approved', 'rejected', 'completed']),
        adminNote: zod_1.z.string().optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.getGameRequestsSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'approved', 'rejected', 'completed']).optional()
    }),
    params: empty
});
exports.deleteGameRequestSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=gameRequest.schema.js.map