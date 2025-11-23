import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, we can use Ethereal Email or just log to console if no env vars
    // For production, use SMTP settings from env
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Email Service initialized with SMTP');
    } else {
      // Fallback to console logging for dev without SMTP
      console.log('Email Service initialized in DEV mode (logging only)');
      this.transporter = {
        sendMail: async (mailOptions: any) => {
          console.log('📧 [EMAIL SENT] ----------------');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log('--------------------------------');
          return { messageId: 'mock-id' };
        }
      } as any;
    }
  }

  public async sendEmail({ to, subject, html }: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"NextPlay Arena" <noreply@nextplay.ir>',
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw, just log error so main flow isn't interrupted
    }
  }

}


export const emailService = new EmailService();

export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);

export const emailTemplates = {
  orderConfirmation: (orderNumber: string, totalAmount: number, items: any[]) => ({
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
  orderPaid: (orderNumber: string, credentials: string, message?: string) => ({
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
  priceAlert: (gameTitle: string, currentPrice: number, targetPrice: number, gameUrl: string) => ({
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
