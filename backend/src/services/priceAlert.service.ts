import { PriceAlertModel, type PriceAlertDocument } from '../models/priceAlert.model';
import { ApiError } from '../middleware/errorHandler';

export interface CreatePriceAlertInput {
  userId?: string;
  gameId: string;
  targetPrice: number;
  channel: 'email' | 'telegram';
  destination: string;
}

export const createPriceAlert = async (input: CreatePriceAlertInput) => {
  // Check if user already has an active alert for this game with same or lower target price
  if (input.userId) {
    const existing = await PriceAlertModel.findOne({
      userId: input.userId,
      gameId: input.gameId,
      active: true,
      targetPrice: { $lte: input.targetPrice }
    });

    if (existing) {
      throw new ApiError(400, 'شما قبلاً یک هشدار فعال برای این بازی با قیمت پایین‌تر یا مساوی دارید');
    }
  }

  const alert = await PriceAlertModel.create({
    userId: input.userId,
    gameId: input.gameId,
    targetPrice: input.targetPrice,
    channel: input.channel,
    destination: input.destination,
    active: true
  });

  return alert.populate('gameId', 'title slug basePrice coverUrl');
};

export const getUserPriceAlerts = async (userId: string) => {
  return PriceAlertModel.find({ userId, active: true })
    .populate('gameId', 'title slug basePrice coverUrl')
    .sort({ createdAt: -1 });
};

export const getPriceAlertById = async (alertId: string, userId?: string) => {
  const query: any = { _id: alertId };
  if (userId) {
    query.userId = userId;
  }

  const alert = await PriceAlertModel.findOne(query).populate('gameId', 'title slug basePrice coverUrl');
  
  if (!alert) {
    throw new ApiError(404, 'هشدار قیمت یافت نشد');
  }

  return alert;
};

export const updatePriceAlert = async (alertId: string, userId: string, updates: Partial<Pick<PriceAlertDocument, 'targetPrice' | 'channel' | 'destination' | 'active'>>) => {
  const alert = await PriceAlertModel.findOneAndUpdate(
    { _id: alertId, userId },
    updates,
    { new: true, runValidators: true }
  ).populate('gameId', 'title slug basePrice coverUrl');

  if (!alert) {
    throw new ApiError(404, 'هشدار قیمت یافت نشد یا متعلق به شما نیست');
  }

  return alert;
};

export const deletePriceAlert = async (alertId: string, userId: string) => {
  const alert = await PriceAlertModel.findOneAndDelete({ _id: alertId, userId });
  
  if (!alert) {
    throw new ApiError(404, 'هشدار قیمت یافت نشد یا متعلق به شما نیست');
  }

  return { message: 'هشدار قیمت حذف شد' };
};

export const getActiveAlertsForGame = async (gameId: string) => {
  return PriceAlertModel.find({
    gameId,
    active: true
  }).populate('userId', 'email name telegram');
};

// Check and trigger price alerts for a game
export const checkAndTriggerPriceAlerts = async (gameId: string, currentPrice: number) => {
  const alerts = await getActiveAlertsForGame(gameId);
  const triggeredAlerts: string[] = [];

  for (const alert of alerts) {
    // Check if current price is less than or equal to target price
    if (currentPrice <= alert.targetPrice) {
      try {
        const game = alert.gameId as any;
        if (!game) continue;

        const gameTitle = game.title || 'بازی';
        const { env } = await import('../config/env');
        const gameUrl = `${env.CLIENT_URL}/games/${game.slug || gameId}`;
        const userId = alert.userId ? (alert.userId as any)._id?.toString() : undefined;

        // Send notification
        const { sendPriceAlert } = await import('./notificationSender.service');
        await sendPriceAlert(
          userId,
          gameTitle,
          currentPrice,
          alert.targetPrice,
          gameUrl,
          alert.channel,
          alert.destination
        );

        // Deactivate alert after sending
        await PriceAlertModel.findByIdAndUpdate(alert._id, { active: false });
        triggeredAlerts.push(alert._id.toString());

        console.log(`✅ Price alert triggered for ${gameTitle} - ${alert.channel}:${alert.destination}`);
      } catch (error) {
        console.error(`Failed to trigger price alert ${alert._id}:`, error);
      }
    }
  }

  return triggeredAlerts;
};

