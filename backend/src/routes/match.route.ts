import { Router } from 'express';
import { submitMatchResult, getMatchDetails } from '../controllers/match.controller';
import { authenticateUser } from '../middleware/authenticateUser';

const router = Router();

router.get('/:id', authenticateUser, getMatchDetails);
router.post('/:id/submit', authenticateUser, submitMatchResult);

export default router;
