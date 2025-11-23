import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { adminAuth } from '../middleware/adminAuth';
import * as pageController from '../controllers/page.controller';

const router = Router();

// Public routes
router.get('/:slug', asyncHandler(pageController.getPageBySlug));

// Admin routes
router.get('/', adminAuth, asyncHandler(pageController.getAllPages));
router.put('/:slug', adminAuth, asyncHandler(pageController.updatePage));
router.post('/', adminAuth, asyncHandler(pageController.createPage));

export default router;
