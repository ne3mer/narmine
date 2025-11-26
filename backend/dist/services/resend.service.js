"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactConfirmation = exports.sendContactEmail = void 0;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const base_template_1 = require("../templates/base.template");
// Initialize Resend only if API key is provided
const resend = env_1.env.RESEND_API_KEY ? new resend_1.Resend(env_1.env.RESEND_API_KEY) : null;
const sendContactEmail = async (data) => {
    try {
        if (!resend) {
            console.warn('Resend API key not configured, skipping email send');
            throw new Error('سرویس ایمیل پیکربندی نشده است');
        }
        const htmlContent = (0, base_template_1.generateEmailTemplate)({
            title: '📧 پیام جدید از فرم تماس',
            previewText: `پیام جدید از ${data.name}: ${data.subject}`,
            content: `
        <div class="field" style="margin-bottom: 16px;">
          <span class="label" style="font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 4px;">نام فرستنده:</span>
          <div class="value" style="color: #666; padding: 12px; background: #fff; border: 1px solid #eee; border-radius: 8px;">${data.name}</div>
        </div>
        
        <div class="field" style="margin-bottom: 16px;">
          <span class="label" style="font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 4px;">ایمیل:</span>
          <div class="value" style="color: #666; padding: 12px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
            <a href="mailto:${data.email}" style="color: #c9a896; text-decoration: none;">${data.email}</a>
          </div>
        </div>
        
        ${data.phone ? `
        <div class="field" style="margin-bottom: 16px;">
          <span class="label" style="font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 4px;">شماره تماس:</span>
          <div class="value" style="color: #666; padding: 12px; background: #fff; border: 1px solid #eee; border-radius: 8px;">${data.phone}</div>
        </div>
        ` : ''}
        
        <div class="field" style="margin-bottom: 16px;">
          <span class="label" style="font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 4px;">موضوع:</span>
          <div class="value" style="color: #666; padding: 12px; background: #fff; border: 1px solid #eee; border-radius: 8px;">${data.subject}</div>
        </div>
        
        <div class="message-box" style="background: #f8f5f2; border-right: 4px solid #c9a896; padding: 20px; border-radius: 12px; margin-top: 24px;">
          <span class="label" style="font-weight: bold; color: #4a3f3a; display: block; margin-bottom: 8px;">پیام:</span>
          <p style="margin: 0; line-height: 1.8; color: #555;">${data.message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
            action: {
                text: 'پاسخ به ایمیل',
                url: `mailto:${data.email}`
            }
        });
        const result = await resend.emails.send({
            from: 'نرمینه خواب <noreply@narmineh.com>',
            to: env_1.env.CONTACT_EMAIL || 'info@narmineh.com',
            replyTo: data.email,
            subject: `پیام جدید: ${data.subject}`,
            html: htmlContent
        });
        return { success: true, id: result.data?.id };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('خطا در ارسال ایمیل');
    }
};
exports.sendContactEmail = sendContactEmail;
// ارسال ایمیل تایید به کاربر
const sendContactConfirmation = async (email, name) => {
    try {
        if (!resend) {
            console.warn('Resend API key not configured, skipping confirmation email');
            return;
        }
        const htmlContent = (0, base_template_1.generateEmailTemplate)({
            title: 'پیام شما دریافت شد',
            previewText: 'از تماس شما متشکریم. پیام شما با موفقیت دریافت شد.',
            content: `
        <p style="font-size: 16px; margin-bottom: 16px;">سلام <strong>${name}</strong> عزیز،</p>
        <p style="margin-bottom: 24px;">از اینکه با ما تماس گرفتید متشکریم. پیام شما با موفقیت در سیستم ما ثبت شد و همکاران ما در تیم پشتیبانی در اسرع وقت (معمولاً کمتر از ۲۴ ساعت) به آن پاسخ خواهند داد.</p>
        
        <div style="background: #fff; border: 1px dashed #c9a896; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <div style="font-size: 24px; margin-bottom: 8px;">⏱️</div>
          <strong style="color: #4a3f3a;">زمان پاسخگویی میانگین</strong>
          <p style="margin: 4px 0 0 0; color: #888;">کمتر از ۲ ساعت در ساعات کاری</p>
        </div>
        
        <p>در صورت نیاز به پیگیری فوری، می‌توانید با شماره پشتیبانی تماس بگیرید.</p>
      `,
            action: {
                text: 'بازگشت به سایت',
                url: 'https://narmineh.com'
            }
        });
        await resend.emails.send({
            from: 'نرمینه خواب <noreply@narmineh.com>',
            to: email,
            subject: 'پیام شما دریافت شد - نرمینه خواب',
            html: htmlContent
        });
    }
    catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw - confirmation email is not critical
    }
};
exports.sendContactConfirmation = sendContactConfirmation;
//# sourceMappingURL=resend.service.js.map