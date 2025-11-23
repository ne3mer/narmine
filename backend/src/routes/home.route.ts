import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { getHomeContentHandler, updateHomeContentHandler } from '../controllers/homeContent.controller';
import { getHomeContentSchema, updateHomeContentSchema } from '../schemas/homeContent.schema';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', validateResource(getHomeContentSchema), asyncHandler(getHomeContentHandler));
router.patch('/', adminAuth, validateResource(updateHomeContentSchema), asyncHandler(updateHomeContentHandler));

export default router;
