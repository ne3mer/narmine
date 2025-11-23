"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewStats = exports.deleteReview = exports.updateReviewStatus = exports.getApprovedReviewsForGame = exports.getReviews = exports.createReview = void 0;
const review_model_1 = require("../models/review.model");
const createReview = async (userId, input) => {
    // Check if user already reviewed this game
    const existingReview = await review_model_1.ReviewModel.findOne({
        userId,
        gameId: input.gameId
    });
    if (existingReview) {
        throw new Error('شما قبلاً برای این بازی نظر ثبت کرده‌اید');
    }
    return review_model_1.ReviewModel.create({
        userId,
        gameId: input.gameId,
        rating: input.rating,
        comment: input.comment,
        status: 'pending'
    });
};
exports.createReview = createReview;
const getReviews = async (filters) => {
    const query = {};
    if (filters.gameId) {
        query.gameId = filters.gameId;
    }
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.userId) {
        query.userId = filters.userId;
    }
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
        review_model_1.ReviewModel.find(query)
            .populate('userId', 'email name')
            .populate('gameId', 'title slug coverUrl')
            .populate('reviewedBy', 'email name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        review_model_1.ReviewModel.countDocuments(query)
    ]);
    return {
        reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getReviews = getReviews;
const getApprovedReviewsForGame = async (gameId, limit = 10) => {
    return review_model_1.ReviewModel.find({
        gameId,
        status: 'approved'
    })
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .limit(limit);
};
exports.getApprovedReviewsForGame = getApprovedReviewsForGame;
const updateReviewStatus = async (reviewId, adminId, input) => {
    const review = await review_model_1.ReviewModel.findById(reviewId);
    if (!review) {
        throw new Error('نظر پیدا نشد');
    }
    review.status = input.status;
    review.reviewedBy = adminId;
    review.reviewedAt = new Date();
    if (input.adminNote) {
        review.adminNote = input.adminNote;
    }
    await review.save();
    return review.populate(['userId', 'gameId', 'reviewedBy']);
};
exports.updateReviewStatus = updateReviewStatus;
const deleteReview = async (reviewId) => {
    return review_model_1.ReviewModel.findByIdAndDelete(reviewId);
};
exports.deleteReview = deleteReview;
const getReviewStats = async (gameId) => {
    const query = gameId ? { gameId } : {};
    const [total, pending, approved, rejected] = await Promise.all([
        review_model_1.ReviewModel.countDocuments(query),
        review_model_1.ReviewModel.countDocuments({ ...query, status: 'pending' }),
        review_model_1.ReviewModel.countDocuments({ ...query, status: 'approved' }),
        review_model_1.ReviewModel.countDocuments({ ...query, status: 'rejected' })
    ]);
    // Calculate average rating for approved reviews
    const approvedReviews = await review_model_1.ReviewModel.find({ ...query, status: 'approved' });
    const averageRating = approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;
    return {
        total,
        pending,
        approved,
        rejected,
        averageRating: Math.round(averageRating * 10) / 10
    };
};
exports.getReviewStats = getReviewStats;
//# sourceMappingURL=review.service.js.map