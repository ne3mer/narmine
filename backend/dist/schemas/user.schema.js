"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInsightsSchema = exports.sendUserMessageSchema = exports.deleteUserSchema = exports.updateUserSchema = exports.updateUserRoleSchema = exports.getUserByIdSchema = exports.getAllUsersSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.getAllUsersSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
exports.getUserByIdSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.updateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(['user', 'admin'])
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        phone: zod_1.z.string().optional(),
        telegram: zod_1.z.string().optional()
    }),
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.deleteUserSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.sendUserMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(3, 'موضوع باید حداقل ۳ کاراکتر باشد'),
        message: zod_1.z.string().min(3, 'متن پیام باید حداقل ۳ کاراکتر باشد'),
        userIds: zod_1.z.array(zod_1.z.string().min(1)).optional(),
        role: zod_1.z.enum(['user', 'admin']).optional(),
        sendToAll: zod_1.z.boolean().optional(),
        channel: zod_1.z.enum(['email', 'telegram', 'both']).optional()
    }).refine((data) => Boolean(data.sendToAll || (data.userIds && data.userIds.length > 0) || data.role), {
        message: 'باید حداقل یک کاربر یا دسته‌بندی مخاطب انتخاب شود'
    }),
    query: empty,
    params: empty
});
exports.getUserInsightsSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=user.schema.js.map