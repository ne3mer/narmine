"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const gameRequest_schema_1 = require("../schemas/gameRequest.schema");
const gameRequest_controller_1 = require("../controllers/gameRequest.controller");
const router = (0, express_1.Router)();
// User routes
router.post('/', authenticateUser_1.authenticateUser, (0, validateResource_1.validateResource)(gameRequest_schema_1.createGameRequestSchema), (0, asyncHandler_1.asyncHandler)(gameRequest_controller_1.createGameRequest));
router.get('/', authenticateUser_1.authenticateUser, (0, asyncHandler_1.asyncHandler)(gameRequest_controller_1.getUserGameRequests));
// Admin routes
router.get('/all', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(gameRequest_schema_1.getGameRequestsSchema), (0, asyncHandler_1.asyncHandler)(gameRequest_controller_1.getAllGameRequests));
router.patch('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(gameRequest_schema_1.updateGameRequestStatusSchema), (0, asyncHandler_1.asyncHandler)(gameRequest_controller_1.updateGameRequestStatus));
router.delete('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(gameRequest_schema_1.deleteGameRequestSchema), (0, asyncHandler_1.asyncHandler)(gameRequest_controller_1.deleteGameRequest));
exports.default = router;
//# sourceMappingURL=gameRequest.route.js.map