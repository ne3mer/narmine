import { OrderModel } from '../models/order.model';
import { GameModel } from '../models/game.model';
import { UserModel } from '../models/user.model';
import { ReviewModel } from '../models/review.model';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductPerformance {
  gameId: string;
  title: string;
  sales: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  averageOrderValue: number;
  revenueByDate: RevenueData[];
  topProducts: ProductPerformance[];
  revenueByStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
  ordersByStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
}

export interface DashboardAnalytics {
  // Overview stats
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  
  // Today's stats
  todayRevenue: number;
  todayOrders: number;
  todayNewUsers: number;
  
  // This month stats
  monthRevenue: number;
  monthOrders: number;
  monthNewUsers: number;
  
  // Revenue trends (last 30 days)
  revenueTrend: RevenueData[];
  
  // Order status breakdown
  orderStatusBreakdown: {
    paid: number;
    pending: number;
    failed: number;
  };
  
  // Top products
  topProducts: ProductPerformance[];
  
  // Conversion metrics
  conversionRate: number;
  averageOrderValue: number;
  
  // Growth metrics
  revenueGrowth: number; // percentage
  ordersGrowth: number; // percentage
  usersGrowth: number; // percentage
}

const getDateRange = (days: number): DateRange => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
};

const getTodayRange = (): DateRange => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

const getMonthRange = (): DateRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

const getPreviousPeriod = (startDate: Date, endDate: Date): DateRange => {
  const duration = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - duration);
  return { startDate: prevStartDate, endDate: prevEndDate };
};

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const todayRange = getTodayRange();
  const monthRange = getMonthRange();
  const last30Days = getDateRange(30);
  const prev30Days = getPreviousPeriod(last30Days.startDate, last30Days.endDate);

  // Get all counts
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenueResult,
    todayOrders,
    todayRevenueResult,
    monthOrders,
    monthRevenueResult,
    todayNewUsers,
    monthNewUsers,
    paidOrders,
    pendingOrders,
    failedOrders,
    revenueTrendData,
    topProductsData,
    prevMonthRevenueResult,
    prevMonthOrders,
    prevMonthUsers
  ] = await Promise.all([
    // Total counts
    OrderModel.countDocuments(),
    UserModel.countDocuments(),
    GameModel.countDocuments(),
    OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    
    // Today's stats
    OrderModel.countDocuments({
      createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
    }),
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    
    // Month stats
    OrderModel.countDocuments({
      createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
    }),
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    
    // New users
    UserModel.countDocuments({
      createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate }
    }),
    UserModel.countDocuments({
      createdAt: { $gte: monthRange.startDate, $lte: monthRange.endDate }
    }),
    
    // Order status breakdown
    OrderModel.countDocuments({ paymentStatus: 'paid' }),
    OrderModel.countDocuments({ paymentStatus: 'pending' }),
    OrderModel.countDocuments({ paymentStatus: 'failed' }),
    
    // Revenue trend (last 30 days)
    OrderModel.aggregate([
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
    OrderModel.aggregate([
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
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: prev30Days.startDate, $lte: prev30Days.endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    OrderModel.countDocuments({
      createdAt: { $gte: prev30Days.startDate, $lte: prev30Days.endDate }
    }),
    UserModel.countDocuments({
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
  const revenueTrend: RevenueData[] = revenueTrendData.map((item: any) => ({
    date: item._id,
    revenue: item.revenue || 0,
    orders: item.orders || 0
  }));

  // Process top products with ratings
  const topProductsPromises = topProductsData.map(async (item: any) => {
    const gameId = item._id?.toString();
    if (!gameId) return null;

    const game = await GameModel.findById(gameId);
    if (!game) return null;

    const reviews = await ReviewModel.find({
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
    .filter((p): p is ProductPerformance => p !== null)
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

export const getSalesReport = async (
  startDate?: Date,
  endDate?: Date
): Promise<SalesReport> => {
  const range = startDate && endDate
    ? { startDate, endDate }
    : getDateRange(30);

  const [
    totalRevenueResult,
    totalOrders,
    paidOrders,
    pendingOrders,
    failedOrders,
    revenueByDateData,
    topProductsData
  ] = await Promise.all([
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: range.startDate, $lte: range.endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    OrderModel.countDocuments({
      createdAt: { $gte: range.startDate, $lte: range.endDate }
    }),
    OrderModel.countDocuments({
      paymentStatus: 'paid',
      createdAt: { $gte: range.startDate, $lte: range.endDate }
    }),
    OrderModel.countDocuments({
      paymentStatus: 'pending',
      createdAt: { $gte: range.startDate, $lte: range.endDate }
    }),
    OrderModel.countDocuments({
      paymentStatus: 'failed',
      createdAt: { $gte: range.startDate, $lte: range.endDate }
    }),
    OrderModel.aggregate([
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
    OrderModel.aggregate([
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

  const revenueByDate: RevenueData[] = revenueByDateData.map((item: any) => ({
    date: item._id,
    revenue: item.revenue || 0,
    orders: item.orders || 0
  }));

  // Get revenue by status
  const revenueByStatusResult = await OrderModel.aggregate([
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
    paid: revenueByStatusResult.find((r: any) => r._id === 'paid')?.revenue || 0,
    pending: revenueByStatusResult.find((r: any) => r._id === 'pending')?.revenue || 0,
    failed: revenueByStatusResult.find((r: any) => r._id === 'failed')?.revenue || 0
  };

  // Process top products
  const topProductsPromises = topProductsData.map(async (item: any) => {
    const gameId = item._id?.toString();
    if (!gameId) return null;

    const game = await GameModel.findById(gameId);
    if (!game) return null;

    const reviews = await ReviewModel.find({
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
    .filter((p): p is ProductPerformance => p !== null);

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

