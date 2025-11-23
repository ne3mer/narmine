import type { Request, Response } from 'express';
import * as bannerService from '../services/banner.service';
import { ApiError } from '../middleware/errorHandler';

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await bannerService.createBanner(req.body);
    res.status(201).json({
      message: 'بنر با موفقیت ایجاد شد',
      data: banner
    });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    throw error;
  }
};

export const getAllBanners = async (req: Request, res: Response) => {
  const activeOnly = req.query.active === 'true';
  const banners = await bannerService.getAllBanners(activeOnly);
  res.json({ data: banners });
};

export const getBannersForPage = async (req: Request, res: Response) => {
  const { page } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  
  const banners = await bannerService.getBannersForPage(page, userId, userRole);
  res.json({ data: banners });
};

export const getBannerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const banner = await bannerService.getBannerById(id);
  res.json({ data: banner });
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await bannerService.updateBanner(id, req.body);
    res.json({
      message: 'بنر به‌روزرسانی شد',
      data: banner
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    throw error; // Let error handler middleware handle it
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  await bannerService.deleteBanner(id);
  res.status(204).send();
};

export const trackBannerView = async (req: Request, res: Response) => {
  const { id } = req.params;
  await bannerService.incrementBannerViews(id);
  res.json({ message: 'View tracked' });
};

export const trackBannerClick = async (req: Request, res: Response) => {
  const { id } = req.params;
  await bannerService.incrementBannerClicks(id);
  res.json({ message: 'Click tracked' });
};

