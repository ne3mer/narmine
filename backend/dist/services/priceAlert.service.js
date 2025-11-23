"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndTriggerPriceAlerts = exports.getActiveAlertsForGame = exports.deletePriceAlert = exports.updatePriceAlert = exports.getPriceAlertById = exports.getUserPriceAlerts = exports.createPriceAlert = void 0;
const priceAlert_model_1 = require("../models/priceAlert.model");
const errorHandler_1 = require("../middleware/errorHandler");
const createPriceAlert = async (input) => {
    // Check if user already has an active alert for this game with same or lower target price
    if (input.userId) {
        const existing = await priceAlert_model_1.PriceAlertModel.findOne({
            userId: input.userId,
            gameId: input.gameId,
            active: true,
            targetPrice: { $lte: input.targetPrice }
        });
        if (existing) {
            throw new errorHandler_1.ApiError(400, 'شما قبلاً یک هشدار فعال برای این بازی با قیمت پایین‌تر یا مساوی دارید');
        }
    }
    const alert = await priceAlert_model_1.PriceAlertModel.create({
        userId: input.userId,
        gameId: input.gameId,
        targetPrice: input.targetPrice,
        channel: input.channel,
        destination: input.destination,
        active: true
    });
    return alert.populate('gameId', 'title slug basePrice coverUrl');
};
exports.createPriceAlert = createPriceAlert;
const getUserPriceAlerts = async (userId) => {
    return priceAlert_model_1.PriceAlertModel.find({ userId, active: true })
        .populate('gameId', 'title slug basePrice coverUrl')
        .sort({ createdAt: -1 });
};
exports.getUserPriceAlerts = getUserPriceAlerts;
const getPriceAlertById = async (alertId, userId) => {
    const query = { _id: alertId };
    if (userId) {
        query.userId = userId;
    }
    const alert = await priceAlert_model_1.PriceAlertModel.findOne(query).populate('gameId', 'title slug basePrice coverUrl');
    if (!alert) {
        throw new errorHandler_1.ApiError(404, 'هشدار قیمت یافت نشد');
    }
    return alert;
};
exports.getPriceAlertById = getPriceAlertById;
const updatePriceAlert = async (alertId, userId, updates) => {
    const alert = await priceAlert_model_1.PriceAlertModel.findOneAndUpdate({ _id: alertId, userId }, updates, { new: true, runValidators: true }).populate('gameId', 'title slug basePrice coverUrl');
    if (!alert) {
        throw new errorHandler_1.ApiError(404, 'هشدار قیمت یافت نشد یا متعلق به شما نیست');
    }
    return alert;
};
exports.updatePriceAlert = updatePriceAlert;
const deletePriceAlert = async (alertId, userId) => {
    const alert = await priceAlert_model_1.PriceAlertModel.findOneAndDelete({ _id: alertId, userId });
    if (!alert) {
        throw new errorHandler_1.ApiError(404, 'هشدار قیمت یافت نشد یا متعلق به شما نیست');
    }
    return { message: 'هشدار قیمت حذف شد' };
};
exports.deletePriceAlert = deletePriceAlert;
const getActiveAlertsForGame = async (gameId) => {
    return priceAlert_model_1.PriceAlertModel.find({
        gameId,
        active: true
    }).populate('userId', 'email name telegram');
};
exports.getActiveAlertsForGame = getActiveAlertsForGame;
// Check and trigger price alerts for a game
const checkAndTriggerPriceAlerts = async (gameId, currentPrice) => {
    const alerts = await (0, exports.getActiveAlertsForGame)(gameId);
    const triggeredAlerts = [];
    for (const alert of alerts) {
        // Check if current price is less than or equal to target price
        if (currentPrice <= alert.targetPrice) {
            try {
                const game = alert.gameId;
                if (!game)
                    continue;
                const gameTitle = game.title || 'بازی';
                const { env } = await Promise.resolve().then(() => __importStar(require('../config/env')));
                const gameUrl = `${env.CLIENT_URL}/games/${game.slug || gameId}`;
                const userId = alert.userId ? alert.userId._id?.toString() : undefined;
                // Send notification
                const { sendPriceAlert } = await Promise.resolve().then(() => __importStar(require('./notificationSender.service')));
                await sendPriceAlert(userId, gameTitle, currentPrice, alert.targetPrice, gameUrl, alert.channel, alert.destination);
                // Deactivate alert after sending
                await priceAlert_model_1.PriceAlertModel.findByIdAndUpdate(alert._id, { active: false });
                triggeredAlerts.push(alert._id.toString());
                console.log(`✅ Price alert triggered for ${gameTitle} - ${alert.channel}:${alert.destination}`);
            }
            catch (error) {
                console.error(`Failed to trigger price alert ${alert._id}:`, error);
            }
        }
    }
    return triggeredAlerts;
};
exports.checkAndTriggerPriceAlerts = checkAndTriggerPriceAlerts;
//# sourceMappingURL=priceAlert.service.js.map