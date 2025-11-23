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
exports.trackBannerClick = exports.trackBannerView = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getBannersForPage = exports.getAllBanners = exports.createBanner = void 0;
const bannerService = __importStar(require("../services/banner.service"));
const createBanner = async (req, res) => {
    try {
        const banner = await bannerService.createBanner(req.body);
        res.status(201).json({
            message: 'بنر با موفقیت ایجاد شد',
            data: banner
        });
    }
    catch (error) {
        console.error('Error creating banner:', error);
        throw error;
    }
};
exports.createBanner = createBanner;
const getAllBanners = async (req, res) => {
    const activeOnly = req.query.active === 'true';
    const banners = await bannerService.getAllBanners(activeOnly);
    res.json({ data: banners });
};
exports.getAllBanners = getAllBanners;
const getBannersForPage = async (req, res) => {
    const { page } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const banners = await bannerService.getBannersForPage(page, userId, userRole);
    res.json({ data: banners });
};
exports.getBannersForPage = getBannersForPage;
const getBannerById = async (req, res) => {
    const { id } = req.params;
    const banner = await bannerService.getBannerById(id);
    res.json({ data: banner });
};
exports.getBannerById = getBannerById;
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await bannerService.updateBanner(id, req.body);
        res.json({
            message: 'بنر به‌روزرسانی شد',
            data: banner
        });
    }
    catch (error) {
        console.error('Error updating banner:', error);
        throw error; // Let error handler middleware handle it
    }
};
exports.updateBanner = updateBanner;
const deleteBanner = async (req, res) => {
    const { id } = req.params;
    await bannerService.deleteBanner(id);
    res.status(204).send();
};
exports.deleteBanner = deleteBanner;
const trackBannerView = async (req, res) => {
    const { id } = req.params;
    await bannerService.incrementBannerViews(id);
    res.json({ message: 'View tracked' });
};
exports.trackBannerView = trackBannerView;
const trackBannerClick = async (req, res) => {
    const { id } = req.params;
    await bannerService.incrementBannerClicks(id);
    res.json({ message: 'Click tracked' });
};
exports.trackBannerClick = trackBannerClick;
//# sourceMappingURL=banner.controller.js.map