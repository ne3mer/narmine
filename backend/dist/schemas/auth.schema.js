"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
const phoneRegex = /^\+?\d{8,15}$/;
exports.registerSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(3, 'نام باید حداقل ۳ کاراکتر باشد'),
        email: zod_1.z.string().email('ایمیل معتبر نیست'),
        phone: zod_1.z
            .string()
            .regex(phoneRegex, 'شماره تماس معتبر نیست')
            .optional(),
        telegram: zod_1.z.string().optional(),
        password: zod_1.z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
        passwordConfirm: zod_1.z.string().min(6, 'تکرار رمز عبور حداقل ۶ کاراکتر باشد')
    })
        .refine((data) => data.password === data.passwordConfirm, {
        message: 'رمز عبور و تکرار آن یکسان نیست',
        path: ['passwordConfirm']
    }),
    query: empty,
    params: empty
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('ایمیل معتبر نیست'),
        password: zod_1.z.string().min(6, 'رمز عبور الزامی است')
    }),
    query: empty,
    params: empty
});
//# sourceMappingURL=auth.schema.js.map