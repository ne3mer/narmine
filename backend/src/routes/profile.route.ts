import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticateUser';
import { validateResource } from '../middleware/validateResource';
import { asyncHandler } from '../utils/asyncHandler';
import { updateProfileSchema } from '../schemas/profile.schema';
import { updateProfile, getProfile, updateArenaSettings } from '../controllers/profile.controller';

const router = Router();

// All routes require user authentication
router.use(authenticateUser);

router.get('/', asyncHandler(getProfile));
router.patch('/', validateResource(updateProfileSchema), asyncHandler(updateProfile));
router.patch('/arena-settings', asyncHandler(updateArenaSettings));

export default router;

