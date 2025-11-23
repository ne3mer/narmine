"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHomeContentHandler = exports.getHomeContentHandler = void 0;
const homeContent_service_1 = require("../services/homeContent.service");
const getHomeContentHandler = async (_req, res) => {
    const settings = await (0, homeContent_service_1.getOrCreateHomeContent)();
    res.json({ data: { settings } });
};
exports.getHomeContentHandler = getHomeContentHandler;
const updateHomeContentHandler = async (req, res) => {
    const updated = await (0, homeContent_service_1.updateHomeContent)(req.body);
    res.json({ data: { settings: updated } });
};
exports.updateHomeContentHandler = updateHomeContentHandler;
//# sourceMappingURL=homeContent.controller.js.map