import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

const gameQuery = z.object({
  genre: z.string().optional(),
  region: z.string().optional(),
  safeOnly: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (!value) return undefined;
        return value === 'true';
      }
      return undefined;
    }),
  search: z.string().optional(),
  sort: z.string().optional(),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
});

export const createGameSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(10),
    detailedDescription: z.string().optional(),
    genre: z.array(z.string()).default([]),
    platform: z.string().default('PS5'),
    regionOptions: z.array(z.string()).default([]),
    basePrice: z.number().positive(),
    safeAccountAvailable: z.boolean().default(false),
    coverUrl: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    // New media fields
    trailerUrl: z.string().url().optional().or(z.literal('')),
    gameplayVideoUrl: z.string().url().optional().or(z.literal('')),
    screenshots: z.array(z.string().url()).optional(),
    // Enhanced metadata
    rating: z.number().min(0).max(5).optional(),
    releaseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    developer: z.string().optional(),
    publisher: z.string().optional(),
    ageRating: z.string().optional(),
    features: z.array(z.string()).optional(),
    systemRequirements: z.object({
      minimum: z.string().optional(),
      recommended: z.string().optional()
    }).optional(),
    // SEO & Marketing
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    featured: z.boolean().default(false),
    onSale: z.boolean().default(false),
    salePrice: z.number().positive().optional(),
    // Options and variants
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string())
    })).default([]),
    variants: z.array(z.object({
      id: z.string(),
      selectedOptions: z.record(z.string(), z.string()),
      price: z.number().positive(),
      stock: z.number().int().nonnegative().default(10)
    })).default([])
  }),
  query: empty,
  params: empty
});

export const listGamesSchema = z.object({
  body: empty,
  params: empty,
  query: gameQuery
});

const gameIdParams = z.object({
  id: z.string().min(1)
});

const updateGameBody = z
  .object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    detailedDescription: z.string().optional(),
    genre: z.array(z.string()).optional(),
    platform: z.string().optional(),
    regionOptions: z.array(z.string()).optional(),
    basePrice: z.number().positive().optional(),
    safeAccountAvailable: z.boolean().optional(),
    coverUrl: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    // New media fields
    trailerUrl: z.string().url().optional().or(z.literal('')),
    gameplayVideoUrl: z.string().url().optional().or(z.literal('')),
    screenshots: z.array(z.string().url()).optional(),
    // Enhanced metadata
    rating: z.number().min(0).max(5).optional(),
    releaseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    developer: z.string().optional(),
    publisher: z.string().optional(),
    ageRating: z.string().optional(),
    features: z.array(z.string()).optional(),
    systemRequirements: z.object({
      minimum: z.string().optional(),
      recommended: z.string().optional()
    }).optional(),
    // SEO & Marketing
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    featured: z.boolean().optional(),
    onSale: z.boolean().optional(),
    salePrice: z.number().positive().optional(),
    // Options and variants
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string())
    })).optional(),
    variants: z.array(z.object({
      id: z.string(),
      selectedOptions: z.record(z.string(), z.string()),
      price: z.number().positive(),
      stock: z.number().int().nonnegative().default(10)
    })).optional()
  })
  .strict();

export const getGameSchema = z.object({
  body: empty,
  query: empty,
  params: gameIdParams
});

export const updateGameSchema = z.object({
  body: updateGameBody,
  query: empty,
  params: gameIdParams
});

export const deleteGameSchema = z.object({
  body: empty,
  query: empty,
  params: gameIdParams
});
