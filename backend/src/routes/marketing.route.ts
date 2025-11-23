import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { getMarketingSchema, updateMarketingSchema } from '../schemas/marketing.schema';
import { getMarketingSettingsHandler, updateMarketingSettingsHandler } from '../controllers/marketing.controller';

const router = Router();

router.get('/', validateResource(getMarketingSchema), asyncHandler(getMarketingSettingsHandler));
router.patch('/', adminAuth, validateResource(updateMarketingSchema), asyncHandler(updateMarketingSettingsHandler));

export default router;
