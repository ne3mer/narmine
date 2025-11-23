import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { UserModel } from '../models/user.model';
import TournamentParticipant from '../models/tournament-participant.model';
import { emailService } from '../services/email.service';
import { telegramService } from '../services/telegram.service';

export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const notifications = await notificationService.getUserNotifications(userId, limit);
  res.json({ data: notifications });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const count = await notificationService.getUnreadNotificationCount(userId);
  res.json({ data: { count } });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const notification = await notificationService.markNotificationAsRead(id, userId);
  res.json({ message: 'اعلان به عنوان خوانده شده علامت‌گذاری شد', data: notification });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  await notificationService.markAllNotificationsAsRead(userId);
  res.json({ message: 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند' });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  await notificationService.deleteNotification(id, userId);
  res.status(204).send();
};

export const sendAdminNotification = async (req: Request, res: Response) => {
  try {
    const { type, target, targetId, subject, message } = req.body;
    
    let users: any[] = [];

    // 1. Fetch Target Users
    if (target === 'all') {
      users = await UserModel.find({});
    } else if (target === 'tournament' && targetId) {
      const participants = await TournamentParticipant.find({ tournamentId: targetId }).populate('userId');
      users = participants.map(p => p.userId).filter(u => u);
    } else if (target === 'user' && targetId) {
      const user = await UserModel.findById(targetId);
      if (user) users = [user];
    }

    if (users.length === 0) {
      return res.status(404).json({ message: 'هیچ کاربری یافت نشد' });
    }

    // 2. Send Messages
    const results = {
      total: users.length,
      email: 0,
      telegram: 0,
      errors: 0
    };

    const promises = users.map(async (user) => {
      try {
        // Send Email
        if ((type === 'email' || type === 'both') && user.email) {
          await emailService.sendEmail({
            to: user.email,
            subject: subject || 'پیام جدید از نکست‌پلی آرنا',
            html: `<div dir="rtl" style="font-family: Tahoma; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>`
          });
          results.email++;
        }

        // Send Telegram
        if ((type === 'telegram' || type === 'both') && user.telegramChatId) {
          await telegramService.sendNotification(user._id, message);
          results.telegram++;
        }
      } catch (err) {
        console.error(`Error sending to user ${user._id}:`, err);
        results.errors++;
      }
    });

    await Promise.all(promises);

    res.json({
      message: 'پیام‌ها با موفقیت ارسال شدند',
      results
    });
  } catch (error: any) {
    console.error('Error sending admin notification:', error);
    res.status(500).json({ message: 'خطا در ارسال پیام', error: error.message });
  }
};

