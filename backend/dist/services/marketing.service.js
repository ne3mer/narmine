"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMarketingMetrics = exports.updateMarketingSettings = exports.getOrCreateMarketingSettings = void 0;
const marketingDefaults_1 = require("../data/marketingDefaults");
const marketing_model_1 = require("../models/marketing.model");
const order_model_1 = require("../models/order.model");
const MILLION = 1_000_000;
const DAYS_RANGE = 30;
const sumCampaignSpend = (campaigns) => {
    return campaigns.reduce((acc, campaign) => acc + (campaign.budget || 0), 0) * MILLION;
};
const buildRevenuePipeline = (start, end) => {
    const match = { paymentStatus: 'paid', createdAt: { $gte: start } };
    if (end) {
        match.createdAt = { $gte: start, $lt: end };
    }
    return [
        { $match: match },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ];
};
const extractTotal = (result) => (result[0]?.total ?? 0);
const getOrCreateMarketingSettings = async () => {
    let settings = await marketing_model_1.MarketingModel.findOne();
    if (!settings) {
        settings = await marketing_model_1.MarketingModel.create(marketingDefaults_1.defaultMarketingSettings);
    }
    return settings;
};
exports.getOrCreateMarketingSettings = getOrCreateMarketingSettings;
const updateMarketingSettings = async (payload) => {
    let settings = await marketing_model_1.MarketingModel.findOne();
    if (!settings) {
        settings = new marketing_model_1.MarketingModel(marketingDefaults_1.defaultMarketingSettings);
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
exports.updateMarketingSettings = updateMarketingSettings;
const buildMarketingMetrics = async (campaigns) => {
    const now = new Date();
    const currentRangeStart = new Date(now.getTime() - DAYS_RANGE * 24 * 60 * 60 * 1000);
    const previousRangeStart = new Date(currentRangeStart.getTime() - DAYS_RANGE * 24 * 60 * 60 * 1000);
    const [totalOrders, paidOrders, deliveredOrders, totalRevenueResult, currentOrders, previousOrders, currentPaid, previousPaid, currentDelivered, previousDelivered, currentRevenueResult, previousRevenueResult] = await Promise.all([
        order_model_1.OrderModel.countDocuments(),
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'paid' }),
        order_model_1.OrderModel.countDocuments({ fulfillmentStatus: 'delivered' }),
        order_model_1.OrderModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        order_model_1.OrderModel.countDocuments({ createdAt: { $gte: currentRangeStart } }),
        order_model_1.OrderModel.countDocuments({ createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: currentRangeStart } }),
        order_model_1.OrderModel.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
        order_model_1.OrderModel.countDocuments({ fulfillmentStatus: 'delivered', createdAt: { $gte: currentRangeStart } }),
        order_model_1.OrderModel.countDocuments({ fulfillmentStatus: 'delivered', createdAt: { $gte: previousRangeStart, $lt: currentRangeStart } }),
        order_model_1.OrderModel.aggregate(buildRevenuePipeline(currentRangeStart)),
        order_model_1.OrderModel.aggregate(buildRevenuePipeline(previousRangeStart, currentRangeStart))
    ]);
    const totalRevenue = extractTotal(totalRevenueResult);
    const currentRevenue = extractTotal(currentRevenueResult);
    const previousRevenue = extractTotal(previousRevenueResult);
    const totalSpend = sumCampaignSpend(campaigns);
    const computeRatio = (numerator, denominator) => (denominator > 0 ? (numerator / denominator) * 100 : 0);
    const computeDelta = (current, previous) => {
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
exports.buildMarketingMetrics = buildMarketingMetrics;
//# sourceMappingURL=marketing.service.js.map