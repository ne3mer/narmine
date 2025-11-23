"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarketingSettingsHandler = exports.getMarketingSettingsHandler = void 0;
const marketing_service_1 = require("../services/marketing.service");
const getMarketingSettingsHandler = async (_req, res) => {
    const settings = await (0, marketing_service_1.getOrCreateMarketingSettings)();
    const metrics = await (0, marketing_service_1.buildMarketingMetrics)(settings.campaigns);
    res.json({
        data: {
            settings,
            metrics
        }
    });
};
exports.getMarketingSettingsHandler = getMarketingSettingsHandler;
const updateMarketingSettingsHandler = async (req, res) => {
    const updated = await (0, marketing_service_1.updateMarketingSettings)(req.body);
    const metrics = await (0, marketing_service_1.buildMarketingMetrics)(updated.campaigns);
    res.json({
        data: {
            settings: updated,
            metrics
        }
    });
};
exports.updateMarketingSettingsHandler = updateMarketingSettingsHandler;
//# sourceMappingURL=marketing.controller.js.map