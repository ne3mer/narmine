"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementBannerClicks = exports.incrementBannerViews = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getBannersForPage = exports.getAllBanners = exports.createBanner = void 0;
const banner_model_1 = require("../models/banner.model");
const errorHandler_1 = require("../middleware/errorHandler");
const createBanner = async (input) => {
    try {
        const banner = await banner_model_1.BannerModel.create(input);
        return banner;
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            throw new errorHandler_1.ApiError(400, `خطا در اعتبارسنجی: ${error.message}`);
        }
        throw error;
    }
};
exports.createBanner = createBanner;
const getAllBanners = async (activeOnly) => {
    const query = {};
    if (activeOnly) {
        query.active = true;
    }
    return banner_model_1.BannerModel.find(query).sort({ priority: -1, createdAt: -1 });
};
exports.getAllBanners = getAllBanners;
const getBannersForPage = async (page, userId, userRole) => {
    const now = new Date();
    // Build query with proper $and/$or structure
    const query = {
        active: true,
        $and: [
            {
                $or: [
                    { displayOn: 'all' },
                    { displayOn: page },
                    { displayOn: { $in: [page, 'all'] } }
                ]
            },
            {
                $or: [
                    { 'displayRules.startDate': { $exists: false } },
                    { 'displayRules.startDate': { $lte: now } }
                ]
            },
            {
                $or: [
                    { 'displayRules.endDate': { $exists: false } },
                    { 'displayRules.endDate': { $gte: now } }
                ]
            }
        ]
    };
    const banners = await banner_model_1.BannerModel.find(query).sort({ priority: -1 });
    // Filter by user rules
    return banners.filter(banner => {
        if (!banner.displayRules)
            return true;
        const rules = banner.displayRules;
        // Check user authentication status
        if (rules.showToUsers && rules.showToUsers.length > 0) {
            const isAuthenticated = !!userId;
            if (rules.showToUsers.includes('authenticated') && !isAuthenticated)
                return false;
            if (rules.showToUsers.includes('guest') && isAuthenticated)
                return false;
        }
        // Check user role
        if (rules.showToRoles && rules.showToRoles.length > 0 && userRole) {
            if (!rules.showToRoles.includes(userRole))
                return false;
        }
        // Check view/click limits
        if (rules.maxViews && banner.views && banner.views >= rules.maxViews)
            return false;
        if (rules.maxClicks && banner.clicks && banner.clicks >= rules.maxClicks)
            return false;
        return true;
    });
};
exports.getBannersForPage = getBannersForPage;
const getBannerById = async (id) => {
    const banner = await banner_model_1.BannerModel.findById(id);
    if (!banner) {
        throw new errorHandler_1.ApiError(404, 'بنر یافت نشد');
    }
    return banner;
};
exports.getBannerById = getBannerById;
const updateBanner = async (id, updates) => {
    try {
        const banner = await banner_model_1.BannerModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!banner) {
            throw new errorHandler_1.ApiError(404, 'بنر یافت نشد');
        }
        return banner;
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            throw new errorHandler_1.ApiError(400, `خطا در اعتبارسنجی: ${error.message}`);
        }
        if (error.name === 'CastError') {
            throw new errorHandler_1.ApiError(400, 'شناسه بنر نامعتبر است');
        }
        throw error;
    }
};
exports.updateBanner = updateBanner;
const deleteBanner = async (id) => {
    const banner = await banner_model_1.BannerModel.findByIdAndDelete(id);
    if (!banner) {
        throw new errorHandler_1.ApiError(404, 'بنر یافت نشد');
    }
    return { message: 'بنر حذف شد' };
};
exports.deleteBanner = deleteBanner;
const incrementBannerViews = async (id) => {
    await banner_model_1.BannerModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
};
exports.incrementBannerViews = incrementBannerViews;
const incrementBannerClicks = async (id) => {
    await banner_model_1.BannerModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
};
exports.incrementBannerClicks = incrementBannerClicks;
//# sourceMappingURL=banner.service.js.map