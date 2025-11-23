import { z } from 'zod';

const bannerContentSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(2),
  badge: z.string().min(2),
  description: z.string().min(10),
  perks: z.array(z.string()),
  priceLabel: z.string(),
  priceValue: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string()
});

const campaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  channel: z.string().min(2),
  status: z.enum(['active', 'paused', 'draft']),
  budget: z.number().nonnegative(),
  ctr: z.number().nonnegative(),
  cvr: z.number().nonnegative(),
  startDate: z.string(),
  endDate: z.string()
});

const utmBuilderSchema = z.object({
  baseUrl: z.string().min(4),
  source: z.string(),
  medium: z.string(),
  campaign: z.string(),
  term: z.string().optional(),
  content: z.string().optional()
});

const empty = z.object({}).optional().transform(() => ({}));

export const updateMarketingSchema = z.object({
  body: z
    .object({
      bannerContent: bannerContentSchema.optional(),
      campaigns: z.array(campaignSchema).optional(),
      utmBuilder: utmBuilderSchema.optional(),
      experimentSplit: z.number().min(0).max(100).optional()
    })
    .strict(),
  params: empty,
  query: empty
});

export const getMarketingSchema = z.object({
  body: empty,
  params: empty,
  query: empty
});
