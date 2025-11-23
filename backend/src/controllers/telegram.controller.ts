import { Request, Response } from 'express';
import { telegramService } from '../services/telegram.service';
import { UserModel } from '../models/user.model';

export const getTelegramLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const token = telegramService.generateLinkToken(userId);
    const botUsername = telegramService.getBotUsername();
    
    const link = `https://t.me/${botUsername}?start=${token}`;
    
    res.json({ link });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در ایجاد لینک تلگرام', error: error.message });
  }
};

export const unlinkTelegram = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    user.telegramChatId = undefined;
    user.telegram = undefined;
    await user.save();
    
    res.json({ message: 'اتصال تلگرام قطع شد' });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در قطع اتصال تلگرام', error: error.message });
  }
};
