import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateUser } from '../middleware/authenticateUser';
import {
  createReviewController,
  getReviewsController,
  getGameReviewsController,
  updateReviewStatusController,
  deleteReviewController,
  getReviewStatsController
} from '../controllers/review.controller';

const router = Router();

// Public routes
router.get('/game/:gameId', getGameReviewsController); // Get approved reviews for a game
router.get('/stats', getReviewStatsController); // Get review stats (public for displaying ratings)

// Authenticated user routes
router.post('/', authenticateUser, createReviewController);

// Admin routes - require both user authentication and admin key
router.get('/', authenticateUser, adminAuth, getReviewsController);
router.get('/admin/stats', authenticateUser, adminAuth, getReviewStatsController); // Admin stats (with more details)
router.patch('/:id/status', authenticateUser, adminAuth, updateReviewStatusController);
router.delete('/:id', authenticateUser, adminAuth, deleteReviewController);

export default router;

