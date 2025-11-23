import { ReviewModel, type ReviewDocument, type ReviewStatus } from '../models/review.model';
import type { z } from 'zod';
import type { createReviewSchema, getReviewsSchema, updateReviewStatusSchema } from '../schemas/review.schema';

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type GetReviewsInput = z.infer<typeof getReviewsSchema>['query'];
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>['body'];

export const createReview = async (userId: string, input: CreateReviewInput) => {
  // Check if user already reviewed this game
  const existingReview = await ReviewModel.findOne({
    userId,
    gameId: input.gameId
  });

  if (existingReview) {
    throw new Error('شما قبلاً برای این بازی نظر ثبت کرده‌اید');
  }

  return ReviewModel.create({
    userId,
    gameId: input.gameId,
    rating: input.rating,
    comment: input.comment,
    status: 'pending'
  });
};

export const getReviews = async (filters: GetReviewsInput) => {
  const query: any = {};

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
    ReviewModel.find(query)
      .populate('userId', 'email name')
      .populate('gameId', 'title slug coverUrl')
      .populate('reviewedBy', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ReviewModel.countDocuments(query)
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getApprovedReviewsForGame = async (gameId: string, limit: number = 10) => {
  return ReviewModel.find({
    gameId,
    status: 'approved'
  })
    .populate('userId', 'email name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const updateReviewStatus = async (reviewId: string, adminId: string, input: UpdateReviewStatusInput) => {
  const review = await ReviewModel.findById(reviewId);
  
  if (!review) {
    throw new Error('نظر پیدا نشد');
  }

  review.status = input.status;
  review.reviewedBy = adminId as any;
  review.reviewedAt = new Date();
  
  if (input.adminNote) {
    review.adminNote = input.adminNote;
  }

  await review.save();
  return review.populate(['userId', 'gameId', 'reviewedBy']);
};

export const deleteReview = async (reviewId: string) => {
  return ReviewModel.findByIdAndDelete(reviewId);
};

export const getReviewStats = async (gameId?: string) => {
  const query = gameId ? { gameId } : {};
  
  const [total, pending, approved, rejected] = await Promise.all([
    ReviewModel.countDocuments(query),
    ReviewModel.countDocuments({ ...query, status: 'pending' }),
    ReviewModel.countDocuments({ ...query, status: 'approved' }),
    ReviewModel.countDocuments({ ...query, status: 'rejected' })
  ]);

  // Calculate average rating for approved reviews
  const approvedReviews = await ReviewModel.find({ ...query, status: 'approved' });
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




