import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateUser } from '../middleware/authenticateUser';
import {
  getAllCategories,
  getCategoryBySlug,
  getCategoryGames,
  createCategory,
  updateCategory,
  deleteCategory,
  addGameToCategory,
  removeGameFromCategory,
  reorderCategories
} from '../controllers/category.controller';

const router = Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/games', getCategoryGames);

// Admin routes
router.post('/', authenticateUser, adminAuth, createCategory);
router.put('/reorder', authenticateUser, adminAuth, reorderCategories); // Must be before :id
router.put('/:id', authenticateUser, adminAuth, updateCategory);
router.delete('/:id', authenticateUser, adminAuth, deleteCategory);
router.post('/:id/add-game', authenticateUser, adminAuth, addGameToCategory);
router.delete('/:id/remove-game/:gameId', authenticateUser, adminAuth, removeGameFromCategory);

export default router;
