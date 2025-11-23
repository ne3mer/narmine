"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    gameId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Game', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, minlength: 10 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
}, { timestamps: true });
reviewSchema.index({ gameId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, gameId: 1 }); // Prevent duplicate reviews
reviewSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { ...rest, id: _id };
    }
});
exports.ReviewModel = (0, mongoose_1.model)('Review', reviewSchema);
//# sourceMappingURL=review.model.js.map