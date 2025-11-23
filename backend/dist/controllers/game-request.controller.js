"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameRequest = exports.updateGameRequestStatus = exports.getAllGameRequests = exports.getUserGameRequests = exports.createGameRequest = void 0;
const game_request_model_1 = require("../models/game-request.model");
const notification_model_1 = require("../models/notification.model");
const user_model_1 = require("../models/user.model");
const adminNotification_service_1 = require("../services/adminNotification.service");
// Create a new game request
const createGameRequest = async (req, res) => {
    try {
        const { gameName, platform, region, description } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید' });
        }
        // Validation
        if (!gameName || !platform || !region || !description) {
            return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید' });
        }
        const gameRequest = await game_request_model_1.GameRequest.create({
            userId,
            gameName,
            platform,
            region,
            description,
            status: 'pending'
        });
        let requesterName;
        let requesterEmail = req.user?.email;
        if (userId) {
            const requester = await user_model_1.UserModel.findById(userId).select('name email').lean();
            requesterName = requester?.name || undefined;
            requesterEmail = requester?.email || requesterEmail;
        }
        (0, adminNotification_service_1.notifyAdminsOfEvent)({
            type: 'game_request_created',
            requestId: gameRequest._id.toString(),
            gameName,
            platform,
            region,
            description,
            createdAt: gameRequest.createdAt,
            requestedBy: requesterName || requesterEmail ? { name: requesterName, email: requesterEmail } : undefined
        }).catch((error) => {
            console.error('Failed to send admin notification for game request:', error);
        });
        res.status(201).json({
            message: 'درخواست شما با موفقیت ثبت شد',
            data: gameRequest
        });
    }
    catch (error) {
        console.error('Error creating game request:', error);
        res.status(500).json({ message: error.message || 'خطا در ثبت درخواست' });
    }
};
exports.createGameRequest = createGameRequest;
// Get user's game requests
const getUserGameRequests = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید' });
        }
        const requests = await game_request_model_1.GameRequest.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ data: requests });
    }
    catch (error) {
        console.error('Error fetching user game requests:', error);
        res.status(500).json({ message: error.message || 'خطا در دریافت درخواست‌ها' });
    }
};
exports.getUserGameRequests = getUserGameRequests;
// Get all game requests (Admin only)
const getAllGameRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        const requests = await game_request_model_1.GameRequest.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .lean();
        // Get statistics
        const stats = await game_request_model_1.GameRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const statistics = {
            total: requests.length,
            pending: stats.find(s => s._id === 'pending')?.count || 0,
            approved: stats.find(s => s._id === 'approved')?.count || 0,
            rejected: stats.find(s => s._id === 'rejected')?.count || 0,
            fulfilled: stats.find(s => s._id === 'fulfilled')?.count || 0
        };
        res.json({
            data: requests,
            statistics
        });
    }
    catch (error) {
        console.error('Error fetching all game requests:', error);
        res.status(500).json({ message: error.message || 'خطا در دریافت درخواست‌ها' });
    }
};
exports.getAllGameRequests = getAllGameRequests;
// Update game request status (Admin only)
const updateGameRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'وضعیت الزامی است' });
        }
        const validStatuses = ['pending', 'approved', 'rejected', 'fulfilled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'وضعیت نامعتبر است' });
        }
        const gameRequest = await game_request_model_1.GameRequest.findById(id);
        if (!gameRequest) {
            return res.status(404).json({ message: 'درخواست یافت نشد' });
        }
        const oldStatus = gameRequest.status;
        gameRequest.status = status;
        if (adminResponse) {
            gameRequest.adminResponse = adminResponse;
        }
        if (status !== 'pending') {
            gameRequest.respondedAt = new Date();
        }
        await gameRequest.save();
        // Create notification for user if status changed
        if (oldStatus !== status) {
            let notificationMessage = '';
            let notificationType = 'info';
            switch (status) {
                case 'approved':
                    notificationMessage = `درخواست بازی "${gameRequest.gameName}" تایید شد`;
                    notificationType = 'success';
                    break;
                case 'rejected':
                    notificationMessage = `درخواست بازی "${gameRequest.gameName}" رد شد`;
                    notificationType = 'warning';
                    break;
                case 'fulfilled':
                    notificationMessage = `بازی "${gameRequest.gameName}" به کاتالوگ اضافه شد!`;
                    notificationType = 'success';
                    break;
            }
            if (notificationMessage) {
                await notification_model_1.NotificationModel.create({
                    userId: gameRequest.userId,
                    type: 'system',
                    subject: notificationMessage,
                    message: adminResponse || notificationMessage
                });
            }
        }
        res.json({
            message: 'وضعیت درخواست با موفقیت به‌روزرسانی شد',
            data: gameRequest
        });
    }
    catch (error) {
        console.error('Error updating game request:', error);
        res.status(500).json({ message: error.message || 'خطا در به‌روزرسانی درخواست' });
    }
};
exports.updateGameRequestStatus = updateGameRequestStatus;
// Delete game request
const deleteGameRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const gameRequest = await game_request_model_1.GameRequest.findById(id);
        if (!gameRequest) {
            return res.status(404).json({ message: 'درخواست یافت نشد' });
        }
        // Users can only delete their own pending requests
        if (!isAdmin && (gameRequest.userId.toString() !== userId || gameRequest.status !== 'pending')) {
            return res.status(403).json({ message: 'شما مجاز به حذف این درخواست نیستید' });
        }
        await game_request_model_1.GameRequest.findByIdAndDelete(id);
        res.json({ message: 'درخواست با موفقیت حذف شد' });
    }
    catch (error) {
        console.error('Error deleting game request:', error);
        res.status(500).json({ message: error.message || 'خطا در حذف درخواست' });
    }
};
exports.deleteGameRequest = deleteGameRequest;
//# sourceMappingURL=game-request.controller.js.map