import { Request, Response } from 'express';
import PrizePayout from '../models/prize-payout.model';
import { emailService } from '../services/email.service';
import { telegramService } from '../services/telegram.service';

// Get all payouts (Admin)
export const getPayouts = async (req: Request, res: Response) => {
  try {
    const { status, tournamentId, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (tournamentId) query.tournamentId = tournamentId;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payouts, total] = await Promise.all([
      PrizePayout.find(query)
        .populate('userId', 'name email gameTag')
        .populate('tournamentId', 'title')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      PrizePayout.countDocuments(query)
    ]);

    res.json({
      payouts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست پرداخت‌ها', error: error.message });
  }
};

// Process payout (Admin)
export const processPayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, transactionRef, adminNotes, failureReason } = req.body;

    const payout = await PrizePayout.findById(id);
    if (!payout) {
      return res.status(404).json({ message: 'درخواست پرداخت یافت نشد' });
    }

    if (status) payout.status = status;
    if (transactionRef) payout.transactionRef = transactionRef;
    if (adminNotes) payout.adminNotes = adminNotes;
    if (failureReason) payout.failureReason = failureReason;

    if (status === 'paid') {
      payout.paidAt = new Date();
    }

    await payout.save();

    // Send Notifications
    const user = await payout.populate('userId'); // Ensure user is populated
    const userName = (payout.userId as any).name;
    const userEmail = (payout.userId as any).email;
    const userId = (payout.userId as any)._id;

    if (status === 'paid' || status === 'failed') {
      // Email
      emailService.sendEmail({
        to: userEmail,
        subject: status === 'paid' ? '✅ واریز جایزه انجام شد' : '⚠️ مشکل در واریز جایزه',
        html: emailService.getPayoutTemplate(userName, payout.amount, status as any, failureReason)
      });

      // Telegram
      const telegramMsg = status === 'paid' 
        ? `💰 جایزه تورنمنت به مبلغ ${payout.amount.toLocaleString()} تومان واریز شد.`
        : `⚠️ واریز جایزه با مشکل مواجه شد: ${failureReason}`;
      
      telegramService.sendNotification(userId, telegramMsg);
    }

    res.json({ message: 'وضعیت پرداخت بروزرسانی شد', payout });
  } catch (error: any) {
    console.error('Error processing payout:', error);
    res.status(500).json({ message: 'خطا در پردازش پرداخت', error: error.message });
  }
};

// Request payout (User) - Usually automated, but maybe manual request needed?
// For now, let's assume payouts are created automatically when tournament ends or manually by admin.
// But if user needs to request:
export const requestPayout = async (req: Request, res: Response) => {
  // Implementation depends on flow. If automated creation, this might just update bank info.
  // Let's skip for now as admin management is priority.
  res.status(501).json({ message: 'Not implemented yet' });
};
