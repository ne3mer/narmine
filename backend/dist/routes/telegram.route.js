"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_controller_1 = require("../controllers/telegram.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const router = (0, express_1.Router)();
router.get('/link', authenticateUser_1.authenticateUser, telegram_controller_1.getTelegramLink);
router.post('/unlink', authenticateUser_1.authenticateUser, telegram_controller_1.unlinkTelegram);
exports.default = router;
//# sourceMappingURL=telegram.route.js.map