import { PageModel } from '../models/page.model';
import { ApiError } from '../middleware/errorHandler';

export const getAllPages = async () => {
  return PageModel.find({ isActive: true }).select('-__v').sort({ pageSlug: 1 });
};

export const getPageBySlug = async (slug: string) => {
  const page = await PageModel.findOne({ pageSlug: slug, isActive: true }).select('-__v');
  if (!page) {
    throw new ApiError(404, 'صفحه یافت نشد');
  }
  return page;
};

export const updatePage = async (slug: string, updates: any, userId: string) => {
  const page = await PageModel.findOneAndUpdate(
    { pageSlug: slug },
    { 
      ...updates,
      updatedBy: userId
    },
    { new: true, runValidators: true }
  );
  
  if (!page) {
    throw new ApiError(404, 'صفحه یافت نشد');
  }
  
  return page;
};

export const createPage = async (pageData: any, userId: string) => {
  const page = new PageModel({
    ...pageData,
    updatedBy: userId
  });
  
  await page.save();
  return page;
};
