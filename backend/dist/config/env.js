"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('5050'),
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/gameclub'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:3000'),
    JWT_SECRET: zod_1.z.string()
        .min(1, 'JWT_SECRET is required')
        .refine((val) => process.env.NODE_ENV !== 'production' || val.length >= 32, { message: 'JWT_SECRET must be at least 32 characters in production' })
        .default('super-secret-key-change-in-production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    ADMIN_API_KEY: zod_1.z.string()
        .refine((val) => !val || process.env.NODE_ENV !== 'production' || val.length >= 16, { message: 'ADMIN_API_KEY must be at least 16 characters in production' })
        .optional(),
    ADMIN_NOTIFICATION_EMAILS: zod_1.z.string().optional(),
    TELEGRAM_BOT_TOKEN: zod_1.z.string().optional(),
    TELEGRAM_CHAT_ID: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional()
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
const rawEnv = parsed.data;
exports.env = {
    ...rawEnv,
    port: Number(rawEnv.PORT)
};
//# sourceMappingURL=env.js.map