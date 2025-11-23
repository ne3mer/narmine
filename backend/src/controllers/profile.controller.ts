import type { Request, Response } from 'express';
import { updateUser } from '../services/user.service';
import { ApiError } from '../middleware/errorHandler';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
      });
    }

    const { name, phone, telegram } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (telegram !== undefined) updates.telegram = telegram;

    const user = await updateUser(userId, updates);
    
    res.json({
      success: true,
      message: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
      data: user
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی اطلاعات'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
      });
    }

    const { getUserById } = await import('../services/user.service');
    const user = await getUserById(userId);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت اطلاعات'
    });
  }
};

export const updateArenaSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
      });
    }

    const { gameTag, bankInfo } = req.body;

    const updates: any = {};
    if (gameTag) updates.gameTag = gameTag;
    if (bankInfo) updates.bankInfo = bankInfo;

    const user = await updateUser(userId, updates);
    
    res.json({
      success: true,
      message: 'تنظیمات آرنا با موفقیت به‌روزرسانی شد',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی تنظیمات'
    });
  }
};
