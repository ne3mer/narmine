import { Resend } from 'resend';
import { env } from '../config/env';

// Initialize Resend only if API key is provided
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  try {
    if (!resend) {
      console.warn('Resend API key not configured, skipping email send');
      throw new Error('سرویس ایمیل پیکربندی نشده است');
    }
    
    const result = await resend.emails.send({
      from: 'نرمینه خواب <noreply@narmineh.com>', // باید دامنه خودتون رو verify کنید
      to: env.CONTACT_EMAIL || 'info@narmineh.com',
      replyTo: data.email,
      subject: `پیام جدید: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Tahoma, Arial, sans-serif; background-color: #f8f5f2; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #c9a896; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { color: #4a3f3a; margin: 0; font-size: 24px; }
            .field { margin-bottom: 16px; }
            .label { font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 4px; }
            .value { color: #666; padding: 8px; background: #f8f5f2; border-radius: 8px; }
            .message-box { background: #f8f5f2; border-right: 4px solid #c9a896; padding: 16px; border-radius: 8px; margin-top: 16px; }
            .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 پیام جدید از فرم تماس</h1>
            </div>
            
            <div class="field">
              <span class="label">نام فرستنده:</span>
              <div class="value">${data.name}</div>
            </div>
            
            <div class="field">
              <span class="label">ایمیل:</span>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            
            ${data.phone ? `
            <div class="field">
              <span class="label">شماره تماس:</span>
              <div class="value">${data.phone}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <span class="label">موضوع:</span>
              <div class="value">${data.subject}</div>
            </div>
            
            <div class="message-box">
              <span class="label">پیام:</span>
              <p style="margin: 8px 0 0 0; line-height: 1.6;">${data.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="footer">
              <p>این ایمیل از طریق فرم تماس سایت نرمینه خواب ارسال شده است</p>
              <p>زمان ارسال: ${new Date().toLocaleString('fa-IR')}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('خطا در ارسال ایمیل');
  }
};

// ارسال ایمیل تایید به کاربر
export const sendContactConfirmation = async (email: string, name: string) => {
  try {
    if (!resend) {
      console.warn('Resend API key not configured, skipping confirmation email');
      return;
    }
    
    await resend.emails.send({
      from: 'نرمینه خواب <noreply@narmineh.com>',
      to: email,
      subject: 'پیام شما دریافت شد',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Tahoma, Arial, sans-serif; background-color: #f8f5f2; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #c9a896, #4a3f3a); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; }
            h1 { color: #4a3f3a; margin: 0; font-size: 24px; }
            .content { color: #666; line-height: 1.8; }
            .highlight { background: #f8f5f2; border-right: 4px solid #c9a896; padding: 16px; border-radius: 8px; margin: 16px 0; }
            .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ن</div>
              <h1>پیام شما دریافت شد</h1>
            </div>
            
            <div class="content">
              <p>سلام ${name} عزیز،</p>
              <p>از اینکه با ما تماس گرفتید متشکریم. پیام شما با موفقیت دریافت شد و تیم پشتیبانی ما در اسرع وقت به آن پاسخ خواهند داد.</p>
              
              <div class="highlight">
                <strong>⏱️ زمان پاسخگویی:</strong> معمولاً کمتر از ۲۴ ساعت
              </div>
              
              <p>در صورت نیاز به پیگیری فوری، می‌توانید با شماره <strong>۰۲۱-۱۲۳۴-۵۶۷۸</strong> تماس بگیرید.</p>
              
              <p>با احترام،<br>تیم نرمینه خواب</p>
            </div>
            
            <div class="footer">
              <p>نرمینه خواب - بهترین کالاهای خواب</p>
              <p>این ایمیل به صورت خودکار ارسال شده است، لطفاً به آن پاسخ ندهید</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - confirmation email is not critical
  }
};
