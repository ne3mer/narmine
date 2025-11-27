"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cart_model_1 = require("../models/cart.model");
const game_model_1 = require("../models/game.model");
const errorHandler_1 = require("../middleware/errorHandler");
const getCart = async (userId) => {
    // Check for missing IDs using lean() to see actual DB state
    const rawCart = await cart_model_1.CartModel.findOne({ userId }).lean();
    if (!rawCart) {
        return {
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    // Check if any item is missing _id in the database
    const needsMigration = rawCart.items.some((item) => !item._id);
    let cart;
    if (needsMigration) {
        // Load full document to update
        cart = await cart_model_1.CartModel.findOne({ userId });
        if (cart) {
            // Mongoose will auto-generate IDs for items in schema that don't have them
            // We just need to mark as modified to ensure it saves them
            cart.markModified('items');
            await cart.save();
            // Reload to ensure we have the persisted IDs
            cart = await cart_model_1.CartModel.findOne({ userId });
        }
    }
    else {
        cart = await cart_model_1.CartModel.findOne({ userId });
    }
    if (cart) {
        await cart.populate('items.gameId', 'title slug coverUrl basePrice');
    }
    return cart;
};
exports.getCart = getCart;
const addToCart = async (userId, input) => {
    const { gameId, quantity, variantId, selectedOptions } = input;
    // Verify game exists
    const game = await game_model_1.GameModel.findById(gameId);
    if (!game) {
        throw new errorHandler_1.ApiError(404, 'Game not found');
    }
    // Find or create cart
    let cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        cart = new cart_model_1.CartModel({
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
            }
            else {
                price = variant.price;
            }
        }
    }
    else if (game.onSale && game.salePrice) {
        price = game.salePrice;
    }
    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex((item) => item.gameId.toString() === gameId && item.variantId === variantId);
    if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
    }
    else {
        // Add new item
        cart.items.push({
            gameId: game._id,
            quantity,
            priceAtAdd: price,
            addedAt: new Date(),
            variantId,
            selectedOptions: selectedOptions ? new Map(Object.entries(selectedOptions)) : undefined
        });
    }
    await cart.save();
    // Populate and return
    const populatedCart = await cart_model_1.CartModel.findById(cart._id).populate('items.gameId', 'title slug coverUrl basePrice');
    return populatedCart;
};
exports.addToCart = addToCart;
const updateCartItem = async (userId, itemId, input) => {
    const { quantity } = input;
    const cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        throw new errorHandler_1.ApiError(404, 'Cart not found');
    }
    // Find item by _id (itemId)
    // We use loose comparison or toString() to ensure ObjectId matches string
    const itemIndex = cart.items.findIndex((item) => item._id && item._id.toString() === itemId);
    if (itemIndex === -1) {
        throw new errorHandler_1.ApiError(404, 'Item not found in cart');
    }
    if (quantity === 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
    }
    else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
    }
    await cart.save();
    const populatedCart = await cart_model_1.CartModel.findById(cart._id).populate('items.gameId', 'title slug coverUrl basePrice');
    return populatedCart;
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (userId, itemId) => {
    const cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        throw new errorHandler_1.ApiError(404, 'Cart not found');
    }
    // Filter out the specific item by its _id
    // Ensure we handle potential missing _id or type mismatch
    cart.items = cart.items.filter((item) => item._id && item._id.toString() !== itemId);
    await cart.save();
    const populatedCart = await cart_model_1.CartModel.findById(cart._id).populate('items.gameId', 'title slug coverUrl basePrice');
    return populatedCart;
};
exports.removeFromCart = removeFromCart;
const clearCart = async (userId) => {
    const cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        return null;
    }
    cart.items = [];
    await cart.save();
    return cart;
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.service.js.map