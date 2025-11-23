"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController = __importStar(require("../controllers/order.controller"));
const validateResource_1 = require("../middleware/validateResource");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const order_schema_1 = require("../schemas/order.schema");
const router = (0, express_1.Router)();
// Admin: search and list orders
router.get('/admin', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(order_schema_1.adminSearchOrdersSchema), orderController.searchAdminOrders);
// Admin: notify customer via email (simulation)
router.post('/:id/notify', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(order_schema_1.notifyOrderSchema), orderController.notifyCustomer);
// Create order (supports both authenticated and guest users)
router.post('/', (0, validateResource_1.validateResource)(order_schema_1.createOrderSchema), orderController.createOrder);
// Get user's orders (requires authentication)
router.get('/', authenticateUser_1.authenticateUser, (0, validateResource_1.validateResource)(order_schema_1.getOrdersSchema), orderController.getUserOrders);
// Get specific order (requires authentication)
router.get('/:id', authenticateUser_1.authenticateUser, (0, validateResource_1.validateResource)(order_schema_1.getOrderByIdSchema), orderController.getOrderById);
// Update order status (admin only)
router.patch('/:id/status', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(order_schema_1.updateOrderStatusSchema), orderController.updateOrderStatus);
router.patch('/:id/delivery', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(order_schema_1.updateDeliverySchema), orderController.updateOrderDeliveryHandler);
router.patch('/:id/ack', authenticateUser_1.authenticateUser, (0, validateResource_1.validateResource)(order_schema_1.acknowledgeDeliverySchema), orderController.acknowledgeOrderDeliveryHandler);
// Legacy admin endpoint: fetch all orders
router.get('/admin/all', adminAuth_1.adminAuth, orderController.getAllOrders);
// Verify payment (ZarinPal callback)
router.post('/verify-payment', (0, validateResource_1.validateResource)(order_schema_1.verifyPaymentSchema), orderController.verifyPayment);
// Update warranty (admin only)
router.patch('/:id/items/:itemId/warranty', adminAuth_1.adminAuth, orderController.updateWarranty);
exports.default = router;
//# sourceMappingURL=order.routes.js.map