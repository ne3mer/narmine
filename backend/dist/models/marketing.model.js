"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingModel = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    badge: { type: String, required: true },
    description: { type: String, required: true },
    perks: [{ type: String, required: true }],
    priceLabel: { type: String, required: true },
    priceValue: { type: String, required: true },
    ctaLabel: { type: String, required: true },
    ctaHref: { type: String, required: true }
}, { _id: false });
const campaignSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    channel: { type: String, required: true },
    status: { type: String, enum: ['active', 'paused', 'draft'], default: 'draft' },
    budget: { type: Number, required: true },
    ctr: { type: Number, required: true, default: 0 },
    cvr: { type: Number, required: true, default: 0 },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true }
}, { _id: false });
const utmSchema = new mongoose_1.Schema({
    baseUrl: { type: String, required: true },
    source: { type: String, required: true },
    medium: { type: String, required: true },
    campaign: { type: String, required: true },
    term: { type: String },
    content: { type: String }
}, { _id: false });
const marketingSchema = new mongoose_1.Schema({
    bannerContent: { type: bannerSchema, required: true },
    campaigns: { type: [campaignSchema], default: [] },
    utmBuilder: { type: utmSchema, required: true },
    experimentSplit: { type: Number, default: 50 }
}, { timestamps: true });
marketingSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { id: _id, ...rest };
    }
});
exports.MarketingModel = (0, mongoose_1.model)('MarketingSetting', marketingSchema);
//# sourceMappingURL=marketing.model.js.map