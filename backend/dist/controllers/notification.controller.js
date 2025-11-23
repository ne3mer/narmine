"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotification = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getUserNotifications = void 0;
const notificationService = __importStar(require("../services/notification.service"));
const user_model_1 = require("../models/user.model");
const email_service_1 = require("../services/email.service");
const telegram_service_1 = require("../services/telegram.service");
const getUserNotifications = async (req, res) => {
    const userId = req.user?.id;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    const notifications = await notificationService.getUserNotifications(userId, limit);
    res.json({ data: notifications });
};
exports.getUserNotifications = getUserNotifications;
const getUnreadCount = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    const count = await notificationService.getUnreadNotificationCount(userId);
    res.json({ data: { count } });
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    const notification = await notificationService.markNotificationAsRead(id, userId);
    res.json({ message: 'اعلان به عنوان خوانده شده علامت‌گذاری شد', data: notification });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    await notificationService.markAllNotificationsAsRead(userId);
    res.json({ message: 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند' });
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    await notificationService.deleteNotification(id, userId);
    res.status(204).send();
};
exports.deleteNotification = deleteNotification;
const sendAdminNotification = async (req, res) => {
    try {
        const { type, target, targetId, subject, message } = req.body;
        let users = [];
        // 1. Fetch Target Users
        if (target === 'all') {
            users = await user_model_1.UserModel.find({});
        }
        else if (target === 'user' && targetId) {
            const user = await user_model_1.UserModel.findById(targetId);
            if (user)
                users = [user];
        }
        if (users.length === 0) {
            return res.status(404).json({ message: 'هیچ کاربری یافت نشد' });
        }
        // 2. Send Messages
        const results = {
            total: users.length,
            email: 0,
            telegram: 0,
            errors: 0
        };
        const promises = users.map(async (user) => {
            try {
                // Send Email
                if ((type === 'email' || type === 'both') && user.email) {
                    await email_service_1.emailService.sendEmail({
                        to: user.email,
                        subject: subject || 'پیام جدید از نکست‌پلی آرنا',
                        html: `<div dir="rtl" style="font-family: Tahoma; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>`
                    });
                    results.email++;
                }
                // Send Telegram
                if ((type === 'telegram' || type === 'both') && user.telegramChatId) {
                    await telegram_service_1.telegramService.sendNotification(user._id, message);
                    results.telegram++;
                }
            }
            catch (err) {
                console.error(`Error sending to user ${user._id}:`, err);
                results.errors++;
            }
        });
        await Promise.all(promises);
        res.json({
            message: 'پیام‌ها با موفقیت ارسال شدند',
            results
        });
    }
    catch (error) {
        console.error('Error sending admin notification:', error);
        res.status(500).json({ message: 'خطا در ارسال پیام', error: error.message });
    }
};
exports.sendAdminNotification = sendAdminNotification;
//# sourceMappingURL=notification.controller.js.map