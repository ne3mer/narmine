"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHomeContent = exports.getOrCreateHomeContent = void 0;
const homeDefaults_1 = require("../data/homeDefaults");
const homeContent_model_1 = require("../models/homeContent.model");
const getOrCreateHomeContent = async () => {
    let content = await homeContent_model_1.HomeContentModel.findOne();
    if (!content) {
        content = await homeContent_model_1.HomeContentModel.create(homeDefaults_1.defaultHomeContent);
    }
    return content;
};
exports.getOrCreateHomeContent = getOrCreateHomeContent;
const updateHomeContent = async (payload) => {
    let content = await homeContent_model_1.HomeContentModel.findOne();
    if (!content) {
        content = new homeContent_model_1.HomeContentModel(homeDefaults_1.defaultHomeContent);
    }
    if (payload.hero !== undefined) {
        content.hero = payload.hero;
    }
    if (payload.heroSlides !== undefined) {
        content.heroSlides = payload.heroSlides;
    }
    if (payload.spotlights !== undefined) {
        content.spotlights = payload.spotlights;
    }
    if (payload.trustSignals !== undefined) {
        content.trustSignals = payload.trustSignals;
    }
    if (payload.testimonials !== undefined) {
        content.testimonials = payload.testimonials;
    }
    await content.save();
    return content;
};
exports.updateHomeContent = updateHomeContent;
//# sourceMappingURL=homeContent.service.js.map