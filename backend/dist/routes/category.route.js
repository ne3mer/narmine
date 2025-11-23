"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const authenticateUser_1 = require("../middleware/authenticateUser");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/', category_controller_1.getAllCategories);
router.get('/:slug', category_controller_1.getCategoryBySlug);
router.get('/:slug/games', category_controller_1.getCategoryGames);
// Admin routes
router.post('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.createCategory);
router.put('/reorder', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.reorderCategories); // Must be before :id
router.put('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.updateCategory);
router.delete('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.deleteCategory);
router.post('/:id/add-game', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.addGameToCategory);
router.delete('/:id/remove-game/:gameId', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, category_controller_1.removeGameFromCategory);
exports.default = router;
//# sourceMappingURL=category.route.js.map