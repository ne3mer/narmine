"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPriceAlert = exports.sendOrderDelivery = exports.sendOrderConfirmation = exports.sendNotification = void 0;
const email_service_1 = require("./email.service");
const telegram_service_1 = require("./telegram.service");
const notification_model_1 = require("../models/notification.model");
const sendNotification = async (options) => {
    const results = { emailSent: false, telegramSent: false };
    // Save to database
    if (options.userId) {
        try {
            await notification_model_1.NotificationModel.create({
                userId: options.userId,
                orderId: options.orderId,
                type: options.type,
                subject: options.subject,
                message: options.message,
                read: false
            });
        }
        catch (error) {
            console.error('Failed to save notification to database:', error);
        }
    }
    // Send email
    if ((options.channel === 'email' || options.channel === 'both') && options.email) {
        let emailContent;
        // Use appropriate template based on type
        if (options.type === 'order_email' && options.orderNumber && options.totalAmount && options.items) {
            const template = email_service_1.emailTemplates.orderConfirmation(options.orderNumber, options.totalAmount, options.items);
            emailContent = {
                to: options.email,
                subject: template.subject,
                html: template.html
            };
        }
        else if (options.type === 'order_update' && options.orderNumber && options.credentials) {
            const template = email_service_1.emailTemplates.orderPaid(options.orderNumber, options.credentials, options.message);
            emailContent = {
                to: options.email,
                subject: template.subject,
                html: template.html
            };
        }
        else if (options.type === 'price_alert' && options.gameTitle && options.currentPrice && options.targetPrice && options.gameUrl) {
            const template = email_service_1.emailTemplates.priceAlert(options.gameTitle, options.currentPrice, options.targetPrice, options.gameUrl);
            emailContent = {
                to: options.email,
                subject: template.subject,
                html: template.html
            };
        }
        else {
            // Generic email
            emailContent = {
                to: options.email,
                subject: options.subject,
                html: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
          <h2>${options.subject}</h2>
          <p>${options.message.replace(/\n/g, '<br>')}</p>
        </div>`
            };
        }
        if (emailContent) {
            results.emailSent = await (0, email_service_1.sendEmail)(emailContent);
        }
    }
    // Send Telegram message
    if ((options.channel === 'telegram' || options.channel === 'both') && options.telegramChatId) {
        let telegramText;
        // Use appropriate template based on type
        if (options.type === 'order_email' && options.orderNumber && options.totalAmount && options.items) {
            telegramText = telegram_service_1.telegramTemplates.orderConfirmation(options.orderNumber, options.totalAmount, options.items);
        }
        else if (options.type === 'order_update' && options.orderNumber && options.credentials) {
            telegramText = telegram_service_1.telegramTemplates.orderPaid(options.orderNumber, options.credentials, options.message);
        }
        else if (options.type === 'price_alert' && options.gameTitle && options.currentPrice && options.targetPrice && options.gameUrl) {
            telegramText = telegram_service_1.telegramTemplates.priceAlert(options.gameTitle, options.currentPrice, options.targetPrice, options.gameUrl);
        }
        else {
            // Generic message
            telegramText = `<b>${options.subject}</b>\n\n${options.message}`;
        }
        const chatId = (0, telegram_service_1.getChatId)(options.telegramChatId);
        if (!chatId) {
            console.warn('⚠️  Could not determine Telegram chat ID');
            console.warn('   User needs to set their Telegram chat ID (numeric) in their profile');
            console.warn('   Or start a conversation with the bot if using username');
        }
        else {
            console.log(`📤 Attempting to send Telegram message to: ${chatId} (original: ${options.telegramChatId})`);
            results.telegramSent = await (0, telegram_service_1.sendTelegramMessage)({
                chatId,
                text: telegramText,
                parseMode: 'HTML'
            });
            if (!results.telegramSent) {
                console.warn(`⚠️  Failed to send Telegram notification. Check logs above for details.`);
                if (options.telegramChatId.startsWith('@')) {
                    console.warn(`   Username detected: ${options.telegramChatId}`);
                    console.warn(`   Solutions:`);
                    console.warn(`   1. User must start a conversation with the bot first (/start)`);
                    console.warn(`   2. Or use numeric Chat ID instead of username`);
                    console.warn(`   To get Chat ID: message @userinfobot or @getidsbot on Telegram`);
                }
                else {
                    console.warn(`   Make sure:`);
                    console.warn(`   1. User has started a conversation with the bot`);
                    console.warn(`   2. ChatId is correct (numeric ID)`);
                    console.warn(`   3. Bot token is valid`);
                }
            }
        }
    }
    else if ((options.channel === 'telegram' || options.channel === 'both') && !options.telegramChatId) {
        console.warn('⚠️  Telegram channel selected but telegramChatId is missing');
        console.warn('   User needs to set their Telegram chat ID in their profile');
    }
    return results;
};
exports.sendNotification = sendNotification;
// Convenience functions
const sendOrderConfirmation = async (userId, orderId, orderNumber, customerEmail, customerTelegram, totalAmount, items) => {
    return (0, exports.sendNotification)({
        userId,
        orderId,
        type: 'order_email',
        subject: `تأیید سفارش ${orderNumber}`,
        message: `سفارش شما با شماره ${orderNumber} با موفقیت ثبت شد.`,
        channel: customerTelegram ? 'both' : 'email',
        email: customerEmail,
        telegramChatId: customerTelegram,
        orderNumber,
        totalAmount,
        items
    });
};
exports.sendOrderConfirmation = sendOrderConfirmation;
const sendOrderDelivery = async (userId, orderId, orderNumber, customerEmail, customerTelegram, credentials, message) => {
    return (0, exports.sendNotification)({
        userId,
        orderId,
        type: 'order_update',
        subject: `اطلاعات اکانت سفارش ${orderNumber}`,
        message: message || 'اطلاعات اکانت شما آماده است.',
        channel: customerTelegram ? 'both' : 'email',
        email: customerEmail,
        telegramChatId: customerTelegram,
        orderNumber,
        credentials,
    });
};
exports.sendOrderDelivery = sendOrderDelivery;
const sendPriceAlert = async (userId, gameTitle, currentPrice, targetPrice, gameUrl, channel, destination) => {
    return (0, exports.sendNotification)({
        userId,
        type: 'price_alert',
        subject: `قیمت ${gameTitle} کاهش یافت`,
        message: `قیمت ${gameTitle} به ${currentPrice.toLocaleString('fa-IR')} تومان رسید.`,
        channel,
        email: channel === 'email' ? destination : undefined,
        telegramChatId: channel === 'telegram' ? destination : undefined,
        gameTitle,
        currentPrice,
        targetPrice,
        gameUrl
    });
};
exports.sendPriceAlert = sendPriceAlert;
//# sourceMappingURL=notificationSender.service.js.map