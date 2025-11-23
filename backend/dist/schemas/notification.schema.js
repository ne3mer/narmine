"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationSchema = exports.markAllAsReadSchema = exports.markAsReadSchema = exports.getUnreadCountSchema = exports.getUserNotificationsSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.getUserNotificationsSchema = zod_1.z.object({
    body: empty,
    query: zod_1.z.object({
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional()
    }),
    params: empty
});
exports.getUnreadCountSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
exports.markAsReadSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.markAllAsReadSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: empty
});
exports.deleteNotificationSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
//# sourceMappingURL=notification.schema.js.map