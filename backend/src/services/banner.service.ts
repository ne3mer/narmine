import { BannerModel, type BannerDocument, type BannerType, type BannerLayout } from '../models/banner.model';
import { ApiError } from '../middleware/errorHandler';

export interface CreateBannerInput {
  name: string;
  type: BannerType;
  layout: BannerLayout;
  active?: boolean;
  priority?: number;
  displayOn?: string[];
  background: any;
  elements: any[];
  containerStyle?: any;
  entranceAnimation?: string;
  exitAnimation?: string;
  hoverEffects?: any;
  mobileSettings?: any;
  displayRules?: any;
}

export const createBanner = async (input: CreateBannerInput) => {
  try {
    const banner = await BannerModel.create(input);
    return banner;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      throw new ApiError(400, `خطا در اعتبارسنجی: ${error.message}`);
    }
    throw error;
  }
};

export const getAllBanners = async (activeOnly?: boolean) => {
  const query: any = {};
  if (activeOnly) {
    query.active = true;
  }
  
  return BannerModel.find(query).sort({ priority: -1, createdAt: -1 });
};

export const getBannersForPage = async (page: string, userId?: string, userRole?: string) => {
  const now = new Date();
  
  // Build query with proper $and/$or structure
  const query: any = {
    active: true,
    $and: [
      {
        $or: [
          { displayOn: 'all' },
          { displayOn: page },
          { displayOn: { $in: [page, 'all'] } }
        ]
      },
      {
        $or: [
          { 'displayRules.startDate': { $exists: false } },
          { 'displayRules.startDate': { $lte: now } }
        ]
      },
      {
        $or: [
          { 'displayRules.endDate': { $exists: false } },
          { 'displayRules.endDate': { $gte: now } }
        ]
      }
    ]
  };
  
  const banners = await BannerModel.find(query).sort({ priority: -1 });

  // Filter by user rules
  return banners.filter(banner => {
    if (!banner.displayRules) return true;
    
    const rules = banner.displayRules;
    
    // Check user authentication status
    if (rules.showToUsers && rules.showToUsers.length > 0) {
      const isAuthenticated = !!userId;
      if (rules.showToUsers.includes('authenticated') && !isAuthenticated) return false;
      if (rules.showToUsers.includes('guest') && isAuthenticated) return false;
    }
    
    // Check user role
    if (rules.showToRoles && rules.showToRoles.length > 0 && userRole) {
      if (!rules.showToRoles.includes(userRole as any)) return false;
    }
    
    // Check view/click limits
    if (rules.maxViews && banner.views && banner.views >= rules.maxViews) return false;
    if (rules.maxClicks && banner.clicks && banner.clicks >= rules.maxClicks) return false;
    
    return true;
  });
};

export const getBannerById = async (id: string) => {
  const banner = await BannerModel.findById(id);
  if (!banner) {
    throw new ApiError(404, 'بنر یافت نشد');
  }
  return banner;
};

export const updateBanner = async (id: string, updates: Partial<BannerDocument>) => {
  try {
    const banner = await BannerModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      throw new ApiError(404, 'بنر یافت نشد');
    }
    
    return banner;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      throw new ApiError(400, `خطا در اعتبارسنجی: ${error.message}`);
    }
    if (error.name === 'CastError') {
      throw new ApiError(400, 'شناسه بنر نامعتبر است');
    }
    throw error;
  }
};

export const deleteBanner = async (id: string) => {
  const banner = await BannerModel.findByIdAndDelete(id);
  if (!banner) {
    throw new ApiError(404, 'بنر یافت نشد');
  }
  return { message: 'بنر حذف شد' };
};

export const incrementBannerViews = async (id: string) => {
  await BannerModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
};

export const incrementBannerClicks = async (id: string) => {
  await BannerModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
};

