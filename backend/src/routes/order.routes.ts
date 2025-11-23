import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validateResource } from '../middleware/validateResource';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';
import {
  adminSearchOrdersSchema,
  createOrderSchema,
  getOrdersSchema,
  getOrderByIdSchema,
  notifyOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
  updateDeliverySchema,
  acknowledgeDeliverySchema
} from '../schemas/order.schema';

const router = Router();

// Admin: search and list orders
router.get(
  '/admin',
  adminAuth,
  validateResource(adminSearchOrdersSchema),
  orderController.searchAdminOrders
);

// Admin: notify customer via email (simulation)
router.post(
  '/:id/notify',
  adminAuth,
  validateResource(notifyOrderSchema),
  orderController.notifyCustomer
);

// Create order (supports both authenticated and guest users)
router.post('/', validateResource(createOrderSchema), orderController.createOrder);

// Get user's orders (requires authentication)
router.get('/', authenticateUser, validateResource(getOrdersSchema), orderController.getUserOrders);

// Get specific order (requires authentication)
router.get('/:id', authenticateUser, validateResource(getOrderByIdSchema), orderController.getOrderById);

// Update order status (admin only)
router.patch('/:id/status', adminAuth, validateResource(updateOrderStatusSchema), orderController.updateOrderStatus);

router.patch(
  '/:id/delivery',
  adminAuth,
  validateResource(updateDeliverySchema),
  orderController.updateOrderDeliveryHandler
);

router.patch(
  '/:id/ack',
  authenticateUser,
  validateResource(acknowledgeDeliverySchema),
  orderController.acknowledgeOrderDeliveryHandler
);

// Legacy admin endpoint: fetch all orders
router.get('/admin/all', adminAuth, orderController.getAllOrders);

// Verify payment (ZarinPal callback)
router.post(
  '/verify-payment',
  validateResource(verifyPaymentSchema),
  orderController.verifyPayment
);

// Update warranty (admin only)
router.patch(
  '/:id/items/:itemId/warranty',
  adminAuth,
  orderController.updateWarranty
);

export default router;
