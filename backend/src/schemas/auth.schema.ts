import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

const phoneRegex = /^\+?\d{8,15}$/;

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, 'نام باید حداقل ۳ کاراکتر باشد'),
      email: z.string().email('ایمیل معتبر نیست'),
      phone: z
        .string()
        .regex(phoneRegex, 'شماره تماس معتبر نیست')
        .optional(),
      telegram: z.string().optional(),
      password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
      passwordConfirm: z.string().min(6, 'تکرار رمز عبور حداقل ۶ کاراکتر باشد')
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'رمز عبور و تکرار آن یکسان نیست',
      path: ['passwordConfirm']
    }),
  query: empty,
  params: empty
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('ایمیل معتبر نیست'),
    password: z.string().min(6, 'رمز عبور الزامی است')
  }),
  query: empty,
  params: empty
});
