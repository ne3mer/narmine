"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', index: true },
    type: {
        type: String,
        enum: ['order_email', 'order_update', 'price_alert', 'system'],
        required: true
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
exports.NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema);
//# sourceMappingURL=notification.model.js.map