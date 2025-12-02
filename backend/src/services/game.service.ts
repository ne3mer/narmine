import type { FilterQuery } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import { GameModel, type GameDocument } from '../models/game.model';
import type { z } from 'zod';
import type { createGameSchema, updateGameSchema } from '../schemas/game.schema';
import { sampleGames } from '../data/sampleGames';

export type CreateGameInput = z.infer<typeof createGameSchema>['body'];
export type UpdateGameInput = z.infer<typeof updateGameSchema>['body'];

export interface GameFilters {
  genre?: string;
  region?: string;

  search?: string;
  sort?: string;
  limit?: number;
  onSale?: boolean;
}

export const listGames = async (filters: GameFilters) => {
  const query: FilterQuery<GameDocument> = {};

  if (filters.genre) {
    // Try to find category by slug first
    const category = await CategoryModel.findOne({ slug: filters.genre });
    
    if (category) {
      // If category found, filter by category ID
      query.categories = category._id;
    } else {
      // Fallback to legacy genre string match
      query.genre = filters.genre;
    }
  }

  if (typeof filters.onSale === 'boolean') {
    query.onSale = filters.onSale;
  }

  if (filters.region) {
    query.regionOptions = filters.region;
  }



  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const sortOptions: any = {};
  if (filters.sort === '-createdAt') {
    sortOptions.createdAt = -1;
  } else if (filters.sort === 'createdAt') {
    sortOptions.createdAt = 1;
  }

  let queryBuilder = GameModel.find(query).sort(sortOptions);
  
  if (filters.limit && filters.limit > 0) {
    queryBuilder = queryBuilder.limit(filters.limit);
  }

  return queryBuilder;
};

import { CategoryModel } from '../models/category.model';

// ... (existing imports)

export const createGame = async (payload: CreateGameInput) => {
  const game = await GameModel.create(payload);
  
  // Update product counts for associated categories
  if (game.categories && game.categories.length > 0) {
    await Promise.all(
      game.categories.map(async (catId) => {
        const category = await CategoryModel.findById(catId);
        if (category) await category.updateProductCount();
      })
    );
  }
  
  return game;
};

const gameIdentifierFilter = (idOrSlug: string): FilterQuery<GameDocument> => {
  if (isValidObjectId(idOrSlug)) {
    return { _id: idOrSlug };
  }
  return { slug: idOrSlug };
};

export const getGameById = async (idOrSlug: string) => {
  return GameModel.findOne(gameIdentifierFilter(idOrSlug));
};

export const updateGame = async (idOrSlug: string, payload: UpdateGameInput) => {
  // Get original game to know previous categories
  const originalGame = await GameModel.findOne(gameIdentifierFilter(idOrSlug));
  
  const game = await GameModel.findOneAndUpdate(gameIdentifierFilter(idOrSlug), payload, { new: true });
  
  // Check price alerts if price was updated
  if (game && (payload.basePrice !== undefined || payload.salePrice !== undefined)) {
    try {
      const { checkAndTriggerPriceAlerts } = await import('./priceAlert.service');
      const currentPrice = payload.salePrice && payload.onSale 
        ? payload.salePrice 
        : payload.basePrice || game.basePrice;
      
      await checkAndTriggerPriceAlerts(game._id.toString(), currentPrice);
    } catch (error) {
      console.error('Failed to check price alerts:', error);
      // Don't fail the update if price alert check fails
    }
  }

  // Update product counts for both old and new categories
  if (game) {
    const oldCategories = originalGame?.categories || [];
    const newCategories = game.categories || [];
    
    // Collect all unique category IDs affected
    const allCatIds = new Set([
      ...oldCategories.map(id => id.toString()),
      ...newCategories.map(id => id.toString())
    ]);
    
    await Promise.all(
      Array.from(allCatIds).map(async (catId) => {
        const category = await CategoryModel.findById(catId);
        if (category) await category.updateProductCount();
      })
    );
  }
  
  return game;
};

export const deleteGame = async (idOrSlug: string) => {
  const game = await GameModel.findOneAndDelete(gameIdentifierFilter(idOrSlug));
  
  // Update product counts for removed categories
  if (game && game.categories && game.categories.length > 0) {
    await Promise.all(
      game.categories.map(async (catId) => {
        const category = await CategoryModel.findById(catId);
        if (category) await category.updateProductCount();
      })
    );
  }
  
  return game;
};

export const seedSampleGames = async () => {
  const slugs = sampleGames.map((game) => game.slug);
  const existing = await GameModel.find({ slug: { $in: slugs } }).select('slug');
  const existingSlugs = new Set(existing.map((game) => game.slug));

  const freshGames = sampleGames.filter((game) => !existingSlugs.has(game.slug));

  if (freshGames.length) {
    await GameModel.insertMany(freshGames);
  }

  return {
    inserted: freshGames.length,
    skipped: sampleGames.length - freshGames.length
  };
};
