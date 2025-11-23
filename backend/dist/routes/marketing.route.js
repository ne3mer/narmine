"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const marketing_schema_1 = require("../schemas/marketing.schema");
const marketing_controller_1 = require("../controllers/marketing.controller");
const router = (0, express_1.Router)();
router.get('/', (0, validateResource_1.validateResource)(marketing_schema_1.getMarketingSchema), (0, asyncHandler_1.asyncHandler)(marketing_controller_1.getMarketingSettingsHandler));
router.patch('/', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(marketing_schema_1.updateMarketingSchema), (0, asyncHandler_1.asyncHandler)(marketing_controller_1.updateMarketingSettingsHandler));
exports.default = router;
//# sourceMappingURL=marketing.route.js.map