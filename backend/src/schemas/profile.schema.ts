import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'نام نمی‌تواند خالی باشد').optional(),
    phone: z.string().optional(),
    telegram: z.string().optional()
  }),
  query: empty,
  params: empty
});

