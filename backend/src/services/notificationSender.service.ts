import { sendEmail, emailTemplates } from './email.service';
import { sendTelegramMessage, telegramTemplates, getChatId } from './telegram.service';
import { NotificationModel } from '../models/notification.model';
import { env } from '../config/env';

export type NotificationChannel = 'email' | 'telegram' | 'both';

export interface SendNotificationOptions {
  userId?: string;
  orderId?: string;
  type: 'order_email' | 'order_update' | 'price_alert' | 'system';
  subject: string;
  message: string;
  channel: NotificationChannel;
  email?: string;
  telegramChatId?: string;
  // For order notifications
  orderNumber?: string;
  totalAmount?: number;
  items?: Array<{ title: string; quantity: number; price?: number }>;
  credentials?: string;
  // For price alerts
  gameTitle?: string;
  currentPrice?: number;
  targetPrice?: number;
  gameUrl?: string;
}

export const sendNotification = async (options: SendNotificationOptions): Promise<{ emailSent: boolean; telegramSent: boolean }> => {
  const results = { emailSent: false, telegramSent: false };

  // Save to database
  if (options.userId) {
    try {
      await NotificationModel.create({
        userId: options.userId,
        orderId: options.orderId,
        type: options.type,
        subject: options.subject,
        message: options.message,
        read: false
      });
    } catch (error) {
      console.error('Failed to save notification to database:', error);
    }
  }

  // Send email
  if ((options.channel === 'email' || options.channel === 'both') && options.email) {
    let emailContent;
    
    // Use appropriate template based on type
    if (options.type === 'order_email' && options.orderNumber && options.totalAmount && options.items) {
      const template = emailTemplates.orderConfirmation(
        options.orderNumber,
        options.totalAmount,
        options.items
      );
      emailContent = {
        to: options.email,
        subject: template.subject,
        html: template.html
      };
    } else if (options.type === 'order_update' && options.orderNumber && options.credentials) {
      const template = emailTemplates.orderPaid(
        options.orderNumber,
        options.credentials,
        options.message
      );
      emailContent = {
        to: options.email,
        subject: template.subject,
        html: template.html
      };
    } else if (options.type === 'price_alert' && options.gameTitle && options.currentPrice && options.targetPrice && options.gameUrl) {
      const template = emailTemplates.priceAlert(
        options.gameTitle,
        options.currentPrice,
        options.targetPrice,
        options.gameUrl
      );
      emailContent = {
        to: options.email,
        subject: template.subject,
        html: template.html
      };
    } else {
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
      results.emailSent = await sendEmail(emailContent);
    }
  }

  // Send Telegram message
  if ((options.channel === 'telegram' || options.channel === 'both') && options.telegramChatId) {
    let telegramText;
    
    // Use appropriate template based on type
    if (options.type === 'order_email' && options.orderNumber && options.totalAmount && options.items) {
      telegramText = telegramTemplates.orderConfirmation(
        options.orderNumber,
        options.totalAmount,
        options.items
      );
    } else if (options.type === 'order_update' && options.orderNumber && options.credentials) {
      telegramText = telegramTemplates.orderPaid(
        options.orderNumber,
        options.credentials,
        options.message
      );
    } else if (options.type === 'price_alert' && options.gameTitle && options.currentPrice && options.targetPrice && options.gameUrl) {
      telegramText = telegramTemplates.priceAlert(
        options.gameTitle,
        options.currentPrice,
        options.targetPrice,
        options.gameUrl
      );
    } else {
      // Generic message
      telegramText = `<b>${options.subject}</b>\n\n${options.message}`;
    }

    const chatId = getChatId(options.telegramChatId);
    
    if (!chatId) {
      console.warn('⚠️  Could not determine Telegram chat ID');
      console.warn('   User needs to set their Telegram chat ID (numeric) in their profile');
      console.warn('   Or start a conversation with the bot if using username');
    } else {
      console.log(`📤 Attempting to send Telegram message to: ${chatId} (original: ${options.telegramChatId})`);
      results.telegramSent = await sendTelegramMessage({
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
        } else {
          console.warn(`   Make sure:`);
          console.warn(`   1. User has started a conversation with the bot`);
          console.warn(`   2. ChatId is correct (numeric ID)`);
          console.warn(`   3. Bot token is valid`);
        }
      }
    }
  } else if ((options.channel === 'telegram' || options.channel === 'both') && !options.telegramChatId) {
    console.warn('⚠️  Telegram channel selected but telegramChatId is missing');
    console.warn('   User needs to set their Telegram chat ID in their profile');
  }

  return results;
};

// Convenience functions
export const sendOrderConfirmation = async (
  userId: string | undefined,
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  customerTelegram: string | undefined,
  totalAmount: number,
  items: Array<{ title: string; quantity: number; price: number }>
) => {
  return sendNotification({
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

export const sendOrderDelivery = async (
  userId: string | undefined,
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  customerTelegram: string | undefined,
  credentials: string,
  message?: string
) => {
  return sendNotification({
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

export const sendPriceAlert = async (
  userId: string | undefined,
  gameTitle: string,
  currentPrice: number,
  targetPrice: number,
  gameUrl: string,
  channel: 'email' | 'telegram',
  destination: string
) => {
  return sendNotification({
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

