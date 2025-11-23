import { z } from 'zod';

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const heroSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  stats: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      value: z.string().min(1)
    })
  ),
  image: z
    .string()
    .min(1)
    .optional()
});

const spotlightSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  accent: z.string().min(1)
});

const trustSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1)
});

const testimonialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  text: z.string().min(1),
  avatar: z.string().min(1),
  highlight: z.boolean().optional()
});

const empty = z.object({}).optional().transform(() => ({}));

export const getHomeContentSchema = z.object({
  body: empty,
  params: empty,
  query: empty
});

export const updateHomeContentSchema = z.object({
  body: z
    .object({
      hero: heroSchema.optional(),
      heroSlides: z.array(heroSchema).optional(),
      spotlights: z.array(spotlightSchema).optional(),
      trustSignals: z.array(trustSchema).optional(),
      testimonials: z.array(testimonialSchema).optional()
    })
    .strict(),
  params: empty,
  query: empty
});
