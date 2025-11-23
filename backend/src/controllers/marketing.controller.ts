import type { Request, Response } from 'express';
import {
  buildMarketingMetrics,
  getOrCreateMarketingSettings,
  updateMarketingSettings,
  type MarketingUpdatePayload
} from '../services/marketing.service';

export const getMarketingSettingsHandler = async (_req: Request, res: Response) => {
  const settings = await getOrCreateMarketingSettings();
  const metrics = await buildMarketingMetrics(settings.campaigns);

  res.json({
    data: {
      settings,
      metrics
    }
  });
};

export const updateMarketingSettingsHandler = async (req: Request<unknown, unknown, MarketingUpdatePayload>, res: Response) => {
  const updated = await updateMarketingSettings(req.body);
  const metrics = await buildMarketingMetrics(updated.campaigns);

  res.json({
    data: {
      settings: updated,
      metrics
    }
  });
};
