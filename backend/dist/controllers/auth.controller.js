"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const respondWithAuthPayload = (res, user, status = 200) => {
    const token = (0, auth_service_1.signAccessToken)(user);
    res.status(status).json({
        data: {
            token,
            user: user.toJSON()
        }
    });
};
const register = async (req, res) => {
    const user = await (0, auth_service_1.registerUser)(req.body);
    respondWithAuthPayload(res, user, 201);
};
exports.register = register;
const login = async (req, res) => {
    const user = await (0, auth_service_1.authenticateUser)(req.body);
    respondWithAuthPayload(res, user);
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map