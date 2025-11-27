"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRequestModel = void 0;
const mongoose_1 = require("mongoose");
const gameRequestSchema = new mongoose_1.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminNote: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            const { _id, __v, ...rest } = ret;
            return { ...rest, id: _id };
        }
    }
});
exports.GameRequestModel = (0, mongoose_1.model)('GameRequest', gameRequestSchema);
//# sourceMappingURL=gameRequest.model.js.map