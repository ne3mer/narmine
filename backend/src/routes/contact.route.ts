import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as contactController from '../controllers/contact.controller';

const router = Router();

router.post('/', asyncHandler(contactController.sendContactForm));

export default router;
