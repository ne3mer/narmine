import { z } from 'zod';

const empty = z.object({}).optional().transform(() => ({}));

const gameQuery = z.object({
  genre: z.string().optional(),
  region: z.string().optional(),

  search: z.string().optional(),
  sort: z.string().optional(),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  onSale: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true'))
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

    coverUrl: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).optional(),
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
      salePrice: z.number().positive().optional(),
      onSale: z.boolean().default(false),
      stock: z.number().int().nonnegative().default(10)
    })).default([]),
    // Multi-product fields
    productType: z.enum(['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle']).default('physical_product'),
    customFields: z.record(z.string(), z.any()).optional(),
    inventory: z.object({
      trackInventory: z.boolean(),
      quantity: z.number().int().nonnegative(),
      lowStockThreshold: z.number().int().nonnegative(),
      sku: z.string().optional()
    }).optional(),
    shipping: z.object({
      requiresShipping: z.boolean(),
      weight: z.number().positive().optional(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive()
      }).optional(),
      shippingCost: z.number().nonnegative().optional(),
      freeShippingThreshold: z.number().nonnegative().optional()
    }).optional()
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

    coverUrl: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
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
      salePrice: z.number().positive().optional(),
      onSale: z.boolean().default(false),
      stock: z.number().int().nonnegative().default(10)
    })).optional(),
    // Multi-product fields
    productType: z.enum(['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle']).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    inventory: z.object({
      trackInventory: z.boolean(),
      quantity: z.number().int().nonnegative(),
      lowStockThreshold: z.number().int().nonnegative(),
      sku: z.string().optional()
    }).optional(),
    shipping: z.object({
      requiresShipping: z.boolean(),
      weight: z.number().positive().optional(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive()
      }).optional(),
      shippingCost: z.number().nonnegative().optional(),
      freeShippingThreshold: z.number().nonnegative().optional()
    }).optional()
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
