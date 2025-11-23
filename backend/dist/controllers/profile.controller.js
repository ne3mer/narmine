"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArenaSettings = exports.getProfile = exports.updateProfile = void 0;
const user_service_1 = require("../services/user.service");
const errorHandler_1 = require("../middleware/errorHandler");
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
            });
        }
        const { name, phone, telegram } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (phone !== undefined)
            updates.phone = phone;
        if (telegram !== undefined)
            updates.telegram = telegram;
        const user = await (0, user_service_1.updateUser)(userId, updates);
        res.json({
            success: true,
            message: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
            data: user
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی اطلاعات'
        });
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
            });
        }
        const { getUserById } = await Promise.resolve().then(() => __importStar(require('../services/user.service')));
        const user = await getUserById(userId);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در دریافت اطلاعات'
        });
    }
};
exports.getProfile = getProfile;
const updateArenaSettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
            });
        }
        const { gameTag, bankInfo } = req.body;
        const updates = {};
        if (gameTag)
            updates.gameTag = gameTag;
        if (bankInfo)
            updates.bankInfo = bankInfo;
        const user = await (0, user_service_1.updateUser)(userId, updates);
        res.json({
            success: true,
            message: 'تنظیمات آرنا با موفقیت به‌روزرسانی شد',
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'خطا در به‌روزرسانی تنظیمات'
        });
    }
};
exports.updateArenaSettings = updateArenaSettings;
//# sourceMappingURL=profile.controller.js.map