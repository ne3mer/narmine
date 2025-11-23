import { Router } from 'express';
import { getGames, postGame, getGame, patchGame, removeGame, seedGames } from '../controllers/game.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { createGameSchema, deleteGameSchema, getGameSchema, listGamesSchema, updateGameSchema } from '../schemas/game.schema';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', validateResource(listGamesSchema), asyncHandler(getGames));
router.post('/', adminAuth, validateResource(createGameSchema), asyncHandler(postGame));
router.post('/seed', adminAuth, asyncHandler(seedGames));
router.get('/:id', validateResource(getGameSchema), asyncHandler(getGame));
router.patch('/:id', adminAuth, validateResource(updateGameSchema), asyncHandler(patchGame));
router.delete('/:id', adminAuth, validateResource(deleteGameSchema), asyncHandler(removeGame));

export default router;
