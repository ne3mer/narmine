"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewSchema = exports.updateReviewStatusSchema = exports.getReviewsSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        gameId: zod_1.z.string().min(1),
        rating: zod_1.z.number().int().min(1).max(5),
        comment: zod_1.z.string().min(10, 'نظر باید حداقل ۱۰ کاراکتر باشد').max(1000, 'نظر نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد')
    }),
    query: empty,
    params: empty
});
exports.getReviewsSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        gameId: zod_1.z.string().optional(),
        status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
        userId: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
        page: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
    }),
    params: empty
});
exports.updateReviewStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['approved', 'rejected']),
        adminNote: zod_1.z.string().optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.deleteReviewSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=review.schema.js.map