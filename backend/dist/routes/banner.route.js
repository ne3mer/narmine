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
const bannerController = __importStar(require("../controllers/banner.controller"));
const banner_schema_1 = require("../schemas/banner.schema");
const router = (0, express_1.Router)();
// Public routes
router.get('/page/:page', (0, validateResource_1.validateResource)(banner_schema_1.getBannersForPageSchema), (0, asyncHandler_1.asyncHandler)(bannerController.getBannersForPage));
router.post('/:id/view', (0, validateResource_1.validateResource)(banner_schema_1.trackBannerViewSchema), (0, asyncHandler_1.asyncHandler)(bannerController.trackBannerView));
router.post('/:id/click', (0, validateResource_1.validateResource)(banner_schema_1.trackBannerClickSchema), (0, asyncHandler_1.asyncHandler)(bannerController.trackBannerClick));
// Admin routes
router.use(adminAuth_1.adminAuth);
router.post('/', (0, validateResource_1.validateResource)(banner_schema_1.createBannerSchema), (0, asyncHandler_1.asyncHandler)(bannerController.createBanner));
router.get('/', (0, validateResource_1.validateResource)(banner_schema_1.getAllBannersSchema), (0, asyncHandler_1.asyncHandler)(bannerController.getAllBanners));
router.get('/:id', (0, validateResource_1.validateResource)(banner_schema_1.getBannerByIdSchema), (0, asyncHandler_1.asyncHandler)(bannerController.getBannerById));
router.patch('/:id', (0, validateResource_1.validateResource)(banner_schema_1.updateBannerSchema), (0, asyncHandler_1.asyncHandler)(bannerController.updateBanner));
router.delete('/:id', (0, validateResource_1.validateResource)(banner_schema_1.deleteBannerSchema), (0, asyncHandler_1.asyncHandler)(bannerController.deleteBanner));
exports.default = router;
//# sourceMappingURL=banner.route.js.map