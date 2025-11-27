import type { z } from 'zod';
import { CartModel } from '../models/cart.model';
import { GameModel } from '../models/game.model';
import { ApiError } from '../middleware/errorHandler';
import type { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schema';

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];

export const getCart = async (userId: string) => {
  // Check for missing IDs using lean() to see actual DB state
  const rawCart = await CartModel.findOne({ userId }).lean();
  
  if (!rawCart) {
    return {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Check if any item is missing _id in the database
  const needsMigration = rawCart.items.some((item: any) => !item._id);

  let cart;
  if (needsMigration) {
    // Load full document to update
    cart = await CartModel.findOne({ userId });
    if (cart) {
      // Mongoose will auto-generate IDs for items in schema that don't have them
      // We just need to mark as modified to ensure it saves them
      cart.markModified('items');
      await cart.save();
      // Reload to ensure we have the persisted IDs
      cart = await CartModel.findOne({ userId });
    }
  } else {
    cart = await CartModel.findOne({ userId });
  }

  if (cart) {
    await cart.populate('items.gameId', 'title slug coverUrl basePrice');
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
      // Use variant specific sale price if available, otherwise base variant price
      if (variant.onSale && variant.salePrice) {
        price = variant.salePrice;
      } else {
        price = variant.price;
      }
    }
  } else if (game.onSale && game.salePrice) {
    price = game.salePrice;
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
  itemId: string,
  input: UpdateCartItemInput
) => {
  const { quantity } = input;
  
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  // Find item by _id (itemId)
  // We use loose comparison or toString() to ensure ObjectId matches string
  const itemIndex = cart.items.findIndex((item: any) => 
    item._id && item._id.toString() === itemId
  );
  
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

export const removeFromCart = async (userId: string, itemId: string) => {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  // Filter out the specific item by its _id
  // Ensure we handle potential missing _id or type mismatch
  cart.items = cart.items.filter((item: any) => 
    item._id && item._id.toString() !== itemId
  );
  
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
