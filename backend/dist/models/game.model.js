"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = void 0;
const mongoose_1 = require("mongoose");
const gameSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    detailedDescription: { type: String }, // Rich text HTML
    genre: [{ type: String }], // Optional for physical
    platform: { type: String }, // Optional for physical
    regionOptions: [{ type: String }], // Optional for physical
    basePrice: { type: Number, required: true },
    coverUrl: { type: String },
    gallery: [{ type: String }],
    tags: [{ type: String }],
    categories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' }],
    // New media fields
    trailerUrl: { type: String },
    gameplayVideoUrl: { type: String },
    screenshots: [{ type: String }],
    // Enhanced metadata
    rating: { type: Number, min: 0, max: 5 },
    releaseDate: { type: Date },
    developer: { type: String },
    publisher: { type: String },
    ageRating: { type: String },
    features: [{ type: String }],
    systemRequirements: {
        minimum: { type: String },
        recommended: { type: String }
    },
    // SEO & Marketing
    metaTitle: { type: String },
    metaDescription: { type: String },
    featured: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number },
    // Multi-Product System Fields
    productType: {
        type: String,
        enum: ['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle'],
        default: 'physical_product' // Changed default
    },
    // Dynamic custom fields
    customFields: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed
    },
    // Inventory management
    inventory: {
        trackInventory: { type: Boolean, default: true }, // Default true for physical
        quantity: { type: Number, default: 0 },
        reserved: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        sku: { type: String }
    },
    // Shipping information
    shipping: {
        requiresShipping: { type: Boolean, default: true }, // Default true for physical
        weight: { type: Number }, // grams
        dimensions: {
            length: { type: Number }, // cm
            width: { type: Number },
            height: { type: Number }
        },
        shippingCost: { type: Number },
        freeShippingThreshold: { type: Number }
    },
    // Options and variants
    options: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            values: [{ type: String, required: true }]
        }
    ],
    variants: [
        {
            id: { type: String, required: true },
            selectedOptions: { type: Map, of: String, required: true },
            price: { type: Number, required: true },
            salePrice: { type: Number },
            onSale: { type: Boolean, default: false },
            stock: { type: Number, required: true, default: 0 }
        }
    ]
}, { timestamps: true });
gameSchema.index({ title: 'text', description: 'text' });
gameSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { ...rest, id: _id };
    }
});
exports.GameModel = (0, mongoose_1.model)('Game', gameSchema);
//# sourceMappingURL=game.model.js.map