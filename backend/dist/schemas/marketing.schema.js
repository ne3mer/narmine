"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketingSchema = exports.updateMarketingSchema = void 0;
const zod_1 = require("zod");
const bannerContentSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    subtitle: zod_1.z.string().min(2),
    badge: zod_1.z.string().min(2),
    description: zod_1.z.string().min(10),
    perks: zod_1.z.array(zod_1.z.string()),
    priceLabel: zod_1.z.string(),
    priceValue: zod_1.z.string(),
    ctaLabel: zod_1.z.string(),
    ctaHref: zod_1.z.string()
});
const campaignSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    channel: zod_1.z.string().min(2),
    status: zod_1.z.enum(['active', 'paused', 'draft']),
    budget: zod_1.z.number().nonnegative(),
    ctr: zod_1.z.number().nonnegative(),
    cvr: zod_1.z.number().nonnegative(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string()
});
const utmBuilderSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().min(4),
    source: zod_1.z.string(),
    medium: zod_1.z.string(),
    campaign: zod_1.z.string(),
    term: zod_1.z.string().optional(),
    content: zod_1.z.string().optional()
});
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.updateMarketingSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        bannerContent: bannerContentSchema.optional(),
        campaigns: zod_1.z.array(campaignSchema).optional(),
        utmBuilder: utmBuilderSchema.optional(),
        experimentSplit: zod_1.z.number().min(0).max(100).optional()
    })
        .strict(),
    params: empty,
    query: empty
});
exports.getMarketingSchema = zod_1.z.object({
    body: empty,
    params: empty,
    query: empty
});
//# sourceMappingURL=marketing.schema.js.map