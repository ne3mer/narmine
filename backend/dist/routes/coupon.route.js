"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const coupon_controller_1 = require("../controllers/coupon.controller");
const router = (0, express_1.Router)();
// Optional authentication middleware - extracts userId if token exists, but doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = {
                id: (decoded.id || decoded.sub),
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            // Invalid token - continue without user
        }
    }
    next();
};
// Public route for validating coupons (optional auth)
router.post('/validate', optionalAuth, coupon_controller_1.validateCouponController);
// Admin routes
router.get('/', adminAuth_1.adminAuth, coupon_controller_1.listCouponsController);
router.get('/generate-code', adminAuth_1.adminAuth, coupon_controller_1.generateCodeController);
router.get('/:id', adminAuth_1.adminAuth, coupon_controller_1.getCouponController);
router.post('/', adminAuth_1.adminAuth, coupon_controller_1.createCouponController);
router.patch('/:id', adminAuth_1.adminAuth, coupon_controller_1.updateCouponController);
router.delete('/:id', adminAuth_1.adminAuth, coupon_controller_1.deleteCouponController);
exports.default = router;
//# sourceMappingURL=coupon.route.js.map