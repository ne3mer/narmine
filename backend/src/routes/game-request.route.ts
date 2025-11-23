import express from 'express';
import {
  createGameRequest,
  getUserGameRequests,
  getAllGameRequests,
  updateGameRequestStatus,
  deleteGameRequest
} from '../controllers/game-request.controller';
import { authenticateUser as authenticate } from '../middleware/authenticateUser';
import { adminAuth as isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// User routes
router.post('/', authenticate, createGameRequest);
router.get('/', authenticate, getUserGameRequests);
router.delete('/:id', authenticate, deleteGameRequest);

// Admin routes
router.get('/all', authenticate, isAdmin, getAllGameRequests);
router.patch('/:id', authenticate, isAdmin, updateGameRequestStatus);

export default router;
