import { defaultMarketingSettings } from '../data/marketingDefaults';
import { MarketingModel, type MarketingDocument, type Campaign } from '../models/marketing.model';
import { OrderModel } from '../models/order.model';

export interface MarketingMetrics {
  totalOrders: number;
  paidOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  currentOrders: number;
  previousOrders: number;
  currentRevenue: number;
  previousRevenue: number;
  totalSpend: number;
  ctr: { current: number; previous: number };
  cvr: { current: number; previous: number };
  cac: { current: number; previous: number };
  roi: { current: number; previous: number };
  avgOrderValue: number;
}

export interface MarketingUpdatePayload {
  bannerContent?: MarketingDocument['bannerContent'];
  campaigns?: MarketingDocument['campaigns'];
  utmBuilder?: MarketingDocument['utmBuilder'];
  experimentSplit?: MarketingDocument['experimentSplit'];
}

const MILLION = 1_000_000;
const DAYS_RANGE = 30;

const sumCampaignSpend = (campaigns: Campaign[]) => {
  return campaigns.reduce((acc, campaign) => acc + (campaign.budget || 0), 0) * MILLION;
};

const buildRevenuePipeline = (start: Date, end?: Date) => {
  const match: Record<string, unknown> = { paymentStatus: 'paid', createdAt: { $gte: start } };
  if (end) {
    match.createdAt = { $gte: start, $lt: end };
  }

  return [
    { $match: match },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ];
};

const extractTotal = (result: Array<{ total: number }>) => (result[0]?.total ?? 0);

export const getOrCreateMarketingSettings = async () => {
  let settings = await MarketingModel.findOne();
  if (!settings) {
    settings = await MarketingModel.create(defaultMarketingSettings);
  }
  return settings;
};

export const updateMarketingSettings = async (payload: MarketingUpdatePayload) => {
  let settings = await MarketingModel.findOne();
  if (!settings) {
    settings = new MarketingModel(defaultMarketingSettings);
  }

  if (payload.bannerContent) {
    settings.bannerContent = payload.bannerContent;
  }
  if (payload.campaigns) {
    settings.campaigns = payload.campaigns;
  }
  if (payload.utmBuilder) {
    settings.utmBuilder = payload.utmBuilder;
  }
  if (typeof payload.experimentSplit === 'number') {
    settings.experimentSplit = payload.experimentSplit;
  }

  await settings.save();
  return settings;
};

export const buildMarketingMetrics = async (campaigns: Campaign[]): Promise<MarketingMetrics> => {
  const now = new Date();
  const currentRangeStart = new Date(now.getTime() - DAYS_RANGE * 24 * 60 * 60 * 1000);
  const previousRangeStart = new Date(currentRangeStart.getTime() - DAYS_RANGE * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    paidOrders,
    deliveredOrders,
    totalRevenueResult,
    currentOrders,
    previousOrders,
    currentPaid,
    previousPaid,
    currentDelivered,
    previousDelivered,
    currentRevenueResult,
    previousRevenueResult
  ] = await Promise.all([
    OrderModel.countDocuments(),
    OrderModel.countDocuments({ paymentStatus: 'paid' }),
    OrderModel.countDocuments({ fulfillmentStatus: 'delivered' }),
    OrderModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    OrderModel.countDocuments({ createdAt: { $gte: currentRangeStart } }),
    OrderModel.countDocuments({ createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
    OrderModel.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: currentRangeStart } }),
    OrderModel.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
    OrderModel.countDocuments({ fulfillmentStatus: 'delivered', createdAt: { $gte: currentRangeStart } }),
    OrderModel.countDocuments({ fulfillmentStatus: 'delivered', createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
    OrderModel.aggregate(buildRevenuePipeline(currentRangeStart)),
    OrderModel.aggregate(buildRevenuePipeline(previousRangeStart, currentRangeStart))
  ]);

  const totalRevenue = extractTotal(totalRevenueResult);
  const currentRevenue = extractTotal(currentRevenueResult);
  const previousRevenue = extractTotal(previousRevenueResult);
  const totalSpend = sumCampaignSpend(campaigns);

  const computeRatio = (numerator: number, denominator: number) => (denominator > 0 ? (numerator / denominator) * 100 : 0);
  const computeDelta = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const currentCtr = computeRatio(currentPaid, currentOrders);
  const previousCtr = computeRatio(previousPaid, previousOrders);

  const currentCvr = computeRatio(currentDelivered, currentPaid);
  const previousCvr = computeRatio(previousDelivered, previousPaid);

  const currentCac = currentPaid > 0 ? totalSpend / currentPaid : 0;
  const previousCac = previousPaid > 0 ? totalSpend / previousPaid : currentCac;

  const currentRoi = totalSpend > 0 ? (currentRevenue / totalSpend) * 100 : 0;
  const previousRoi = totalSpend > 0 ? (previousRevenue / totalSpend) * 100 : currentRoi;

  return {
    totalOrders,
    paidOrders,
    deliveredOrders,
    totalRevenue,
    currentOrders,
    previousOrders,
    currentRevenue,
    previousRevenue,
    totalSpend,
    ctr: { current: currentCtr, previous: previousCtr },
    cvr: { current: currentCvr, previous: previousCvr },
    cac: { current: currentCac, previous: previousCac },
    roi: { current: currentRoi, previous: previousRoi },
    avgOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0
  };
};
