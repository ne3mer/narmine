"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactForm = void 0;
const resend_service_1 = require("../services/resend.service");
const sendContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً تمام فیلدهای الزامی را پر کنید'
            });
        }
        // Send email to admin
        await (0, resend_service_1.sendContactEmail)({
            name,
            email,
            phone,
            subject,
            message
        });
        // Send confirmation to user
        await (0, resend_service_1.sendContactConfirmation)(email, name);
        res.json({
            success: true,
            message: 'پیام شما با موفقیت ارسال شد'
        });
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید'
        });
    }
};
exports.sendContactForm = sendContactForm;
//# sourceMappingURL=contact.controller.js.map