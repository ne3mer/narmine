import express from 'express';
import {
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  reorderShippingMethods
} from '../controllers/shipping-method.controller';
import { authenticateUser as authenticate } from '../middleware/authenticateUser';
import { adminAuth as isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Public routes (for checkout)
router.get('/', getAllShippingMethods);
router.get('/:id', getShippingMethodById);

// Admin routes
router.post('/', isAdmin, createShippingMethod);
router.put('/reorder', isAdmin, reorderShippingMethods);
router.patch('/:id', isAdmin, updateShippingMethod);
router.delete('/:id', isAdmin, deleteShippingMethod);

export default router;
