"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkTelegram = exports.getTelegramLink = void 0;
const telegram_service_1 = require("../services/telegram.service");
const user_model_1 = require("../models/user.model");
const getTelegramLink = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = telegram_service_1.telegramService.generateLinkToken(userId);
        const botUsername = telegram_service_1.telegramService.getBotUsername();
        const link = `https://t.me/${botUsername}?start=${token}`;
        res.json({ link });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در ایجاد لینک تلگرام', error: error.message });
    }
};
exports.getTelegramLink = getTelegramLink;
const unlinkTelegram = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد' });
        }
        user.telegramChatId = undefined;
        user.telegram = undefined;
        await user.save();
        res.json({ message: 'اتصال تلگرام قطع شد' });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در قطع اتصال تلگرام', error: error.message });
    }
};
exports.unlinkTelegram = unlinkTelegram;
//# sourceMappingURL=telegram.controller.js.map