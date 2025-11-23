import { Router } from 'express';
import { getTelegramLink, unlinkTelegram } from '../controllers/telegram.controller';
import { authenticateUser } from '../middleware/authenticateUser';

const router = Router();

router.get('/link', authenticateUser, getTelegramLink);
router.post('/unlink', authenticateUser, unlinkTelegram);

export default router;
