"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const healthCheck = (_req, res) => {
    res.json({ status: 'ok', service: 'gameclub-backend', timestamp: new Date().toISOString() });
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.controller.js.map