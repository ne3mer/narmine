"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'نام نمی‌تواند خالی باشد').optional(),
        phone: zod_1.z.string().optional(),
        telegram: zod_1.z.string().optional()
    }),
    query: empty,
    params: empty
});
//# sourceMappingURL=profile.schema.js.map