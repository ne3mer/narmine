import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';
import {
  createGameRequestSchema,
  updateGameRequestStatusSchema,
  getGameRequestsSchema,
  deleteGameRequestSchema
} from '../schemas/gameRequest.schema';
import {
  createGameRequest,
  getUserGameRequests,
  getAllGameRequests,
  updateGameRequestStatus,
  deleteGameRequest
} from '../controllers/gameRequest.controller';

const router = Router();

// User routes
router.post('/', authenticateUser, validateResource(createGameRequestSchema), asyncHandler(createGameRequest));
router.get('/', authenticateUser, asyncHandler(getUserGameRequests));

// Admin routes
router.get('/all', authenticateUser, adminAuth, validateResource(getGameRequestsSchema), asyncHandler(getAllGameRequests));
router.patch('/:id', authenticateUser, adminAuth, validateResource(updateGameRequestStatusSchema), asyncHandler(updateGameRequestStatus));
router.delete('/:id', authenticateUser, adminAuth, validateResource(deleteGameRequestSchema), asyncHandler(deleteGameRequest));

export default router;
