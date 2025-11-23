"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const game_request_controller_1 = require("../controllers/game-request.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
// User routes
router.post('/', authenticateUser_1.authenticateUser, game_request_controller_1.createGameRequest);
router.get('/', authenticateUser_1.authenticateUser, game_request_controller_1.getUserGameRequests);
router.delete('/:id', authenticateUser_1.authenticateUser, game_request_controller_1.deleteGameRequest);
// Admin routes
router.get('/all', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, game_request_controller_1.getAllGameRequests);
router.patch('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, game_request_controller_1.updateGameRequestStatus);
exports.default = router;
//# sourceMappingURL=game-request.route.js.map