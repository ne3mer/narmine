"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerModel = void 0;
const mongoose_1 = require("mongoose");
const bannerElementSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['text', 'image', 'icon', 'button', 'badge', 'stats', 'video'], required: true },
    content: { type: String, default: '' },
    style: {
        fontSize: String,
        fontWeight: String,
        color: String,
        backgroundColor: String,
        padding: String,
        margin: String,
        borderRadius: String,
        width: String,
        height: String,
        position: String,
        top: String,
        left: String,
        right: String,
        bottom: String,
        zIndex: Number,
        opacity: Number,
        transform: String,
        animation: String,
        animationDuration: String,
        animationDelay: String
    },
    imageUrl: String,
    iconName: String,
    href: String,
    target: String,
    order: { type: Number, default: 0 }
}, { _id: false });
const bannerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom'],
        required: true
    },
    layout: {
        type: String,
        enum: ['centered', 'split', 'overlay', 'card', 'full-width', 'floating'],
        required: true
    },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    displayOn: { type: [String], default: ['home'] },
    background: {
        type: {
            type: String,
            enum: ['gradient', 'solid', 'image', 'video'],
            required: true
        },
        color: String,
        gradientColors: [String],
        gradientDirection: String,
        imageUrl: String,
        videoUrl: String,
        overlay: Boolean,
        overlayColor: String,
        overlayOpacity: Number
    },
    elements: [bannerElementSchema],
    containerStyle: {
        padding: String,
        margin: String,
        borderRadius: String,
        maxWidth: String,
        minHeight: String,
        boxShadow: String
    },
    entranceAnimation: String,
    exitAnimation: String,
    hoverEffects: {
        scale: Number,
        rotate: Number,
        glow: Boolean,
        shadow: Boolean
    },
    mobileSettings: {
        hideOnMobile: Boolean,
        mobileLayout: String,
        mobileElements: [bannerElementSchema]
    },
    displayRules: {
        startDate: Date,
        endDate: Date,
        showToUsers: [String],
        showToRoles: [String],
        maxViews: Number,
        maxClicks: Number
    },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
}, { timestamps: true });
bannerSchema.index({ active: 1, priority: -1 });
bannerSchema.index({ displayOn: 1 });
bannerSchema.index({ 'displayRules.startDate': 1, 'displayRules.endDate': 1 });
exports.BannerModel = (0, mongoose_1.model)('Banner', bannerSchema);
//# sourceMappingURL=banner.model.js.map