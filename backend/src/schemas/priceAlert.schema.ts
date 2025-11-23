import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

export const createPriceAlertSchema = z.object({
  body: z.object({
    gameId: z.string().min(1, 'شناسه بازی الزامی است'),
    targetPrice: z.number().positive('قیمت هدف باید مثبت باشد'),
    channel: z.enum(['email', 'telegram']),
    destination: z.string().min(1, 'مقصد اعلان الزامی است')
  }),
  query: empty,
  params: empty
});

export const getUserPriceAlertsSchema = z.object({
  body: empty,
  query: empty,
  params: empty
});

export const getPriceAlertByIdSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const updatePriceAlertSchema = z.object({
  body: z.object({
    targetPrice: z.number().positive().optional(),
    channel: z.enum(['email', 'telegram']).optional(),
    destination: z.string().min(1).optional(),
    active: z.boolean().optional()
  }),
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

export const deletePriceAlertSchema = z.object({
  body: empty,
  query: empty,
  params: z.object({
    id: z.string().min(1)
  })
});

