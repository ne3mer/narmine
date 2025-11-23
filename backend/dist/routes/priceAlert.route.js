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
const priceAlertController = __importStar(require("../controllers/priceAlert.controller"));
const priceAlert_schema_1 = require("../schemas/priceAlert.schema");
const router = (0, express_1.Router)();
// All price alert routes require authentication
router.use(authenticateUser_1.authenticateUser);
router.post('/', (0, validateResource_1.validateResource)(priceAlert_schema_1.createPriceAlertSchema), (0, asyncHandler_1.asyncHandler)(priceAlertController.createPriceAlert));
router.get('/', (0, validateResource_1.validateResource)(priceAlert_schema_1.getUserPriceAlertsSchema), (0, asyncHandler_1.asyncHandler)(priceAlertController.getUserPriceAlerts));
router.get('/:id', (0, validateResource_1.validateResource)(priceAlert_schema_1.getPriceAlertByIdSchema), (0, asyncHandler_1.asyncHandler)(priceAlertController.getPriceAlertById));
router.patch('/:id', (0, validateResource_1.validateResource)(priceAlert_schema_1.updatePriceAlertSchema), (0, asyncHandler_1.asyncHandler)(priceAlertController.updatePriceAlert));
router.delete('/:id', (0, validateResource_1.validateResource)(priceAlert_schema_1.deletePriceAlertSchema), (0, asyncHandler_1.asyncHandler)(priceAlertController.deletePriceAlert));
exports.default = router;
//# sourceMappingURL=priceAlert.route.js.map