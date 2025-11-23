"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeContentModel = void 0;
const mongoose_1 = require("mongoose");
const ctaSchema = new mongoose_1.Schema({
    label: { type: String, required: true },
    href: { type: String, required: true }
}, { _id: false });
const heroStatSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const heroSchema = new mongoose_1.Schema({
    badge: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    primaryCta: { type: ctaSchema, required: true },
    secondaryCta: { type: ctaSchema, required: true },
    stats: { type: [heroStatSchema], default: [] },
    image: { type: String }
}, { _id: false });
const spotlightSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    href: { type: String, required: true },
    accent: { type: String, required: true }
}, { _id: false });
const trustSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
}, { _id: false });
const testimonialSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    handle: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String, required: true },
    highlight: { type: Boolean, default: false }
}, { _id: false });
const homeContentSchema = new mongoose_1.Schema({
    hero: { type: heroSchema, required: true },
    heroSlides: { type: [heroSchema], default: [] },
    spotlights: { type: [spotlightSchema], default: [] },
    trustSignals: { type: [trustSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] }
}, { timestamps: true });
homeContentSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { id: _id, ...rest };
    }
});
exports.HomeContentModel = (0, mongoose_1.model)('HomeContent', homeContentSchema);
//# sourceMappingURL=homeContent.model.js.map