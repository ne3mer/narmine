"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = exports.emailService = void 0;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const resend = new resend_1.Resend(env_1.env.RESEND_API_KEY);
const FROM_EMAIL = 'نرمینه خواب <noreply@narmineh.com>';
class EmailService {
    serviceType;
    constructor() {
        // Use Resend if API key is available, otherwise fallback to console
        this.serviceType = env_1.env.RESEND_API_KEY ? 'resend' : 'console';
        if (this.serviceType === 'resend') {
            console.log('📧 Email Service initialized with Resend');
        }
        else {
            console.log('📧 Email Service initialized with Console (Resend not configured)');
        }
    }
    async sendEmail(options) {
        if (this.serviceType === 'resend') {
            return this.sendWithResend(options);
        }
        else {
            return this.logToConsole(options);
        }
    }
    async sendWithResend(options) {
        try {
            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: options.to,
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo
            });
            console.log(`✅ Email sent via Resend to ${options.to}`);
            return { success: true, id: result.data?.id };
        }
        catch (error) {
            console.error('❌ Resend error:', error);
            throw error;
        }
    }
    async logToConsole(options) {
        console.log('📧 [EMAIL WOULD BE SENT] ----------------');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('------------------------------------------');
        return { success: true, message: 'Email logged (Resend not configured)' };
    }
}
exports.emailService = new EmailService();
const sendEmail = (options) => exports.emailService.sendEmail(options);
exports.sendEmail = sendEmail;
// Email Templates
exports.emailTemplates = {
    orderConfirmation: (orderNumber, totalAmount, items) => ({
        subject: `تأیید سفارش ${orderNumber}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background-color: #f8f5f2; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #c9a896; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #4a3f3a; margin: 0; font-size: 24px; }
          .info { margin: 16px 0; }
          .label { font-weight: bold; color: #4a3f3a; }
          .value { color: #666; }
          ul { list-style: none; padding: 0; }
          li { padding: 8px; background: #f8f5f2; margin: 4px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 سفارش شما ثبت شد!</h1>
          </div>
          
          <div class="info">
            <p><span class="label">شماره سفارش:</span> <span class="value">${orderNumber}</span></p>
            <p><span class="label">مبلغ کل:</span> <span class="value">${totalAmount.toLocaleString('fa-IR')} تومان</span></p>
          </div>
          
          <h3 style="color: #4a3f3a;">اقلام سفارش:</h3>
          <ul>
            ${items.map(item => `<li>${item.title} - ${item.quantity} عدد</li>`).join('')}
          </ul>
          
          <div class="footer">
            <p>از خرید شما متشکریم!</p>
            <p>نرمینه خواب</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),
    orderPaid: (orderNumber, credentials, message) => ({
        subject: `اطلاعات سفارش ${orderNumber}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background-color: #f8f5f2; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #c9a896; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #4a3f3a; margin: 0; font-size: 24px; }
          .credentials { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #c9a896; }
          code { display: block; white-space: pre-wrap; font-family: monospace; color: #4a3f3a; }
          .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ سفارش شما آماده است!</h1>
          </div>
          
          <p><strong>شماره سفارش:</strong> ${orderNumber}</p>
          
          <div class="credentials">
            <p><strong>اطلاعات اکانت:</strong></p>
            <code>${credentials}</code>
          </div>
          
          ${message ? `<p>${message}</p>` : ''}
          
          <div class="footer">
            <p>نرمینه خواب</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),
    priceAlert: (gameTitle, currentPrice, targetPrice, gameUrl) => ({
        subject: `کاهش قیمت ${gameTitle} 📉`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background-color: #f8f5f2; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #c9a896; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #4a3f3a; margin: 0; font-size: 24px; }
          .button { display: inline-block; background-color: #4a3f3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px; }
          .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📉 قیمت کاهش یافت!</h1>
          </div>
          
          <p>قیمت <strong>${gameTitle}</strong> به قیمت هدف شما رسید.</p>
          <p><strong>قیمت فعلی:</strong> ${currentPrice.toLocaleString('fa-IR')} تومان</p>
          <p><strong>قیمت هدف شما:</strong> ${targetPrice.toLocaleString('fa-IR')} تومان</p>
          
          <div style="text-align: center;">
            <a href="${gameUrl}" class="button">مشاهده و خرید</a>
          </div>
          
          <div class="footer">
            <p>نرمینه خواب</p>
          </div>
        </div>
      </body>
      </html>
    `
    })
};
//# sourceMappingURL=email.service.js.map