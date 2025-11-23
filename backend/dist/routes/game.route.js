"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const validateResource_1 = require("../middleware/validateResource");
const game_schema_1 = require("../schemas/game.schema");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.get('/', (0, validateResource_1.validateResource)(game_schema_1.listGamesSchema), (0, asyncHandler_1.asyncHandler)(game_controller_1.getGames));
router.post('/', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(game_schema_1.createGameSchema), (0, asyncHandler_1.asyncHandler)(game_controller_1.postGame));
router.post('/seed', adminAuth_1.adminAuth, (0, asyncHandler_1.asyncHandler)(game_controller_1.seedGames));
router.get('/:id', (0, validateResource_1.validateResource)(game_schema_1.getGameSchema), (0, asyncHandler_1.asyncHandler)(game_controller_1.getGame));
router.patch('/:id', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(game_schema_1.updateGameSchema), (0, asyncHandler_1.asyncHandler)(game_controller_1.patchGame));
router.delete('/:id', adminAuth_1.adminAuth, (0, validateResource_1.validateResource)(game_schema_1.deleteGameSchema), (0, asyncHandler_1.asyncHandler)(game_controller_1.removeGame));
exports.default = router;
//# sourceMappingURL=game.route.js.map