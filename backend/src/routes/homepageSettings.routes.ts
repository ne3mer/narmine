import { Router, Request, Response } from 'express';
import { HomepageSettings, DEFAULT_SECTIONS } from '../models/homepageSettings.model';
import { DEFAULT_HOME_CONTENT } from '../config/homepageContent';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * GET /api/homepage-settings
 * Get current homepage settings (public endpoint)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await HomepageSettings.findOne();
    let contentNeedsSave = false;
    
    // If no settings exist, create default
    if (!settings) {
      settings = await HomepageSettings.create({
        sections: DEFAULT_SECTIONS,
        updatedAt: new Date(),
        content: DEFAULT_HOME_CONTENT
      });
    }

    if (!settings.content) {
      settings.content = DEFAULT_HOME_CONTENT;
      await settings.save();
    }

    const rawContent = (settings.content as any)?.toJSON?.() ?? settings.content ?? {};
    const normalizedContent = {
      ...rawContent,
      shippingMethods:
        Array.isArray(rawContent.shippingMethods) && rawContent.shippingMethods.length > 0
          ? rawContent.shippingMethods
          : DEFAULT_HOME_CONTENT.shippingMethods
    };

    if (
      !Array.isArray(rawContent.shippingMethods) ||
      rawContent.shippingMethods.length === 0
    ) {
      settings.content = normalizedContent as any;
      contentNeedsSave = true;
    }

    if (contentNeedsSave) {
      await settings.save();
    }

    const responseSettings = settings.toObject();
    responseSettings.content = normalizedContent;

    res.json({
      success: true,
      data: responseSettings
    });
  } catch (error) {
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
router.put('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const { sections, content } = req.body;

    let settings = await HomepageSettings.findOne();

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
        settings.content = { ...(settings.content as any)?.toJSON?.() ?? settings.content, ...content };
      }
      settings.updatedAt = new Date();
      settings.updatedBy = (req as any).user?.email || 'admin';
      await settings.save();
    } else {
      settings = await HomepageSettings.create({
        sections: sections ?? DEFAULT_SECTIONS,
        content: content ?? DEFAULT_HOME_CONTENT,
        updatedAt: new Date(),
        updatedBy: (req as any).user?.email || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'تنظیمات با موفقیت ذخیره شد',
      data: settings
    });
  } catch (error) {
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
router.post('/reset', adminAuth, async (req: Request, res: Response) => {
  try {
    let settings = await HomepageSettings.findOne();

    if (settings) {
      settings.sections = DEFAULT_SECTIONS;
      settings.content = DEFAULT_HOME_CONTENT;
      settings.updatedAt = new Date();
      settings.updatedBy = (req as any).user?.email || 'admin';
      await settings.save();
    } else {
      settings = await HomepageSettings.create({
        sections: DEFAULT_SECTIONS,
        content: DEFAULT_HOME_CONTENT,
        updatedAt: new Date(),
        updatedBy: (req as any).user?.email || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'تنظیمات به حالت پیش‌فرض بازگردانده شد',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting homepage settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بازگردانی تنظیمات'
    });
  }
});

export default router;
