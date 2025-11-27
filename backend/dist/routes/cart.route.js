"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const authenticateUser_1 = require("../middleware/authenticateUser");
const cart_schema_1 = require("../schemas/cart.schema");
const cart_controller_1 = require("../controllers/cart.controller");
const router = (0, express_1.Router)();
// All cart routes require authentication
router.use(authenticateUser_1.authenticateUser);
router.get('/', (0, validateResource_1.validateResource)(cart_schema_1.getCartSchema), (0, asyncHandler_1.asyncHandler)(cart_controller_1.getCart));
router.post('/add', (0, validateResource_1.validateResource)(cart_schema_1.addToCartSchema), (0, asyncHandler_1.asyncHandler)(cart_controller_1.addToCart));
router.patch('/:itemId', (0, validateResource_1.validateResource)(cart_schema_1.updateCartItemSchema), (0, asyncHandler_1.asyncHandler)(cart_controller_1.updateCartItem));
router.delete('/:itemId', (0, validateResource_1.validateResource)(cart_schema_1.removeFromCartSchema), (0, asyncHandler_1.asyncHandler)(cart_controller_1.removeFromCart));
router.delete('/', (0, validateResource_1.validateResource)(cart_schema_1.clearCartSchema), (0, asyncHandler_1.asyncHandler)(cart_controller_1.clearCart));
exports.default = router;
//# sourceMappingURL=cart.route.js.map