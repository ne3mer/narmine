import type { Request, Response } from 'express';
import * as priceAlertService from '../services/priceAlert.service';

export const createPriceAlert = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { gameId, targetPrice, channel, destination } = req.body;

  const alert = await priceAlertService.createPriceAlert({
    userId,
    gameId,
    targetPrice,
    channel,
    destination
  });

  res.status(201).json({
    message: 'هشدار قیمت با موفقیت ایجاد شد',
    data: alert
  });
};

export const getUserPriceAlerts = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const alerts = await priceAlertService.getUserPriceAlerts(userId);
  res.json({ data: alerts });
};

export const getPriceAlertById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  const alert = await priceAlertService.getPriceAlertById(id, userId);
  res.json({ data: alert });
};

export const updatePriceAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const updates = req.body;

  const alert = await priceAlertService.updatePriceAlert(id, userId, updates);
  res.json({
    message: 'هشدار قیمت به‌روزرسانی شد',
    data: alert
  });
};

export const deletePriceAlert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  await priceAlertService.deletePriceAlert(id, userId);
  res.status(204).send();
};

