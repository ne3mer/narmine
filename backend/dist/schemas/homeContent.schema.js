"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHomeContentSchema = exports.getHomeContentSchema = void 0;
const zod_1 = require("zod");
const ctaSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    href: zod_1.z.string().min(1)
});
const heroSchema = zod_1.z.object({
    badge: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().min(1),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    stats: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        label: zod_1.z.string().min(1),
        value: zod_1.z.string().min(1)
    })),
    image: zod_1.z
        .string()
        .min(1)
        .optional()
});
const spotlightSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    href: zod_1.z.string().min(1),
    accent: zod_1.z.string().min(1)
});
const trustSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    icon: zod_1.z.string().min(1)
});
const testimonialSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    handle: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1),
    avatar: zod_1.z.string().min(1),
    highlight: zod_1.z.boolean().optional()
});
const empty = zod_1.z.object({}).optional().transform(() => ({}));
exports.getHomeContentSchema = zod_1.z.object({
    body: empty,
    params: empty,
    query: empty
});
exports.updateHomeContentSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        hero: heroSchema.optional(),
        heroSlides: zod_1.z.array(heroSchema).optional(),
        spotlights: zod_1.z.array(spotlightSchema).optional(),
        trustSignals: zod_1.z.array(trustSchema).optional(),
        testimonials: zod_1.z.array(testimonialSchema).optional()
    })
        .strict(),
    params: empty,
    query: empty
});
//# sourceMappingURL=homeContent.schema.js.map