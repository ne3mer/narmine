"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceAlertModel = void 0;
const mongoose_1 = require("mongoose");
const priceAlertSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    gameId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Game', required: true },
    targetPrice: { type: Number, required: true },
    channel: { type: String, enum: ['email', 'telegram'], required: true },
    destination: { type: String, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: { createdAt: true, updatedAt: false } });
priceAlertSchema.index({ gameId: 1, targetPrice: 1, active: 1 });
exports.PriceAlertModel = (0, mongoose_1.model)('PriceAlert', priceAlertSchema);
//# sourceMappingURL=priceAlert.model.js.map