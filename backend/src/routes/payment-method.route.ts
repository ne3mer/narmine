import express from 'express';
import {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  reorderPaymentMethods
} from '../controllers/payment-method.controller';
import { adminAuth as isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Public routes (for checkout)
router.get('/', getAllPaymentMethods);

// Admin routes
router.post('/', isAdmin, createPaymentMethod);
router.put('/reorder', isAdmin, reorderPaymentMethods);
router.patch('/:id', isAdmin, updatePaymentMethod);
router.delete('/:id', isAdmin, deletePaymentMethod);

export default router;
