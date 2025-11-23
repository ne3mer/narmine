"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadNotificationCount = exports.getUserNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
const errorHandler_1 = require("../middleware/errorHandler");
const getUserNotifications = async (userId, limit) => {
    const query = notification_model_1.NotificationModel.find({ userId }).sort({ createdAt: -1 });
    if (limit) {
        query.limit(limit);
    }
    return query.populate('orderId', 'orderNumber totalAmount');
};
exports.getUserNotifications = getUserNotifications;
const getUnreadNotificationCount = async (userId) => {
    return notification_model_1.NotificationModel.countDocuments({ userId, read: false });
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await notification_model_1.NotificationModel.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true });
    if (!notification) {
        throw new errorHandler_1.ApiError(404, 'اعلان یافت نشد');
    }
    return notification;
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (userId) => {
    await notification_model_1.NotificationModel.updateMany({ userId, read: false }, { read: true });
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = async (notificationId, userId) => {
    const notification = await notification_model_1.NotificationModel.findOneAndDelete({ _id: notificationId, userId });
    if (!notification) {
        throw new errorHandler_1.ApiError(404, 'اعلان یافت نشد');
    }
    return { message: 'اعلان حذف شد' };
};
exports.deleteNotification = deleteNotification;
//# sourceMappingURL=notification.service.js.map