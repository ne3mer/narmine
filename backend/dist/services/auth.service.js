"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = exports.authenticateUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
const sanitizeEmail = (email) => email.trim().toLowerCase();
const registerUser = async (input) => {
    const email = sanitizeEmail(input.email);
    const existing = await user_model_1.UserModel.findOne({ email });
    if (existing) {
        throw new errorHandler_1.ApiError(409, 'کاربری با این ایمیل وجود دارد.');
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
    const user = await user_model_1.UserModel.create({
        name: input.name,
        email,
        password: hashedPassword,
        phone: input.phone,
        telegram: input.telegram
    });
    return user;
};
exports.registerUser = registerUser;
const authenticateUser = async (input) => {
    const email = sanitizeEmail(input.email);
    const user = await user_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new errorHandler_1.ApiError(401, 'ایمیل یا رمز عبور نامعتبر است.');
    }
    const isValid = await bcryptjs_1.default.compare(input.password, user.password);
    if (!isValid) {
        throw new errorHandler_1.ApiError(401, 'ایمیل یا رمز عبور نامعتبر است.');
    }
    return user;
};
exports.authenticateUser = authenticateUser;
const signAccessToken = (user) => {
    const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };
    const secret = env_1.env.JWT_SECRET;
    const expiresIn = env_1.env.JWT_EXPIRES_IN;
    const options = {
        expiresIn
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.signAccessToken = signAccessToken;
//# sourceMappingURL=auth.service.js.map