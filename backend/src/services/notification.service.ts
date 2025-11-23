import { NotificationModel, type NotificationDocument } from '../models/notification.model';
import { ApiError } from '../middleware/errorHandler';

export const getUserNotifications = async (userId: string, limit?: number) => {
  const query = NotificationModel.find({ userId }).sort({ createdAt: -1 });
  
  if (limit) {
    query.limit(limit);
  }
  
  return query.populate('orderId', 'orderNumber totalAmount');
};

export const getUnreadNotificationCount = async (userId: string) => {
  return NotificationModel.countDocuments({ userId, read: false });
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'اعلان یافت نشد');
  }

  return notification;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  await NotificationModel.updateMany(
    { userId, read: false },
    { read: true }
  );
};

export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await NotificationModel.findOneAndDelete({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(404, 'اعلان یافت نشد');
  }

  return { message: 'اعلان حذف شد' };
};

