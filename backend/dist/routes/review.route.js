"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const authenticateUser_1 = require("../middleware/authenticateUser");
const review_controller_1 = require("../controllers/review.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/game/:gameId', review_controller_1.getGameReviewsController); // Get approved reviews for a game
router.get('/stats', review_controller_1.getReviewStatsController); // Get review stats (public for displaying ratings)
// Authenticated user routes
router.post('/', authenticateUser_1.authenticateUser, review_controller_1.createReviewController);
// Admin routes - require both user authentication and admin key
router.get('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, review_controller_1.getReviewsController);
router.get('/admin/stats', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, review_controller_1.getReviewStatsController); // Admin stats (with more details)
router.patch('/:id/status', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, review_controller_1.updateReviewStatusController);
router.delete('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, review_controller_1.deleteReviewController);
exports.default = router;
//# sourceMappingURL=review.route.js.map