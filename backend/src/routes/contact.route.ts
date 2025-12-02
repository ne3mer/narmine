import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as contactController from '../controllers/contact.controller';

const router = Router();

import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

router.post('/', asyncHandler(contactController.sendContactForm));

// Admin routes
router.get('/', authenticateUser, adminAuth, asyncHandler(contactController.getContactMessages));
router.patch('/:id/read', authenticateUser, adminAuth, asyncHandler(contactController.markMessageAsRead));
router.delete('/:id', authenticateUser, adminAuth, asyncHandler(contactController.deleteMessage));

export default router;
