"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getUserInsights = exports.sendAdminMessage = exports.deleteUser = exports.updateUser = exports.updateUserRole = exports.getUserByEmail = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = require("../models/user.model");
const errorHandler_1 = require("../middleware/errorHandler");
const order_model_1 = require("../models/order.model");
const notification_model_1 = require("../models/notification.model");
const priceAlert_model_1 = require("../models/priceAlert.model");
const notificationSender_service_1 = require("./notificationSender.service");
const mongoose_1 = require("mongoose");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AnalyticsModel = require('../../models/Analytics');
const getAllUsers = async () => {
    return user_model_1.UserModel.find().select('-password').sort({ createdAt: -1 });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId).select('-password');
    if (!user) {
        throw new errorHandler_1.ApiError(404, 'کاربر یافت نشد');
    }
    return user;
};
exports.getUserById = getUserById;
const getUserByEmail = async (email) => {
    return user_model_1.UserModel.findOne({ email: email.toLowerCase().trim() }).select('-password');
};
exports.getUserByEmail = getUserByEmail;
const updateUserRole = async (userId, newRole) => {
    const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true, runValidators: true }).select('-password');
    if (!user) {
        throw new errorHandler_1.ApiError(404, 'کاربر یافت نشد');
    }
    return user;
};
exports.updateUserRole = updateUserRole;
const updateUser = async (userId, updates) => {
    const user = await user_model_1.UserModel.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
        throw new errorHandler_1.ApiError(404, 'کاربر یافت نشد');
    }
    return user;
};
exports.updateUser = updateUser;
const deleteUser = async (userId) => {
    const user = await user_model_1.UserModel.findByIdAndDelete(userId);
    if (!user) {
        throw new errorHandler_1.ApiError(404, 'کاربر یافت نشد');
    }
    return { message: 'کاربر با موفقیت حذف شد' };
};
exports.deleteUser = deleteUser;
const sendAdminMessage = async (input) => {
    const { subject, message, userIds, role, sendToAll, channel = 'email' } = input;
    const filter = {};
    if (!sendToAll) {
        const conditions = [];
        if (userIds?.length) {
            conditions.push({ _id: { $in: userIds.map((id) => new mongoose_1.Types.ObjectId(id)) } });
        }
        if (role) {
            filter.role = role;
        }
        if (conditions.length > 0) {
            filter.$or = conditions;
        }
        if (!filter.$or && !filter.role) {
            throw new errorHandler_1.ApiError(400, 'هیچ مخاطبی انتخاب نشده است');
        }
    }
    const recipients = await user_model_1.UserModel.find(filter).select('email telegram name role');
    if (!recipients.length) {
        throw new errorHandler_1.ApiError(404, 'کاربری برای ارسال پیام یافت نشد');
    }
    let sent = 0;
    const failures = [];
    await Promise.all(recipients.map(async (user) => {
        try {
            const desiredChannel = channel === 'both' && user.telegram ? 'both' : channel === 'telegram' && !user.telegram ? 'email' : channel;
            await (0, notificationSender_service_1.sendNotification)({
                userId: user._id.toString(),
                type: 'system',
                subject,
                message,
                channel: desiredChannel,
                email: user.email,
                telegramChatId: user.telegram
            });
            sent += 1;
        }
        catch (error) {
            failures.push({
                userId: user._id.toString(),
                reason: error instanceof Error ? error.message : 'خطای نامشخص'
            });
        }
    }));
    return {
        totalRecipients: recipients.length,
        sent,
        failed: failures.length,
        failures
    };
};
exports.sendAdminMessage = sendAdminMessage;
const getUserInsights = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId).select('-password').lean();
    if (!user) {
        throw new errorHandler_1.ApiError(404, 'کاربر یافت نشد');
    }
    const emailFilter = user.email ? [{ 'customerInfo.email': user.email }] : [];
    const userOrderFilter = [
        { userId: new mongoose_1.Types.ObjectId(userId) },
        ...emailFilter
    ];
    const orders = await order_model_1.OrderModel.find({
        $or: userOrderFilter
    })
        .populate({
        path: 'items.gameId',
        select: 'title categories genre platform',
        populate: { path: 'categories', select: 'name slug' }
    })
        .sort({ createdAt: -1 })
        .lean();
    const totalOrders = orders.length;
    let paidOrders = 0;
    let pendingOrders = 0;
    let failedOrders = 0;
    let totalSpent = 0;
    let lastOrderAt = null;
    const categoryCount = new Map();
    const gameCount = new Map();
    const platformCount = new Map();
    orders.forEach((order) => {
        if (order.paymentStatus === 'paid') {
            paidOrders += 1;
            totalSpent += order.totalAmount || 0;
        }
        else if (order.paymentStatus === 'pending') {
            pendingOrders += 1;
        }
        else if (order.paymentStatus === 'failed') {
            failedOrders += 1;
        }
        if (!lastOrderAt || new Date(order.createdAt) > lastOrderAt) {
            lastOrderAt = new Date(order.createdAt);
        }
        (order.items || []).forEach((item) => {
            const game = item.gameId;
            if (game) {
                if (game.title) {
                    const existingGame = gameCount.get(game.title) || { title: game.title, count: 0 };
                    existingGame.count += 1;
                    gameCount.set(game.title, existingGame);
                }
                if (game.platform) {
                    platformCount.set(game.platform, (platformCount.get(game.platform) || 0) + 1);
                }
                if (Array.isArray(game.categories)) {
                    game.categories.forEach((category) => {
                        if (!category)
                            return;
                        const id = category.id || category._id?.toString?.() || category.toString();
                        if (!id)
                            return;
                        const name = category.name || 'دسته‌بندی';
                        const current = categoryCount.get(id) || { name, count: 0 };
                        current.count += 1;
                        categoryCount.set(id, current);
                    });
                }
            }
        });
    });
    const averageOrderValue = paidOrders > 0 ? Math.round((totalSpent / paidOrders) * 100) / 100 : 0;
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const [pageViews, clicks, events, lastVisit, topPages, priceAlerts, unreadNotifications] = await Promise.all([
        AnalyticsModel.countDocuments({ userId: userObjectId, type: 'pageview' }),
        AnalyticsModel.countDocuments({ userId: userObjectId, type: 'click' }),
        AnalyticsModel.countDocuments({ userId: userObjectId, type: 'event' }),
        AnalyticsModel.findOne({ userId: userObjectId }).sort({ timestamp: -1 }).lean(),
        AnalyticsModel.aggregate([
            { $match: { userId: userObjectId, type: 'pageview' } },
            { $group: { _id: '$path', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]),
        priceAlert_model_1.PriceAlertModel.countDocuments({ userId: userObjectId }),
        notification_model_1.NotificationModel.countDocuments({ userId: userObjectId, read: false })
    ]);
    return {
        user,
        orders: {
            totalOrders,
            paidOrders,
            pendingOrders,
            failedOrders,
            totalSpent,
            averageOrderValue,
            lastOrderAt,
            history: orders.slice(0, 10).map((order) => ({
                id: order._id.toString(),
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                createdAt: order.createdAt
            }))
        },
        purchases: {
            topCategories: Array.from(categoryCount.entries())
                .map(([id, value]) => ({ id, ...value }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 8),
            topGames: Array.from(gameCount.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5),
            platforms: Array.from(platformCount.entries()).map(([name, count]) => ({ name, count }))
        },
        analytics: {
            pageViews,
            clicks,
            events,
            lastVisitAt: lastVisit?.timestamp,
            topPages: topPages
                .filter((item) => item._id)
                .map((item) => ({
                path: item._id,
                count: item.count
            }))
        },
        alerts: {
            priceAlerts,
            unreadNotifications
        }
    };
};
exports.getUserInsights = getUserInsights;
const getUserStats = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, newUsersToday, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
        user_model_1.UserModel.countDocuments(),
        user_model_1.UserModel.countDocuments({ createdAt: { $gte: today } }),
        user_model_1.UserModel.countDocuments({ createdAt: { $gte: thisWeek } }),
        user_model_1.UserModel.countDocuments({ createdAt: { $gte: thisMonth } })
    ]);
    return {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
    };
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=user.service.js.map