"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = void 0;
const mongoose_1 = require("mongoose");
const cartItemSchema = new mongoose_1.Schema({
    gameId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    variantId: {
        type: String
    },
    selectedOptions: {
        type: Map,
        of: String
    },
    priceAtAdd: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });
const cartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            const { _id, __v, ...rest } = ret;
            return { ...rest, id: _id };
        }
    }
});
// Index for faster queries
// cartSchema.index({ userId: 1 }); // Removed duplicate index (already defined as unique in schema)
exports.CartModel = (0, mongoose_1.model)('Cart', cartSchema);
//# sourceMappingURL=cart.model.js.map