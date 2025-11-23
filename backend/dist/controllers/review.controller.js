"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewStatsController = exports.deleteReviewController = exports.updateReviewStatusController = exports.getGameReviewsController = exports.getReviewsController = exports.createReviewController = void 0;
const validateResource_1 = require("../middleware/validateResource");
const review_schema_1 = require("../schemas/review.schema");
const review_service_1 = require("../services/review.service");
const game_model_1 = require("../models/game.model");
const user_model_1 = require("../models/user.model");
const adminNotification_service_1 = require("../services/adminNotification.service");
exports.createReviewController = [
    (0, validateResource_1.validateResource)(review_schema_1.createReviewSchema),
    async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
                });
            }
            const review = await (0, review_service_1.createReview)(userId, req.body);
            const [game, user] = await Promise.all([
                game_model_1.GameModel.findById(review.gameId).select('title').lean(),
                user_model_1.UserModel.findById(userId).select('name email').lean()
            ]);
            (0, adminNotification_service_1.notifyAdminsOfEvent)({
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در ثبت نظر'
            });
        }
    }
];
exports.getReviewsController = [
    (0, validateResource_1.validateResource)(review_schema_1.getReviewsSchema),
    async (req, res) => {
        try {
            const result = await (0, review_service_1.getReviews)(req.query);
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در دریافت نظرات'
            });
        }
    }
];
const getGameReviewsController = async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const reviews = await (0, review_service_1.getApprovedReviewsForGame)(gameId, limit);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت نظرات'
        });
    }
};
exports.getGameReviewsController = getGameReviewsController;
exports.updateReviewStatusController = [
    (0, validateResource_1.validateResource)(review_schema_1.updateReviewStatusSchema),
    async (req, res) => {
        try {
            const adminId = req.user?.id;
            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: 'دسترسی غیرمجاز'
                });
            }
            const review = await (0, review_service_1.updateReviewStatus)(req.params.id, adminId, req.body);
            res.json({
                success: true,
                message: `نظر ${req.body.status === 'approved' ? 'تأیید' : 'رد'} شد`,
                data: review
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی نظر'
            });
        }
    }
];
exports.deleteReviewController = [
    (0, validateResource_1.validateResource)(review_schema_1.deleteReviewSchema),
    async (req, res) => {
        try {
            const review = await (0, review_service_1.deleteReview)(req.params.id);
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'خطا در حذف نظر'
            });
        }
    }
];
const getReviewStatsController = async (req, res) => {
    try {
        const gameId = req.query.gameId;
        const stats = await (0, review_service_1.getReviewStats)(gameId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت آمار'
        });
    }
};
exports.getReviewStatsController = getReviewStatsController;
//# sourceMappingURL=review.controller.js.map