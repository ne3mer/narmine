"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("../controllers/match.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const router = (0, express_1.Router)();
router.get('/:id', authenticateUser_1.authenticateUser, match_controller_1.getMatchDetails);
router.post('/:id/submit', authenticateUser_1.authenticateUser, match_controller_1.submitMatchResult);
exports.default = router;
//# sourceMappingURL=match.route.js.map