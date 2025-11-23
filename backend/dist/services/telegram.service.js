"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramTemplates = exports.getChatId = exports.sendTelegramMessage = exports.telegramService = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const user_model_1 = require("../models/user.model");
class TelegramService {
    bot = null;
    isInitialized = false;
    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (token) {
            this.bot = new node_telegram_bot_api_1.default(token, { polling: true });
            this.isInitialized = true;
            this.setupListeners();
            console.log('Telegram Bot initialized');
        }
        else {
            console.warn('TELEGRAM_BOT_TOKEN not found in environment variables');
        }
    }
    setupListeners() {
        if (!this.bot)
            return;
        this.bot.onText(/\/start (.+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const token = match ? match[1] : null;
            if (!token) {
                this.bot?.sendMessage(chatId, 'برای اتصال حساب کاربری، لطفا از لینک داخل سایت استفاده کنید.');
                return;
            }
            try {
                // Find user with this temporary token (we need to store it somewhere or decode it)
                // For simplicity, let's assume the token is a base64 encoded userId for now (INSECURE for prod, but ok for MVP)
                // Better approach: Store a short-lived token in Redis or DB.
                // Let's use a simple approach: Token = "LINK_" + userId (base64)
                let userId;
                try {
                    const decoded = Buffer.from(token, 'base64').toString();
                    if (!decoded.startsWith('LINK_'))
                        throw new Error('Invalid token');
                    userId = decoded.replace('LINK_', '');
                }
                catch (e) {
                    this.bot?.sendMessage(chatId, 'لینک نامعتبر است.');
                    return;
                }
                const user = await user_model_1.UserModel.findById(userId);
                if (!user) {
                    this.bot?.sendMessage(chatId, 'کاربر یافت نشد.');
                    return;
                }
                user.telegramChatId = chatId.toString();
                user.telegram = msg.chat.username || msg.chat.first_name;
                await user.save();
                this.bot?.sendMessage(chatId, `سلام ${user.name}! حساب کاربری شما با موفقیت متصل شد. 🎉\nاز این پس نوتیفیکیشن‌های تورنمنت‌ها را اینجا دریافت خواهید کرد.`);
            }
            catch (error) {
                console.error('Error linking telegram:', error);
                this.bot?.sendMessage(chatId, 'خطا در اتصال حساب کاربری.');
            }
        });
        this.bot.onText(/\/start$/, (msg) => {
            this.bot?.sendMessage(msg.chat.id, 'برای اتصال حساب کاربری، لطفا از پنل کاربری خود در سایت اقدام کنید.');
        });
    }
    async sendNotification(userId, message) {
        if (!this.bot || !this.isInitialized)
            return;
        try {
            const user = await user_model_1.UserModel.findById(userId);
            if (user && user.telegramChatId) {
                await this.bot.sendMessage(user.telegramChatId, message);
            }
        }
        catch (error) {
            console.error(`Error sending telegram message to user ${userId}:`, error);
        }
    }
    generateLinkToken(userId) {
        return Buffer.from(`LINK_${userId}`).toString('base64');
    }
    getBotUsername() {
        // This should be dynamic but for now hardcode or env
        return process.env.TELEGRAM_BOT_USERNAME || 'NextPlayArenaBot';
    }
    async sendMessage(chatId, text, options) {
        if (!this.bot || !this.isInitialized)
            return false;
        try {
            await this.bot.sendMessage(chatId, text, options);
            return true;
        }
        catch (error) {
            console.error(`Error sending telegram message to ${chatId}:`, error);
            return false;
        }
    }
}
exports.telegramService = new TelegramService();
const sendTelegramMessage = (options) => {
    return exports.telegramService.sendMessage(options.chatId, options.text, { parse_mode: options.parseMode });
};
exports.sendTelegramMessage = sendTelegramMessage;
const getChatId = (chatId) => {
    // If it's a numeric string, return it. If it's a username, we can't easily resolve it without user interaction history or DB lookup.
    // Assuming the input is already a valid chatId or we just return it as is if it looks like one.
    if (/^-?\d+$/.test(chatId))
        return chatId;
    return null; // Can't send to username directly without prior contact
};
exports.getChatId = getChatId;
exports.telegramTemplates = {
    orderConfirmation: (orderNumber, totalAmount, items) => {
        const itemsList = items.map(item => `• ${item.title} (${item.quantity} عدد)`).join('\n');
        return `🎉 <b>سفارش شما ثبت شد!</b>\n\n📦 شماره سفارش: ${orderNumber}\n💰 مبلغ کل: ${totalAmount.toLocaleString('fa-IR')} تومان\n\n🛒 اقلام:\n${itemsList}`;
    },
    orderPaid: (orderNumber, credentials, message) => {
        return `✅ <b>سفارش شما آماده است!</b>\n\n📦 شماره سفارش: ${orderNumber}\n\n🔐 <b>اطلاعات اکانت:</b>\n<code>${credentials}</code>\n\n${message || ''}`;
    },
    priceAlert: (gameTitle, currentPrice, targetPrice, gameUrl) => {
        return `📉 <b>کاهش قیمت ${gameTitle}</b>\n\nقیمت فعلی: ${currentPrice.toLocaleString('fa-IR')} تومان\nقیمت هدف: ${targetPrice.toLocaleString('fa-IR')} تومان\n\n🔗 <a href="${gameUrl}">مشاهده و خرید</a>`;
    }
};
//# sourceMappingURL=telegram.service.js.map