import { Router, Request, Response } from 'express';
import { HomepageSettings, DEFAULT_SECTIONS, HomepageSettingsDocument } from '../models/homepageSettings.model';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * GET /api/homepage-settings
 * Get current homepage settings (public endpoint)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    // If no settings exist, create default
    if (!settings) {
      settings = await HomepageSettings.create({
        sections: DEFAULT_SECTIONS,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: settings
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

    let settings = await HomepageSettings.findOne();

    if (settings) {
      settings.sections = sections;
      settings.updatedAt = new Date();
      settings.updatedBy = (req as any).user?.email || 'admin';
      await settings.save();
    } else {
      settings = await HomepageSettings.create({
        sections,
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
      settings.updatedAt = new Date();
      settings.updatedBy = (req as any).user?.email || 'admin';
      await settings.save();
    } else {
      settings = await HomepageSettings.create({
        sections: DEFAULT_SECTIONS,
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
