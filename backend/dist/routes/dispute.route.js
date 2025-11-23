"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dispute_controller_1 = require("../controllers/dispute.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Report dispute (User)
router.post('/:id/report', authenticateUser_1.authenticateUser, dispute_controller_1.reportDispute);
// Resolve dispute (Admin)
router.post('/:id/resolve', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, dispute_controller_1.resolveDispute);
// Get disputes (Admin)
router.get('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, dispute_controller_1.getDisputes);
exports.default = router;
//# sourceMappingURL=dispute.route.js.map