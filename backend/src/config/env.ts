import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5050'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/gameclub'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string()
    .min(1, 'JWT_SECRET is required')
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
      { message: 'JWT_SECRET must be at least 32 characters in production' }
    )
    .default('super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_API_KEY: z.string()
    .refine(
      (val) => !val || process.env.NODE_ENV !== 'production' || val.length >= 16,
      { message: 'ADMIN_API_KEY must be at least 16 characters in production' }
    )
    .optional(),
  ADMIN_NOTIFICATION_EMAILS: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const rawEnv = parsed.data;

export const env = {
  ...rawEnv,
  port: Number(rawEnv.PORT)
};
