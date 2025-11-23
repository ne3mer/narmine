"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesReportController = exports.getDashboardAnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const getDashboardAnalyticsController = async (req, res) => {
    try {
        const analytics = await (0, analytics_service_1.getDashboardAnalytics)();
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت آمار داشبورد'
        });
    }
};
exports.getDashboardAnalyticsController = getDashboardAnalyticsController;
const getSalesReportController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (start && end && start > end) {
            return res.status(400).json({
                success: false,
                message: 'تاریخ شروع باید قبل از تاریخ پایان باشد'
            });
        }
        const report = await (0, analytics_service_1.getSalesReport)(start, end);
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت گزارش فروش'
        });
    }
};
exports.getSalesReportController = getSalesReportController;
//# sourceMappingURL=analytics.controller.js.map