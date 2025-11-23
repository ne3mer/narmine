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
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cartService = __importStar(require("../services/cart.service"));
const getCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const cart = await cartService.getCart(userId);
    res.json({
        success: true,
        data: cart
    });
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const cart = await cartService.addToCart(userId, req.body);
    res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cart
    });
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { gameId } = req.params;
    const cart = await cartService.updateCartItem(userId, gameId, req.body);
    res.json({
        success: true,
        message: 'Cart updated',
        data: cart
    });
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { gameId } = req.params;
    const cart = await cartService.removeFromCart(userId, gameId);
    res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart
    });
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const cart = await cartService.clearCart(userId);
    res.json({
        success: true,
        message: 'Cart cleared',
        data: cart
    });
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.controller.js.map