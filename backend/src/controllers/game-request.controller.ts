import { Request, Response } from 'express';
import { GameRequest } from '../models/game-request.model';
import { NotificationModel } from '../models/notification.model';
import { UserModel } from '../models/user.model';
import { notifyAdminsOfEvent } from '../services/adminNotification.service';

// Create a new game request
export const createGameRequest = async (req: Request, res: Response) => {
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

    const gameRequest = await GameRequest.create({
      userId,
      gameName,
      platform,
      region,
      description,
      status: 'pending'
    });

    let requesterName: string | undefined;
    let requesterEmail: string | undefined = req.user?.email;

    if (userId) {
      const requester = await UserModel.findById(userId).select('name email').lean();
      requesterName = requester?.name || undefined;
      requesterEmail = requester?.email || requesterEmail;
    }

    notifyAdminsOfEvent({
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
  } catch (error: any) {
    console.error('Error creating game request:', error);
    res.status(500).json({ message: error.message || 'خطا در ثبت درخواست' });
  }
};

// Get user's game requests
export const getUserGameRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید' });
    }

    const requests = await GameRequest.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: requests });
  } catch (error: any) {
    console.error('Error fetching user game requests:', error);
    res.status(500).json({ message: error.message || 'خطا در دریافت درخواست‌ها' });
  }
};

// Get all game requests (Admin only)
export const getAllGameRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await GameRequest.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get statistics
    const stats = await GameRequest.aggregate([
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
  } catch (error: any) {
    console.error('Error fetching all game requests:', error);
    res.status(500).json({ message: error.message || 'خطا در دریافت درخواست‌ها' });
  }
};

// Update game request status (Admin only)
export const updateGameRequestStatus = async (req: Request, res: Response) => {
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

    const gameRequest = await GameRequest.findById(id);
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
      let notificationType: 'info' | 'success' | 'warning' = 'info';

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
        await NotificationModel.create({
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
  } catch (error: any) {
    console.error('Error updating game request:', error);
    res.status(500).json({ message: error.message || 'خطا در به‌روزرسانی درخواست' });
  }
};

// Delete game request
export const deleteGameRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const gameRequest = await GameRequest.findById(id);
    if (!gameRequest) {
      return res.status(404).json({ message: 'درخواست یافت نشد' });
    }

    // Users can only delete their own pending requests
    if (!isAdmin && (gameRequest.userId.toString() !== userId || gameRequest.status !== 'pending')) {
      return res.status(403).json({ message: 'شما مجاز به حذف این درخواست نیستید' });
    }

    await GameRequest.findByIdAndDelete(id);

    res.json({ message: 'درخواست با موفقیت حذف شد' });
  } catch (error: any) {
    console.error('Error deleting game request:', error);
    res.status(500).json({ message: error.message || 'خطا در حذف درخواست' });
  }
};
