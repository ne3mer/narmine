import { Router } from 'express';
import { getPayouts, processPayout } from '../controllers/payout.controller';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Admin routes
router.get('/', authenticateUser, adminAuth, getPayouts);
router.patch('/:id', authenticateUser, adminAuth, processPayout);

export default router;
