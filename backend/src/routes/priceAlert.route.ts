import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { authenticateUser } from '../middleware/authenticateUser';
import * as priceAlertController from '../controllers/priceAlert.controller';
import {
  createPriceAlertSchema,
  getUserPriceAlertsSchema,
  getPriceAlertByIdSchema,
  updatePriceAlertSchema,
  deletePriceAlertSchema
} from '../schemas/priceAlert.schema';

const router = Router();

// All price alert routes require authentication
router.use(authenticateUser);

router.post('/', validateResource(createPriceAlertSchema), asyncHandler(priceAlertController.createPriceAlert));
router.get('/', validateResource(getUserPriceAlertsSchema), asyncHandler(priceAlertController.getUserPriceAlerts));
router.get('/:id', validateResource(getPriceAlertByIdSchema), asyncHandler(priceAlertController.getPriceAlertById));
router.patch('/:id', validateResource(updatePriceAlertSchema), asyncHandler(priceAlertController.updatePriceAlert));
router.delete('/:id', validateResource(deletePriceAlertSchema), asyncHandler(priceAlertController.deletePriceAlert));

export default router;

