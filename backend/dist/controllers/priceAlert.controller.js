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
exports.deletePriceAlert = exports.updatePriceAlert = exports.getPriceAlertById = exports.getUserPriceAlerts = exports.createPriceAlert = void 0;
const priceAlertService = __importStar(require("../services/priceAlert.service"));
const createPriceAlert = async (req, res) => {
    const userId = req.user?.id;
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
exports.createPriceAlert = createPriceAlert;
const getUserPriceAlerts = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'لطفاً وارد شوید' });
    }
    const alerts = await priceAlertService.getUserPriceAlerts(userId);
    res.json({ data: alerts });
};
exports.getUserPriceAlerts = getUserPriceAlerts;
const getPriceAlertById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const alert = await priceAlertService.getPriceAlertById(id, userId);
    res.json({ data: alert });
};
exports.getPriceAlertById = getPriceAlertById;
const updatePriceAlert = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;
    const alert = await priceAlertService.updatePriceAlert(id, userId, updates);
    res.json({
        message: 'هشدار قیمت به‌روزرسانی شد',
        data: alert
    });
};
exports.updatePriceAlert = updatePriceAlert;
const deletePriceAlert = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    await priceAlertService.deletePriceAlert(id, userId);
    res.status(204).send();
};
exports.deletePriceAlert = deletePriceAlert;
//# sourceMappingURL=priceAlert.controller.js.map