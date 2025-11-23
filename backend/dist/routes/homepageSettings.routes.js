"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homepageSettings_model_1 = require("../models/homepageSettings.model");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
/**
 * GET /api/homepage-settings
 * Get current homepage settings (public endpoint)
 */
router.get('/', async (req, res) => {
    try {
        let settings = await homepageSettings_model_1.HomepageSettings.findOne();
        // If no settings exist, create default
        if (!settings) {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections: homepageSettings_model_1.DEFAULT_SECTIONS,
                updatedAt: new Date()
            });
        }
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Error fetching homepage settings:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت تنظیمات صفحه اصلی'
        });
    }
});
/**
 * PUT /api/homepage-settings
 * Update homepage settings (admin only)
 */
router.put('/', adminAuth_1.adminAuth, async (req, res) => {
    try {
        const { sections } = req.body;
        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                message: 'بخش‌ها باید یک آرایه باشند'
            });
        }
        // Validate sections
        for (const section of sections) {
            if (!section.id || typeof section.enabled !== 'boolean' || typeof section.order !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'فرمت بخش‌ها نامعتبر است'
                });
            }
        }
        let settings = await homepageSettings_model_1.HomepageSettings.findOne();
        if (settings) {
            settings.sections = sections;
            settings.updatedAt = new Date();
            settings.updatedBy = req.user?.email || 'admin';
            await settings.save();
        }
        else {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections,
                updatedAt: new Date(),
                updatedBy: req.user?.email || 'admin'
            });
        }
        res.json({
            success: true,
            message: 'تنظیمات با موفقیت ذخیره شد',
            data: settings
        });
    }
    catch (error) {
        console.error('Error updating homepage settings:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ذخیره تنظیمات'
        });
    }
});
/**
 * POST /api/homepage-settings/reset
 * Reset to default settings (admin only)
 */
router.post('/reset', adminAuth_1.adminAuth, async (req, res) => {
    try {
        let settings = await homepageSettings_model_1.HomepageSettings.findOne();
        if (settings) {
            settings.sections = homepageSettings_model_1.DEFAULT_SECTIONS;
            settings.updatedAt = new Date();
            settings.updatedBy = req.user?.email || 'admin';
            await settings.save();
        }
        else {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections: homepageSettings_model_1.DEFAULT_SECTIONS,
                updatedAt: new Date(),
                updatedBy: req.user?.email || 'admin'
            });
        }
        res.json({
            success: true,
            message: 'تنظیمات به حالت پیش‌فرض بازگردانده شد',
            data: settings
        });
    }
    catch (error) {
        console.error('Error resetting homepage settings:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بازگردانی تنظیمات'
        });
    }
});
exports.default = router;
//# sourceMappingURL=homepageSettings.routes.js.map