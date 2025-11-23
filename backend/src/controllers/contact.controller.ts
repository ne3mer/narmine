import type { Request, Response } from 'express';
import { sendContactEmail, sendContactConfirmation } from '../services/resend.service';

export const sendContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً تمام فیلدهای الزامی را پر کنید'
      });
    }

    // Send email to admin
    await sendContactEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    // Send confirmation to user
    await sendContactConfirmation(email, name);

    res.json({
      success: true,
      message: 'پیام شما با موفقیت ارسال شد'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید'
    });
  }
};
