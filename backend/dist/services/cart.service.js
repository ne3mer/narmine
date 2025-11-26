"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cart_model_1 = require("../models/cart.model");
const game_model_1 = require("../models/game.model");
const errorHandler_1 = require("../middleware/errorHandler");
const getCart = async (userId) => {
    const cart = await cart_model_1.CartModel.findOne({ userId }).populate('items.gameId', 'title slug coverUrl basePrice');
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
    // Calculate discount percentage from main product
    const discountPercent = game.onSale && game.basePrice > (game.salePrice || game.basePrice)
        ? Math.round(((game.basePrice - (game.salePrice || game.basePrice)) / game.basePrice) * 100)
        : 0;
    if (variantId) {
        const variant = game.variants.find((v) => v.id === variantId);
        if (variant) {
            price = variant.price;
            // Apply discount to variant if main product is on sale
            if (game.onSale && discountPercent > 0) {
                const discountedVariantPrice = Math.round(variant.price * (1 - discountPercent / 100));
                // Round to nearest 1000 for cleaner prices
                price = Math.round(discountedVariantPrice / 1000) * 1000;
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
const updateCartItem = async (userId, gameId, input) => {
    const { quantity } = input;
    const cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        throw new errorHandler_1.ApiError(404, 'Cart not found');
    }
    const itemIndex = cart.items.findIndex((item) => item.gameId.toString() === gameId);
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
const removeFromCart = async (userId, gameId) => {
    const cart = await cart_model_1.CartModel.findOne({ userId });
    if (!cart) {
        throw new errorHandler_1.ApiError(404, 'Cart not found');
    }
    cart.items = cart.items.filter((item) => item.gameId.toString() !== gameId);
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