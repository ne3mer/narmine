import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.middleware';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Upload single image (admin only)
router.post('/image', adminAuth, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لطفاً یک تصویر انتخاب کنید' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'تصویر با موفقیت آپلود شد',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'خطا در آپلود تصویر' });
  }
});

export default router;
