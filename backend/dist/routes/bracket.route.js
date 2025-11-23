"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bracket_controller_1 = require("../controllers/bracket.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Generate bracket (Admin only)
router.post('/:id/generate', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, bracket_controller_1.generateBracket);
// Get bracket (Public)
router.get('/:id', bracket_controller_1.getBracket);
exports.default = router;
//# sourceMappingURL=bracket.route.js.map