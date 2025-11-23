import type { Request, Response } from 'express';
import { getDashboardAnalytics, getSalesReport } from '../services/analytics.service';

export const getDashboardAnalyticsController = async (req: Request, res: Response) => {
  try {
    const analytics = await getDashboardAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت آمار داشبورد'
    });
  }
};

export const getSalesReportController = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    if (start && end && start > end) {
      return res.status(400).json({
        success: false,
        message: 'تاریخ شروع باید قبل از تاریخ پایان باشد'
      });
    }
    
    const report = await getSalesReport(start, end);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت گزارش فروش'
    });
  }
};

