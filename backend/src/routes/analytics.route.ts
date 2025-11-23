import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateUser } from '../middleware/authenticateUser';
import {
  getDashboardAnalyticsController,
  getSalesReportController
} from '../controllers/analytics.controller';

// Import the new analytics controller (JavaScript file)
const analyticsController = require('../../controllers/analyticsController');

const router = Router();

// Public routes (for tracking - no auth required)
router.post('/pageview', analyticsController.trackPageView);
router.post('/click', analyticsController.trackClick);
router.post('/event', analyticsController.trackEvent);

// Admin routes - require both user authentication and admin key
router.get('/dashboard', authenticateUser, adminAuth, getDashboardAnalyticsController);
router.get('/sales', authenticateUser, adminAuth, getSalesReportController);

// New analytics viewing routes (admin only)
router.get('/overview', authenticateUser, adminAuth, analyticsController.getOverview);
router.get('/pageviews', authenticateUser, adminAuth, analyticsController.getPageViews);
router.get('/clicks', authenticateUser, adminAuth, analyticsController.getClicks);
router.get('/popular-pages', authenticateUser, adminAuth, analyticsController.getPopularPages);
router.get('/user-journey', authenticateUser, adminAuth, analyticsController.getUserJourney);

export default router;

