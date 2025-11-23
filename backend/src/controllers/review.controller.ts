import type { Request, Response } from 'express';
import { validateResource } from '../middleware/validateResource';
import {
  createReviewSchema,
  getReviewsSchema,
  updateReviewStatusSchema,
  deleteReviewSchema
} from '../schemas/review.schema';
import {
  createReview,
  getReviews,
  getApprovedReviewsForGame,
  updateReviewStatus,
  deleteReview,
  getReviewStats
} from '../services/review.service';
import { GameModel } from '../models/game.model';
import { UserModel } from '../models/user.model';
import { notifyAdminsOfEvent } from '../services/adminNotification.service';

export const createReviewController = [
  validateResource(createReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
        });
      }

      const review = await createReview(userId, req.body);

      const [game, user] = await Promise.all([
        GameModel.findById(review.gameId).select('title').lean(),
        UserModel.findById(userId).select('name email').lean()
      ]);

      notifyAdminsOfEvent({
        type: 'review_submitted',
        reviewId: review._id.toString(),
        gameTitle: game?.title || 'بازی ناشناس',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        submittedBy: user ? { name: user.name, email: user.email } : undefined
      }).catch((error) => {
        console.error('Failed to notify admins about new review:', error);
      });
      
      res.status(201).json({
        success: true,
        message: 'نظر شما با موفقیت ثبت شد و پس از تأیید ادمین نمایش داده می‌شود',
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در ثبت نظر'
      });
    }
  }
];

export const getReviewsController = [
  validateResource(getReviewsSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await getReviews(req.query as any);
      res.json({
        success: true,
        data: result.reviews,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در دریافت نظرات'
      });
    }
  }
];

export const getGameReviewsController = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    const reviews = await getApprovedReviewsForGame(gameId, limit);
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت نظرات'
    });
  }
};

export const updateReviewStatusController = [
  validateResource(updateReviewStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const adminId = (req as any).user?.id;
      
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
      }

      const review = await updateReviewStatus(req.params.id, adminId, req.body);
      
      res.json({
        success: true,
        message: `نظر ${req.body.status === 'approved' ? 'تأیید' : 'رد'} شد`,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی نظر'
      });
    }
  }
];

export const deleteReviewController = [
  validateResource(deleteReviewSchema),
  async (req: Request, res: Response) => {
    try {
      const review = await deleteReview(req.params.id);
      
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'نظر پیدا نشد'
        });
      }

      res.json({
        success: true,
        message: 'نظر حذف شد'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'خطا در حذف نظر'
      });
    }
  }
];

export const getReviewStatsController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query.gameId as string | undefined;
    const stats = await getReviewStats(gameId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در دریافت آمار'
    });
  }
};



