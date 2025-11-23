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
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const notificationController = __importStar(require("../controllers/notification.controller"));
const notification_schema_1 = require("../schemas/notification.schema");
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(authenticateUser_1.authenticateUser);
router.get('/', (0, validateResource_1.validateResource)(notification_schema_1.getUserNotificationsSchema), (0, asyncHandler_1.asyncHandler)(notificationController.getUserNotifications));
router.get('/unread-count', (0, validateResource_1.validateResource)(notification_schema_1.getUnreadCountSchema), (0, asyncHandler_1.asyncHandler)(notificationController.getUnreadCount));
router.patch('/:id/read', (0, validateResource_1.validateResource)(notification_schema_1.markAsReadSchema), (0, asyncHandler_1.asyncHandler)(notificationController.markAsRead));
router.patch('/read-all', (0, validateResource_1.validateResource)(notification_schema_1.markAllAsReadSchema), (0, asyncHandler_1.asyncHandler)(notificationController.markAllAsRead));
router.delete('/:id', (0, validateResource_1.validateResource)(notification_schema_1.deleteNotificationSchema), (0, asyncHandler_1.asyncHandler)(notificationController.deleteNotification));
// Admin Routes
router.post('/send', adminAuth_1.adminAuth, (0, asyncHandler_1.asyncHandler)(notificationController.sendAdminNotification));
exports.default = router;
//# sourceMappingURL=notification.route.js.map