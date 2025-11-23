"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const homeContent_controller_1 = require("../controllers/homeContent.controller");
const homeContent_schema_1 = require("../schemas/homeContent.schema");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.get('/', (0, validateResource_1.validateResource)(homeContent_schema_1.getHomeContentSchema), (0, asyncHandler_1.asyncHandler)(homeContent_controller_1.getHomeContentHandler));
router.patch('/', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(homeContent_schema_1.updateHomeContentSchema), (0, asyncHandler_1.asyncHandler)(homeContent_controller_1.updateHomeContentHandler));
exports.default = router;
//# sourceMappingURL=home.route.js.map