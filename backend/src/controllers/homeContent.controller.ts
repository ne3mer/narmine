import type { Request, Response } from 'express';
import { getOrCreateHomeContent, updateHomeContent, type HomeContentUpdatePayload } from '../services/homeContent.service';

export const getHomeContentHandler = async (_req: Request, res: Response) => {
  const settings = await getOrCreateHomeContent();
  res.json({ data: { settings } });
};

export const updateHomeContentHandler = async (req: Request<unknown, unknown, HomeContentUpdatePayload>, res: Response) => {
  const updated = await updateHomeContent(req.body);
  res.json({ data: { settings: updated } });
};
