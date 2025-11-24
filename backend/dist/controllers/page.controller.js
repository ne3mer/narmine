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
exports.createPage = exports.updatePage = exports.getPageBySlug = exports.getAllPages = void 0;
const pageService = __importStar(require("../services/page.service"));
const getAllPages = async (_req, res) => {
    const pages = await pageService.getAllPages();
    res.json({ data: pages });
};
exports.getAllPages = getAllPages;
const getPageBySlug = async (req, res) => {
    const { slug } = req.params;
    const page = await pageService.getPageBySlug(slug);
    res.json({ data: page });
};
exports.getPageBySlug = getPageBySlug;
const updatePage = async (req, res) => {
    const { slug } = req.params;
    const userId = req.user?.id;
    const page = await pageService.updatePage(slug, req.body, userId);
    res.json({
        message: 'صفحه با موفقیت به‌روزرسانی شد',
        data: page
    });
};
exports.updatePage = updatePage;
const createPage = async (req, res) => {
    const userId = req.user?.id;
    const page = await pageService.createPage(req.body, userId);
    res.status(201).json({
        message: 'صفحه با موفقیت ایجاد شد',
        data: page
    });
};
exports.createPage = createPage;
//# sourceMappingURL=page.controller.js.map