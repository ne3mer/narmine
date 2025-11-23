"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameSchema = exports.updateGameSchema = exports.getGameSchema = exports.listGamesSchema = exports.createGameSchema = void 0;
const zod_1 = require("zod");
const empty = zod_1.z.object({}).optional().transform(() => ({}));
const gameQuery = zod_1.z.object({
    genre: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    safeOnly: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .optional()
        .transform((value) => {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'string') {
            if (!value)
                return undefined;
            return value === 'true';
        }
        return undefined;
    }),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
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
        safeAccountAvailable: zod_1.z.boolean().default(false),
        coverUrl: zod_1.z.string().optional(),
        gallery: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
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
            stock: zod_1.z.number().int().nonnegative().default(10)
        })).default([])
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
    safeAccountAvailable: zod_1.z.boolean().optional(),
    coverUrl: zod_1.z.string().optional(),
    gallery: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
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
        stock: zod_1.z.number().int().nonnegative().default(10)
    })).optional()
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