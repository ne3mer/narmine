"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const adminAuth = (req, _res, next) => {
    // Check for Admin Role from JWT (if authenticated via authenticateUser)
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    // Check for API key (server-to-server or special access)
    if (env_1.env.ADMIN_API_KEY) {
        const adminKey = req.header('x-admin-key');
        if (adminKey === env_1.env.ADMIN_API_KEY) {
            return next();
        }
    }
    return next(new errorHandler_1.ApiError(403, 'Unauthorized admin access'));
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=adminAuth.js.map