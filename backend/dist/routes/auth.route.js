"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validateResource_1 = require("../middleware/validateResource");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_schema_1 = require("../schemas/auth.schema");
const router = (0, express_1.Router)();
router.post('/register', (0, validateResource_1.validateResource)(auth_schema_1.registerSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.register));
router.post('/login', (0, validateResource_1.validateResource)(auth_schema_1.loginSchema), (0, asyncHandler_1.asyncHandler)(auth_controller_1.login));
exports.default = router;
//# sourceMappingURL=auth.route.js.map