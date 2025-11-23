"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shipping_method_controller_1 = require("../controllers/shipping-method.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
// Public routes (for checkout)
router.get('/', shipping_method_controller_1.getAllShippingMethods);
router.get('/:id', shipping_method_controller_1.getShippingMethodById);
// Admin routes
router.post('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, shipping_method_controller_1.createShippingMethod);
router.put('/reorder', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, shipping_method_controller_1.reorderShippingMethods);
router.patch('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, shipping_method_controller_1.updateShippingMethod);
router.delete('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, shipping_method_controller_1.deleteShippingMethod);
exports.default = router;
//# sourceMappingURL=shipping-method.route.js.map