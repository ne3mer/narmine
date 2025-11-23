"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSampleGames = exports.deleteGame = exports.updateGame = exports.getGameById = exports.createGame = exports.listGames = void 0;
const mongoose_1 = require("mongoose");
const game_model_1 = require("../models/game.model");
const sampleGames_1 = require("../data/sampleGames");
const listGames = async (filters) => {
    const query = {};
    if (filters.genre) {
        query.genre = filters.genre;
    }
    if (filters.region) {
        query.regionOptions = filters.region;
    }
    if (typeof filters.safeOnly === 'boolean') {
        query.safeAccountAvailable = filters.safeOnly;
    }
    if (filters.search) {
        query.$text = { $search: filters.search };
    }
    const sortOptions = {};
    if (filters.sort === '-createdAt') {
        sortOptions.createdAt = -1;
    }
    else if (filters.sort === 'createdAt') {
        sortOptions.createdAt = 1;
    }
    let queryBuilder = game_model_1.GameModel.find(query).sort(sortOptions);
    if (filters.limit && filters.limit > 0) {
        queryBuilder = queryBuilder.limit(filters.limit);
    }
    return queryBuilder;
};
exports.listGames = listGames;
const createGame = async (payload) => {
    return game_model_1.GameModel.create(payload);
};
exports.createGame = createGame;
const gameIdentifierFilter = (idOrSlug) => {
    if ((0, mongoose_1.isValidObjectId)(idOrSlug)) {
        return { _id: idOrSlug };
    }
    return { slug: idOrSlug };
};
const getGameById = async (idOrSlug) => {
    return game_model_1.GameModel.findOne(gameIdentifierFilter(idOrSlug));
};
exports.getGameById = getGameById;
const updateGame = async (idOrSlug, payload) => {
    const game = await game_model_1.GameModel.findOneAndUpdate(gameIdentifierFilter(idOrSlug), payload, { new: true });
    // Check price alerts if price was updated
    if (game && (payload.basePrice !== undefined || payload.salePrice !== undefined)) {
        try {
            const { checkAndTriggerPriceAlerts } = await Promise.resolve().then(() => __importStar(require('./priceAlert.service')));
            const currentPrice = payload.salePrice && payload.onSale
                ? payload.salePrice
                : payload.basePrice || game.basePrice;
            await checkAndTriggerPriceAlerts(game._id.toString(), currentPrice);
        }
        catch (error) {
            console.error('Failed to check price alerts:', error);
            // Don't fail the update if price alert check fails
        }
    }
    return game;
};
exports.updateGame = updateGame;
const deleteGame = async (idOrSlug) => {
    return game_model_1.GameModel.findOneAndDelete(gameIdentifierFilter(idOrSlug));
};
exports.deleteGame = deleteGame;
const seedSampleGames = async () => {
    const slugs = sampleGames_1.sampleGames.map((game) => game.slug);
    const existing = await game_model_1.GameModel.find({ slug: { $in: slugs } }).select('slug');
    const existingSlugs = new Set(existing.map((game) => game.slug));
    const freshGames = sampleGames_1.sampleGames.filter((game) => !existingSlugs.has(game.slug));
    if (freshGames.length) {
        await game_model_1.GameModel.insertMany(freshGames);
    }
    return {
        inserted: freshGames.length,
        skipped: sampleGames_1.sampleGames.length - freshGames.length
    };
};
exports.seedSampleGames = seedSampleGames;
//# sourceMappingURL=game.service.js.map