"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.processPayout = exports.getPayouts = void 0;
const prize_payout_model_1 = __importDefault(require("../models/prize-payout.model"));
const email_service_1 = require("../services/email.service");
const telegram_service_1 = require("../services/telegram.service");
// Get all payouts (Admin)
const getPayouts = async (req, res) => {
    try {
        const { status, tournamentId, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (tournamentId)
            query.tournamentId = tournamentId;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const [payouts, total] = await Promise.all([
            prize_payout_model_1.default.find(query)
                .populate('userId', 'name email gameTag')
                .populate('tournamentId', 'title')
                .sort('-createdAt')
                .skip(skip)
                .limit(limitNum),
            prize_payout_model_1.default.countDocuments(query)
        ]);
        res.json({
            payouts,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    }
    catch (error) {
        console.error('Error fetching payouts:', error);
        res.status(500).json({ message: 'خطا در دریافت لیست پرداخت‌ها', error: error.message });
    }
};
exports.getPayouts = getPayouts;
// Process payout (Admin)
const processPayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionRef, adminNotes, failureReason } = req.body;
        const payout = await prize_payout_model_1.default.findById(id);
        if (!payout) {
            return res.status(404).json({ message: 'درخواست پرداخت یافت نشد' });
        }
        if (status)
            payout.status = status;
        if (transactionRef)
            payout.transactionRef = transactionRef;
        if (adminNotes)
            payout.adminNotes = adminNotes;
        if (failureReason)
            payout.failureReason = failureReason;
        if (status === 'paid') {
            payout.paidAt = new Date();
        }
        await payout.save();
        // Send Notifications
        const user = await payout.populate('userId'); // Ensure user is populated
        const userName = payout.userId.name;
        const userEmail = payout.userId.email;
        const userId = payout.userId._id;
        if (status === 'paid' || status === 'failed') {
            // Email
            email_service_1.emailService.sendEmail({
                to: userEmail,
                subject: status === 'paid' ? '✅ واریز جایزه انجام شد' : '⚠️ مشکل در واریز جایزه',
                html: email_service_1.emailService.getPayoutTemplate(userName, payout.amount, status, failureReason)
            });
            // Telegram
            const telegramMsg = status === 'paid'
                ? `💰 جایزه تورنمنت به مبلغ ${payout.amount.toLocaleString()} تومان واریز شد.`
                : `⚠️ واریز جایزه با مشکل مواجه شد: ${failureReason}`;
            telegram_service_1.telegramService.sendNotification(userId, telegramMsg);
        }
        res.json({ message: 'وضعیت پرداخت بروزرسانی شد', payout });
    }
    catch (error) {
        console.error('Error processing payout:', error);
        res.status(500).json({ message: 'خطا در پردازش پرداخت', error: error.message });
    }
};
exports.processPayout = processPayout;
// Request payout (User) - Usually automated, but maybe manual request needed?
// For now, let's assume payouts are created automatically when tournament ends or manually by admin.
// But if user needs to request:
const requestPayout = async (req, res) => {
    // Implementation depends on flow. If automated creation, this might just update bank info.
    // Let's skip for now as admin management is priority.
    res.status(501).json({ message: 'Not implemented yet' });
};
exports.requestPayout = requestPayout;
//# sourceMappingURL=payout.controller.js.map