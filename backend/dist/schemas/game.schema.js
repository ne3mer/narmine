"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameSchema = exports.updateGameSchema = exports.getGameSchema = exports.listGamesSchema = exports.createGameSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
const gameQuery = zod_1.z.object({
    genre: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
    onSale: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === undefined ? undefined : val === 'true'))
});
exports.createGameSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3),
        slug: zod_1.z.string().min(3),
        description: zod_1.z.string().min(10),
        detailedDescription: zod_1.z.string().optional(),
        genre: zod_1.z.array(zod_1.z.string()).default([]),
        platform: zod_1.z.string().default('PS5'),
        regionOptions: zod_1.z.array(zod_1.z.string()).default([]),
        basePrice: zod_1.z.number().positive(),
        coverUrl: zod_1.z.string().optional(),
        gallery: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        // New media fields
        trailerUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        gameplayVideoUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        screenshots: zod_1.z.array(zod_1.z.string().url()).optional(),
        // Enhanced metadata
        rating: zod_1.z.number().min(0).max(5).optional(),
        releaseDate: zod_1.z.string().optional().transform((val) => val ? new Date(val) : undefined),
        developer: zod_1.z.string().optional(),
        publisher: zod_1.z.string().optional(),
        ageRating: zod_1.z.string().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
        systemRequirements: zod_1.z.object({
            minimum: zod_1.z.string().optional(),
            recommended: zod_1.z.string().optional()
        }).optional(),
        // SEO & Marketing
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        featured: zod_1.z.boolean().default(false),
        onSale: zod_1.z.boolean().default(false),
        salePrice: zod_1.z.number().positive().optional(),
        // Options and variants
        options: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            values: zod_1.z.array(zod_1.z.string())
        })).default([]),
        variants: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            selectedOptions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
            price: zod_1.z.number().positive(),
            salePrice: zod_1.z.number().positive().optional(),
            onSale: zod_1.z.boolean().default(false),
            stock: zod_1.z.number().int().nonnegative().default(10)
        })).default([]),
        // Multi-product fields
        productType: zod_1.z.enum(['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle']).default('physical_product'),
        customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        inventory: zod_1.z.object({
            trackInventory: zod_1.z.boolean(),
            quantity: zod_1.z.number().int().nonnegative(),
            lowStockThreshold: zod_1.z.number().int().nonnegative(),
            sku: zod_1.z.string().optional()
        }).optional(),
        shipping: zod_1.z.object({
            requiresShipping: zod_1.z.boolean(),
            weight: zod_1.z.number().positive().optional(),
            dimensions: zod_1.z.object({
                length: zod_1.z.number().positive(),
                width: zod_1.z.number().positive(),
                height: zod_1.z.number().positive()
            }).optional(),
            shippingCost: zod_1.z.number().nonnegative().optional(),
            freeShippingThreshold: zod_1.z.number().nonnegative().optional()
        }).optional()
    }),
    query: empty,
    params: empty
});
exports.listGamesSchema = zod_1.z.object({
    body: empty,
    params: empty,
    query: gameQuery
});
const gameIdParams = zod_1.z.object({
    id: zod_1.z.string().min(1)
});
const updateGameBody = zod_1.z
    .object({
    title: zod_1.z.string().min(3).optional(),
    slug: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().min(10).optional(),
    detailedDescription: zod_1.z.string().optional(),
    genre: zod_1.z.array(zod_1.z.string()).optional(),
    platform: zod_1.z.string().optional(),
    regionOptions: zod_1.z.array(zod_1.z.string()).optional(),
    basePrice: zod_1.z.number().positive().optional(),
    coverUrl: zod_1.z.string().optional(),
    gallery: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    // New media fields
    trailerUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    gameplayVideoUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    screenshots: zod_1.z.array(zod_1.z.string().url()).optional(),
    // Enhanced metadata
    rating: zod_1.z.number().min(0).max(5).optional(),
    releaseDate: zod_1.z.string().optional().transform((val) => val ? new Date(val) : undefined),
    developer: zod_1.z.string().optional(),
    publisher: zod_1.z.string().optional(),
    ageRating: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    systemRequirements: zod_1.z.object({
        minimum: zod_1.z.string().optional(),
        recommended: zod_1.z.string().optional()
    }).optional(),
    // SEO & Marketing
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    featured: zod_1.z.boolean().optional(),
    onSale: zod_1.z.boolean().optional(),
    salePrice: zod_1.z.number().positive().optional(),
    // Options and variants
    options: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        values: zod_1.z.array(zod_1.z.string())
    })).optional(),
    variants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        selectedOptions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
        price: zod_1.z.number().positive(),
        salePrice: zod_1.z.number().positive().optional(),
        onSale: zod_1.z.boolean().default(false),
        stock: zod_1.z.number().int().nonnegative().default(10)
    })).optional(),
    // Multi-product fields
    productType: zod_1.z.enum(['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle']).optional(),
    customFields: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    inventory: zod_1.z.object({
        trackInventory: zod_1.z.boolean(),
        quantity: zod_1.z.number().int().nonnegative(),
        lowStockThreshold: zod_1.z.number().int().nonnegative(),
        sku: zod_1.z.string().optional()
    }).optional(),
    shipping: zod_1.z.object({
        requiresShipping: zod_1.z.boolean(),
        weight: zod_1.z.number().positive().optional(),
        dimensions: zod_1.z.object({
            length: zod_1.z.number().positive(),
            width: zod_1.z.number().positive(),
            height: zod_1.z.number().positive()
        }).optional(),
        shippingCost: zod_1.z.number().nonnegative().optional(),
        freeShippingThreshold: zod_1.z.number().nonnegative().optional()
    }).optional()
})
    .strict();
exports.getGameSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: gameIdParams
});
exports.updateGameSchema = zod_1.z.object({
    body: updateGameBody,
    query: empty,
    params: gameIdParams
});
exports.deleteGameSchema = zod_1.z.object({
    body: empty,
    query: empty,
    params: gameIdParams
});
//# sourceMappingURL=game.schema.js.map