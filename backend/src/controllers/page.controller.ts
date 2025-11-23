import type { Request, Response } from 'express';
import * as pageService from '../services/page.service';

export const getAllPages = async (_req: Request, res: Response) => {
  const pages = await pageService.getAllPages();
  res.json({ data: pages });
};

export const getPageBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = await pageService.getPageBySlug(slug);
  res.json({ data: page });
};

export const updatePage = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  
  const page = await pageService.updatePage(slug, req.body, userId);
  res.json({ 
    message: 'صفحه با موفقیت به‌روزرسانی شد',
    data: page 
  });
};

export const createPage = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = await pageService.createPage(req.body, userId);
  res.status(201).json({
    message: 'صفحه با موفقیت ایجاد شد',
    data: page
  });
};
