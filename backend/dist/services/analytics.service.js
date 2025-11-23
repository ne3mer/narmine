"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesReport = exports.getDashboardAnalytics = void 0;
const order_model_1 = require("../models/order.model");
const game_model_1 = require("../models/game.model");
const user_model_1 = require("../models/user.model");
const review_model_1 = require("../models/review.model");
const getDateRange = (days) => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
};
const getTodayRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
};
const getMonthRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
};
const getPreviousPeriod = (startDate, endDate) => {
    const duration = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - duration);
    return { startDate: prevStartDate, endDate: prevEndDate };
};
const getDashboardAnalytics = async () => {
    const todayRange = getTodayRange();
    const monthRange = getMonthRange();
    const last30Days = getDateRange(30);
    const prev30Days = getPreviousPeriod(last30Days.startDate, last30Days.endDate);
    // Get all counts
    const [totalOrders, totalUsers, totalProducts, totalRevenueResult, todayOrders, todayRevenueResult, monthOrders, monthRevenueResult, todayNewUsers, monthNewUsers, paidOrders, pendingOrders, failedOrders, revenueTrendData, topProductsData, prevMonthRevenueResult, prevMonthOrders, prevMonthUsers] = await Promise.all([
        // Total counts
        order_model_1.OrderModel.countDocuments(),
        user_model_1.UserModel.countDocuments(),
        game_model_1.GameModel.countDocuments(),
        order_model_1.OrderModel.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        // Today's stats
        order_model_1.OrderModel.countDocuments({
            createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
        }),
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        // Month stats
        order_model_1.OrderModel.countDocuments({
            createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
        }),
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        // New users
        user_model_1.UserModel.countDocuments({
            createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
        }),
        user_model_1.UserModel.countDocuments({
            createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
        }),
        // Order status breakdown
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'paid' }),
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'pending' }),
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'failed' }),
        // Revenue trend (last 30 days)
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: last30Days.startDate, $lte: last30Days.endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        // Top products
        order_model_1.OrderModel.aggregate([
            {
                $match: { paymentStatus: 'paid' }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.gameId',
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.pricePaid', '$items.quantity'] } }
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 10 }
        ]),
        // Previous period for growth calculation
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: prev30Days.startDate, $lte: prev30Days.endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        order_model_1.OrderModel.countDocuments({
            createdAt: { $gte: prev30Days.startDate, $lte: prev30Days.endDate }
        }),
        user_model_1.UserModel.countDocuments({
            createdAt: { $gte: prev30Days.startDate, $lte: prev30Days.endDate }
        })
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const monthRevenue = monthRevenueResult[0]?.total || 0;
    const prevMonthRevenue = prevMonthRevenueResult[0]?.total || 0;
    // Calculate growth percentages
    const revenueGrowth = prevMonthRevenue > 0
        ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        : monthRevenue > 0 ? 100 : 0;
    const ordersGrowth = prevMonthOrders > 0
        ? ((monthOrders - prevMonthOrders) / prevMonthOrders) * 100
        : monthOrders > 0 ? 100 : 0;
    const usersGrowth = prevMonthUsers > 0
        ? ((monthNewUsers - prevMonthUsers) / prevMonthUsers) * 100
        : monthNewUsers > 0 ? 100 : 0;
    // Process revenue trend
    const revenueTrend = revenueTrendData.map((item) => ({
        date: item._id,
        revenue: item.revenue || 0,
        orders: item.orders || 0
    }));
    // Process top products with ratings
    const topProductsPromises = topProductsData.map(async (item) => {
        const gameId = item._id?.toString();
        if (!gameId)
            return null;
        const game = await game_model_1.GameModel.findById(gameId);
        if (!game)
            return null;
        const reviews = await review_model_1.ReviewModel.find({
            gameId,
            status: 'approved'
        });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return {
            gameId,
            title: game.title,
            sales: item.sales || 0,
            revenue: item.revenue || 0,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
        };
    });
    const topProducts = (await Promise.all(topProductsPromises))
        .filter((p) => p !== null)
        .slice(0, 10);
    // Calculate conversion rate (paid orders / total orders)
    const conversionRate = totalOrders > 0
        ? (paidOrders / totalOrders) * 100
        : 0;
    // Calculate average order value
    const averageOrderValue = paidOrders > 0
        ? totalRevenue / paidOrders
        : 0;
    return {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        todayRevenue,
        todayOrders,
        todayNewUsers,
        monthRevenue,
        monthOrders,
        monthNewUsers,
        revenueTrend,
        orderStatusBreakdown: {
            paid: paidOrders,
            pending: pendingOrders,
            failed: failedOrders
        },
        topProducts,
        conversionRate: Math.round(conversionRate * 10) / 10,
        averageOrderValue: Math.round(averageOrderValue),
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        usersGrowth: Math.round(usersGrowth * 10) / 10
    };
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const getSalesReport = async (startDate, endDate) => {
    const range = startDate && endDate
        ? { startDate, endDate }
        : getDateRange(30);
    const [totalRevenueResult, totalOrders, paidOrders, pendingOrders, failedOrders, revenueByDateData, topProductsData] = await Promise.all([
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: range.startDate, $lte: range.endDate }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        order_model_1.OrderModel.countDocuments({
            createdAt: { $gte: range.startDate, $lte: range.endDate }
        }),
        order_model_1.OrderModel.countDocuments({
            paymentStatus: 'paid',
            createdAt: { $gte: range.startDate, $lte: range.endDate }
        }),
        order_model_1.OrderModel.countDocuments({
            paymentStatus: 'pending',
            createdAt: { $gte: range.startDate, $lte: range.endDate }
        }),
        order_model_1.OrderModel.countDocuments({
            paymentStatus: 'failed',
            createdAt: { $gte: range.startDate, $lte: range.endDate }
        }),
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: range.startDate, $lte: range.endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
                        }
                    },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        order_model_1.OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: range.startDate, $lte: range.endDate }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.gameId',
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.pricePaid', '$items.quantity'] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 20 }
        ])
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;
    const revenueByDate = revenueByDateData.map((item) => ({
        date: item._id,
        revenue: item.revenue || 0,
        orders: item.orders || 0
    }));
    // Get revenue by status
    const revenueByStatusResult = await order_model_1.OrderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: range.startDate, $lte: range.endDate }
            }
        },
        {
            $group: {
                _id: '$paymentStatus',
                revenue: { $sum: '$totalAmount' }
            }
        }
    ]);
    const revenueByStatus = {
        paid: revenueByStatusResult.find((r) => r._id === 'paid')?.revenue || 0,
        pending: revenueByStatusResult.find((r) => r._id === 'pending')?.revenue || 0,
        failed: revenueByStatusResult.find((r) => r._id === 'failed')?.revenue || 0
    };
    // Process top products
    const topProductsPromises = topProductsData.map(async (item) => {
        const gameId = item._id?.toString();
        if (!gameId)
            return null;
        const game = await game_model_1.GameModel.findById(gameId);
        if (!game)
            return null;
        const reviews = await review_model_1.ReviewModel.find({
            gameId,
            status: 'approved'
        });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return {
            gameId,
            title: game.title,
            sales: item.sales || 0,
            revenue: item.revenue || 0,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
        };
    });
    const topProducts = (await Promise.all(topProductsPromises))
        .filter((p) => p !== null);
    return {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        paidOrders,
        pendingOrders,
        failedOrders,
        averageOrderValue: Math.round(averageOrderValue),
        revenueByDate,
        topProducts,
        revenueByStatus,
        ordersByStatus: {
            paid: paidOrders,
            pending: pendingOrders,
            failed: failedOrders
        }
    };
};
exports.getSalesReport = getSalesReport;
//# sourceMappingURL=analytics.service.js.map