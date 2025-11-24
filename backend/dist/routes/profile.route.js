"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateUser_1 = require("../middleware/authenticateUser");
const validateResource_1 = require("../middleware/validateResource");
const asyncHandler_1 = require("../utils/asyncHandler");
const profile_schema_1 = require("../schemas/profile.schema");
const profile_controller_1 = require("../controllers/profile.controller");
const router = (0, express_1.Router)();
// All routes require user authentication
router.use(authenticateUser_1.authenticateUser);
router.get('/', (0, asyncHandler_1.asyncHandler)(profile_controller_1.getProfile));
router.patch('/', (0, validateResource_1.validateResource)(profile_schema_1.updateProfileSchema), (0, asyncHandler_1.asyncHandler)(profile_controller_1.updateProfile));
exports.default = router;
//# sourceMappingURL=profile.route.js.map