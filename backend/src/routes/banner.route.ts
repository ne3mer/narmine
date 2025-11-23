import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateUser } from '../middleware/authenticateUser';
import * as bannerController from '../controllers/banner.controller';
import {
  createBannerSchema,
  getAllBannersSchema,
  getBannersForPageSchema,
  getBannerByIdSchema,
  updateBannerSchema,
  deleteBannerSchema,
  trackBannerViewSchema,
  trackBannerClickSchema
} from '../schemas/banner.schema';

const router = Router();

// Public routes
router.get('/page/:page', validateResource(getBannersForPageSchema), asyncHandler(bannerController.getBannersForPage));
router.post('/:id/view', validateResource(trackBannerViewSchema), asyncHandler(bannerController.trackBannerView));
router.post('/:id/click', validateResource(trackBannerClickSchema), asyncHandler(bannerController.trackBannerClick));

// Admin routes
router.use(adminAuth);

router.post('/', validateResource(createBannerSchema), asyncHandler(bannerController.createBanner));
router.get('/', validateResource(getAllBannersSchema), asyncHandler(bannerController.getAllBanners));
router.get('/:id', validateResource(getBannerByIdSchema), asyncHandler(bannerController.getBannerById));
router.patch('/:id', validateResource(updateBannerSchema), asyncHandler(bannerController.updateBanner));
router.delete('/:id', validateResource(deleteBannerSchema), asyncHandler(bannerController.deleteBanner));

export default router;

