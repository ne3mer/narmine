const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes (for tracking)
router.post('/pageview', analyticsController.trackPageView);
router.post('/click', analyticsController.trackClick);
router.post('/event', analyticsController.trackEvent);

// Admin-only routes (for viewing analytics)
router.get('/overview', protect, adminOnly, analyticsController.getOverview);
router.get('/pageviews', protect, adminOnly, analyticsController.getPageViews);
router.get('/clicks', protect, adminOnly, analyticsController.getClicks);
router.get('/popular-pages', protect, adminOnly, analyticsController.getPopularPages);
router.get('/user-journey', protect, adminOnly, analyticsController.getUserJourney);

module.exports = router;
