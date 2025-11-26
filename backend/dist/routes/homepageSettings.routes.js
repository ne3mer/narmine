"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homepageSettings_model_1 = require("../models/homepageSettings.model");
const homepageContent_1 = require("../config/homepageContent");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
/**
 * GET /api/homepage-settings
 * Get current homepage settings (public endpoint)
 */
router.get('/', async (req, res) => {
    try {
        let settings = await homepageSettings_model_1.HomepageSettings.findOne();
        let contentNeedsSave = false;
        let sectionsNeedUpdate = false;
        // If no settings exist, create default
        if (!settings) {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections: homepageSettings_model_1.DEFAULT_SECTIONS,
                updatedAt: new Date(),
                content: homepageContent_1.DEFAULT_HOME_CONTENT
            });
        }
        if (!settings.content) {
            settings.content = homepageContent_1.DEFAULT_HOME_CONTENT;
            await settings.save();
        }
        if (!settings.sections || settings.sections.length === 0) {
            settings.sections = homepageSettings_model_1.DEFAULT_SECTIONS;
            sectionsNeedUpdate = true;
        }
        else {
            const existingSectionIds = new Set((settings.sections || []).map((section) => section.id));
            for (const defaultSection of homepageSettings_model_1.DEFAULT_SECTIONS) {
                if (!existingSectionIds.has(defaultSection.id)) {
                    settings.sections.push(defaultSection);
                    sectionsNeedUpdate = true;
                }
            }
            if (sectionsNeedUpdate) {
                settings.sections = settings.sections.sort((a, b) => a.order - b.order);
            }
        }
        const rawContent = settings.content?.toJSON?.() ?? settings.content ?? {};
        const normalizedContent = {
            ...rawContent,
            shippingMethods: Array.isArray(rawContent.shippingMethods) && rawContent.shippingMethods.length > 0
                ? rawContent.shippingMethods
                : homepageContent_1.DEFAULT_HOME_CONTENT.shippingMethods
        };
        if (!Array.isArray(rawContent.shippingMethods) ||
            rawContent.shippingMethods.length === 0) {
            settings.content = normalizedContent;
            contentNeedsSave = true;
        }
        if (contentNeedsSave || sectionsNeedUpdate) {
            await settings.save();
        }
        const responseSettings = settings.toObject();
        responseSettings.content = normalizedContent;
        res.json({
            success: true,
            data: responseSettings
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
        const { sections, content } = req.body;
        let settings = await homepageSettings_model_1.HomepageSettings.findOne();
        if (settings) {
            if (sections) {
                if (!Array.isArray(sections)) {
                    return res.status(400).json({ success: false, message: 'بخش‌ها باید آرایه باشند' });
                }
                for (const section of sections) {
                    if (!section.id || typeof section.enabled !== 'boolean' || typeof section.order !== 'number') {
                        return res.status(400).json({ success: false, message: 'فرمت بخش‌ها نامعتبر است' });
                    }
                }
                settings.sections = sections;
            }
            if (content) {
                settings.content = { ...settings.content?.toJSON?.() ?? settings.content, ...content };
            }
            settings.updatedAt = new Date();
            settings.updatedBy = req.user?.email || 'admin';
            await settings.save();
        }
        else {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections: sections ?? homepageSettings_model_1.DEFAULT_SECTIONS,
                content: content ?? homepageContent_1.DEFAULT_HOME_CONTENT,
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
            settings.content = homepageContent_1.DEFAULT_HOME_CONTENT;
            settings.updatedAt = new Date();
            settings.updatedBy = req.user?.email || 'admin';
            await settings.save();
        }
        else {
            settings = await homepageSettings_model_1.HomepageSettings.create({
                sections: homepageSettings_model_1.DEFAULT_SECTIONS,
                content: homepageContent_1.DEFAULT_HOME_CONTENT,
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