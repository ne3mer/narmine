"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const authenticateUser_1 = require("../middleware/authenticateUser");
const analytics_controller_1 = require("../controllers/analytics.controller");
// Import the new analytics controller (JavaScript file)
const analyticsController = require('../../controllers/analyticsController');
const router = (0, express_1.Router)();
// Public routes (for tracking - no auth required)
router.post('/pageview', analyticsController.trackPageView);
router.post('/click', analyticsController.trackClick);
router.post('/event', analyticsController.trackEvent);
// Admin routes - require both user authentication and admin key
router.get('/dashboard', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analytics_controller_1.getDashboardAnalyticsController);
router.get('/sales', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analytics_controller_1.getSalesReportController);
// New analytics viewing routes (admin only)
router.get('/overview', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analyticsController.getOverview);
router.get('/pageviews', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analyticsController.getPageViews);
router.get('/clicks', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analyticsController.getClicks);
router.get('/popular-pages', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analyticsController.getPopularPages);
router.get('/user-journey', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, analyticsController.getUserJourney);
exports.default = router;
//# sourceMappingURL=analytics.route.js.map