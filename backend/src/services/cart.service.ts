import type { z } from 'zod';
import { CartModel } from '../models/cart.model';
import { GameModel } from '../models/game.model';
import { ApiError } from '../middleware/errorHandler';
import type { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schema';

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];

export const getCart = async (userId: string) => {
  const cart = await CartModel.findOne({ userId }).populate('items.gameId', 'title slug coverUrl basePrice');
  
  if (!cart) {
    // Return empty cart if not found
    return {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  return cart;
};

export const addToCart = async (userId: string, input: AddToCartInput) => {
  const { gameId, quantity, variantId, selectedOptions } = input;
  
  // Verify game exists
  const game = await GameModel.findById(gameId);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }
  
  // Find or create cart
  let cart = await CartModel.findOne({ userId });
  
  if (!cart) {
    cart = new CartModel({
      userId,
      items: []
    });
  }

  // Determine price based on variant
  let price = game.basePrice;
  if (variantId) {
    const variant = game.variants.find((v) => v.id === variantId);
    if (variant) {
      price = variant.price;
    }
  }
  
  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.gameId.toString() === gameId && item.variantId === variantId
  );
  
  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      gameId: game._id as any,
      quantity,
      priceAtAdd: price,
      addedAt: new Date(),
      variantId,
      selectedOptions: selectedOptions ? (new Map(Object.entries(selectedOptions)) as Map<string, string>) : undefined
    });
  }
  
  await cart.save();
  
  // Populate and return
  const populatedCart = await CartModel.findById(cart._id).populate(
    'items.gameId',
    'title slug coverUrl basePrice'
  );
  
  return populatedCart;
};

export const updateCartItem = async (
  userId: string,
  gameId: string,
  input: UpdateCartItemInput
) => {
  const { quantity } = input;
  
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  const itemIndex = cart.items.findIndex((item) => item.gameId.toString() === gameId);
  
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }
  
  if (quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }
  
  await cart.save();
  
  const populatedCart = await CartModel.findById(cart._id).populate(
    'items.gameId',
    'title slug coverUrl basePrice'
  );
  
  return populatedCart;
};

export const removeFromCart = async (userId: string, gameId: string) => {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  cart.items = cart.items.filter((item) => item.gameId.toString() !== gameId);
  await cart.save();
  
  const populatedCart = await CartModel.findById(cart._id).populate(
    'items.gameId',
    'title slug coverUrl basePrice'
  );
  
  return populatedCart;
};

export const clearCart = async (userId: string) => {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    return null;
  }
  
  cart.items = [];
  await cart.save();
  
  return cart;
};
