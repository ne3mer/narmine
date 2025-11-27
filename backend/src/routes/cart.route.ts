import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { authenticateUser } from '../middleware/authenticateUser';
import {
  addToCartSchema,
  getCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  clearCartSchema
} from '../schemas/cart.schema';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(authenticateUser);

router.get('/', validateResource(getCartSchema), asyncHandler(getCart));
router.post('/add', validateResource(addToCartSchema), asyncHandler(addToCart));
router.patch('/:itemId', validateResource(updateCartItemSchema), asyncHandler(updateCartItem));
router.delete('/:itemId', validateResource(removeFromCartSchema), asyncHandler(removeFromCart));
router.delete('/', validateResource(clearCartSchema), asyncHandler(clearCart));

export default router;
