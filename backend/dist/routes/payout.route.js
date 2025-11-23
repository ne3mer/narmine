"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payout_controller_1 = require("../controllers/payout.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Admin routes
router.get('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, payout_controller_1.getPayouts);
router.patch('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, payout_controller_1.processPayout);
exports.default = router;
//# sourceMappingURL=payout.route.js.map