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
const adminAuth_1 = require("../middleware/adminAuth");
const userController = __importStar(require("../controllers/user.controller"));
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// All user management routes require admin authentication
router.use(adminAuth_1.adminAuth);
router.get('/', (0, validateResource_1.validateResource)(user_schema_1.getAllUsersSchema), (0, asyncHandler_1.asyncHandler)(userController.getAllUsers));
router.get('/stats', (0, asyncHandler_1.asyncHandler)(userController.getUserStats));
router.post('/messages', (0, validateResource_1.validateResource)(user_schema_1.sendUserMessageSchema), (0, asyncHandler_1.asyncHandler)(userController.sendUserMessage));
router.get('/:id/insights', (0, validateResource_1.validateResource)(user_schema_1.getUserInsightsSchema), (0, asyncHandler_1.asyncHandler)(userController.getUserInsights));
router.get('/:id', (0, validateResource_1.validateResource)(user_schema_1.getUserByIdSchema), (0, asyncHandler_1.asyncHandler)(userController.getUserById));
router.patch('/:id/role', (0, validateResource_1.validateResource)(user_schema_1.updateUserRoleSchema), (0, asyncHandler_1.asyncHandler)(userController.updateUserRole));
router.patch('/:id', (0, validateResource_1.validateResource)(user_schema_1.updateUserSchema), (0, asyncHandler_1.asyncHandler)(userController.updateUser));
router.delete('/:id', (0, validateResource_1.validateResource)(user_schema_1.deleteUserSchema), (0, asyncHandler_1.asyncHandler)(userController.deleteUser));
exports.default = router;
//# sourceMappingURL=user.route.js.map