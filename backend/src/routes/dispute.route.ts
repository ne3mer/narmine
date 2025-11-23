import { Router } from 'express';
import { reportDispute, resolveDispute, getDisputes } from '../controllers/dispute.controller';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Report dispute (User)
router.post('/:id/report', authenticateUser, reportDispute);

// Resolve dispute (Admin)
router.post('/:id/resolve', authenticateUser, adminAuth, resolveDispute);

// Get disputes (Admin)
router.get('/', authenticateUser, adminAuth, getDisputes);

export default router;
