"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPage = exports.updatePage = exports.getPageBySlug = exports.getAllPages = void 0;
const page_model_1 = require("../models/page.model");
const errorHandler_1 = require("../middleware/errorHandler");
const getAllPages = async () => {
    return page_model_1.PageModel.find().select('-__v').sort({ pageSlug: 1 });
};
exports.getAllPages = getAllPages;
const getPageBySlug = async (slug) => {
    const page = await page_model_1.PageModel.findOne({ pageSlug: slug, isActive: true }).select('-__v');
    if (!page) {
        throw new errorHandler_1.ApiError(404, 'صفحه یافت نشد');
    }
    return page;
};
exports.getPageBySlug = getPageBySlug;
const updatePage = async (slug, updates, userId) => {
    const page = await page_model_1.PageModel.findOneAndUpdate({ pageSlug: slug }, {
        ...updates,
        pageSlug: slug,
        updatedBy: userId
    }, { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true });
    if (!page) {
        throw new errorHandler_1.ApiError(404, 'صفحه یافت نشد');
    }
    return page;
};
exports.updatePage = updatePage;
const createPage = async (pageData, userId) => {
    const page = new page_model_1.PageModel({
        ...pageData,
        updatedBy: userId
    });
    await page.save();
    return page;
};
exports.createPage = createPage;
//# sourceMappingURL=page.service.js.map