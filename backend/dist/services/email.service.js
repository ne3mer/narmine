"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter;
    constructor() {
        // For development, we can use Ethereal Email or just log to console if no env vars
        // For production, use SMTP settings from env
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log('Email Service initialized with SMTP');
        }
        else {
            // Fallback to console logging for dev without SMTP
            console.log('Email Service initialized in DEV mode (logging only)');
            this.transporter = {
                sendMail: async (mailOptions) => {
                    console.log('📧 [EMAIL SENT] ----------------');
                    console.log(`To: ${mailOptions.to}`);
                    console.log(`Subject: ${mailOptions.subject}`);
                    console.log('--------------------------------');
                    return { messageId: 'mock-id' };
                }
            };
        }
    }
    async sendEmail({ to, subject, html }) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"NextPlay Arena" <noreply@nextplay.ir>',
                to,
                subject,
                html,
            });
            return info;
        }
        catch (error) {
            console.error('Error sending email:', error);
            // Don't throw, just log error so main flow isn't interrupted
        }
    }
    getRegistrationTemplate(userName, tournamentTitle) {
        return `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #7c3aed;">ثبت‌نام موفقیت‌آمیز! 🎉</h2>
        <p>سلام ${userName} عزیز،</p>
        <p>ثبت‌نام شما در تورنمنت <strong>${tournamentTitle}</strong> با موفقیت انجام شد.</p>
        <p>لطفاً برای تکمیل فرآیند و پرداخت هزینه ورودی (در صورت وجود)، به پنل کاربری خود مراجعه کنید.</p>
        <br>
        <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ورود به پنل کاربری</a>
        <br><br>
        <p>با آرزوی موفقیت،<br>تیم نکست‌پلی آرنا</p>
      </div>
    `;
    }
    getPayoutTemplate(userName, amount, status, reason) {
        const isPaid = status === 'paid';
        return `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: ${isPaid ? '#10b981' : '#f43f5e'};">
          ${isPaid ? 'واریز جایزه انجام شد! 💰' : 'مشکل در واریز جایزه ⚠️'}
        </h2>
        <p>سلام ${userName} عزیز،</p>
        ${isPaid ? `
          <p>مبلغ <strong>${amount.toLocaleString()} تومان</strong> به حساب شما واریز شد.</p>
          <p>از شرکت شما در مسابقات سپاسگزاریم.</p>
        ` : `
          <p>متاسفانه درخواست واریز مبلغ <strong>${amount.toLocaleString()} تومان</strong> با مشکل مواجه شد.</p>
          <p>دلیل: ${reason || 'نامشخص'}</p>
          <p>لطفاً اطلاعات بانکی خود را بررسی کرده و مجدداً درخواست دهید.</p>
        `}
        <br>
        <p>تیم نکست‌پلی آرنا</p>
      </div>
    `;
    }
}
exports.emailService = new EmailService();
const sendEmail = (options) => exports.emailService.sendEmail(options);
exports.sendEmail = sendEmail;
exports.emailTemplates = {
    orderConfirmation: (orderNumber, totalAmount, items) => ({
        subject: `تأیید سفارش ${orderNumber}`,
        html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
        <h2>سفارش شما ثبت شد! 🎉</h2>
        <p>شماره سفارش: <strong>${orderNumber}</strong></p>
        <p>مبلغ کل: <strong>${totalAmount.toLocaleString('fa-IR')} تومان</strong></p>
        <h3>اقلام سفارش:</h3>
        <ul>
          ${items.map(item => `<li>${item.title} - ${item.quantity} عدد</li>`).join('')}
        </ul>
      </div>
    `
    }),
    orderPaid: (orderNumber, credentials, message) => ({
        subject: `اطلاعات سفارش ${orderNumber}`,
        html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
        <h2>سفارش شما آماده است! ✅</h2>
        <p>شماره سفارش: <strong>${orderNumber}</strong></p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p><strong>اطلاعات اکانت:</strong></p>
          <code style="display: block; white-space: pre-wrap;">${credentials}</code>
        </div>
        ${message ? `<p>${message}</p>` : ''}
      </div>
    `
    }),
    priceAlert: (gameTitle, currentPrice, targetPrice, gameUrl) => ({
        subject: `کاهش قیمت ${gameTitle} 📉`,
        html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px;">
        <h2>قیمت بازی مورد نظر شما کاهش یافت!</h2>
        <p>بازی <strong>${gameTitle}</strong> به قیمت هدف شما رسید.</p>
        <p>قیمت فعلی: <strong>${currentPrice.toLocaleString('fa-IR')} تومان</strong></p>
        <p>قیمت هدف شما: ${targetPrice.toLocaleString('fa-IR')} تومان</p>
        <br>
        <a href="${gameUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">مشاهده و خرید</a>
      </div>
    `
    })
};
//# sourceMappingURL=email.service.js.map