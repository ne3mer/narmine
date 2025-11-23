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
exports.getUserStats = exports.getUserInsights = exports.sendUserMessage = exports.deleteUser = exports.updateUser = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const userService = __importStar(require("../services/user.service"));
const getAllUsers = async (_req, res) => {
    const users = await userService.getAllUsers();
    res.json({ data: users });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json({ data: user });
};
exports.getUserById = getUserById;
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'نقش معتبر نیست. باید user یا admin باشد' });
    }
    const user = await userService.updateUserRole(id, role);
    res.json({
        message: `نقش کاربر به ${role === 'admin' ? 'مدیر' : 'کاربر عادی'} تغییر یافت`,
        data: user
    });
};
exports.updateUserRole = updateUserRole;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, phone, telegram } = req.body;
    const updates = {};
    if (name !== undefined)
        updates.name = name;
    if (phone !== undefined)
        updates.phone = phone;
    if (telegram !== undefined)
        updates.telegram = telegram;
    const user = await userService.updateUser(id, updates);
    res.json({
        message: 'اطلاعات کاربر به‌روزرسانی شد',
        data: user
    });
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
};
exports.deleteUser = deleteUser;
const sendUserMessage = async (req, res) => {
    const { subject, message, userIds, role, sendToAll, channel } = req.body;
    const result = await userService.sendAdminMessage({
        subject,
        message,
        userIds,
        role,
        sendToAll,
        channel
    });
    res.json({
        message: `پیام برای ${result.sent} کاربر ارسال شد`,
        data: result
    });
};
exports.sendUserMessage = sendUserMessage;
const getUserInsights = async (req, res) => {
    const { id } = req.params;
    const data = await userService.getUserInsights(id);
    res.json({ data });
};
exports.getUserInsights = getUserInsights;
const getUserStats = async (_req, res) => {
    const stats = await userService.getUserStats();
    res.json({ data: stats });
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=user.controller.js.map