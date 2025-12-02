import type { Request, Response } from 'express';
import Contact from '../models/contact.model';
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

    // Save to database
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });
    await newContact.save();

    // Send email to admin
    try {
      await sendContactEmail({
        name,
        email,
        phone,
        subject,
        message
      });
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError);
      // Continue execution even if email fails
    }

    // Send confirmation to user
    try {
      await sendContactConfirmation(email, name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'پیام شما با موفقیت ثبت و ارسال شد'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید'
    });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پیام‌ها'
    });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json(message);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی وضعیت پیام'
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ success: true, message: 'پیام حذف شد' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف پیام'
    });
  }
};
