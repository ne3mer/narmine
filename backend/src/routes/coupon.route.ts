import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  listCouponsController,
  getCouponController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
  validateCouponController,
  generateCodeController
} from '../controllers/coupon.controller';

const router = Router();

// Optional authentication middleware - extracts userId if token exists, but doesn't fail if no token
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
      
      (req as any).user = {
        id: (decoded.id || decoded.sub) as string,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      // Invalid token - continue without user
    }
  }
  
  next();
};

// Public route for validating coupons (optional auth)
router.post('/validate', optionalAuth, validateCouponController);

// Admin routes
router.get('/', adminAuth, listCouponsController);
router.get('/generate-code', adminAuth, generateCodeController);
router.get('/:id', adminAuth, getCouponController);
router.post('/', adminAuth, createCouponController);
router.patch('/:id', adminAuth, updateCouponController);
router.delete('/:id', adminAuth, deleteCouponController);

export default router;

