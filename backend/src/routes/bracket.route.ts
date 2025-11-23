import { Router } from 'express';
import { generateBracket, getBracket } from '../controllers/bracket.controller';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Generate bracket (Admin only)
router.post('/:id/generate', authenticateUser, adminAuth, generateBracket);

// Get bracket (Public)
router.get('/:id', getBracket);

export default router;
