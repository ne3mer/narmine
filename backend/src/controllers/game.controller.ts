import type { Request, Response } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { createGame, deleteGame, getGameById, listGames, seedSampleGames, updateGame } from '../services/game.service';

type GameQuery = {
  genre?: string;
  region?: string;

  search?: string;
  sort?: string;
  limit?: string;
  onSale?: boolean;
};

export const getGames = async (req: Request<unknown, unknown, unknown, GameQuery>, res: Response) => {
  try {
    const { genre, region, search, sort, limit, onSale } = req.query;
    const games = await listGames({
      genre: genre || undefined,
      region: region || undefined,

      search: search || undefined,
      sort: sort || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      onSale
    });

    res.json({ data: games });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ 
      message: 'Error fetching games',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const postGame = async (req: Request, res: Response) => {

  const game = await createGame(req.body);

  res.status(201).json({ data: game });

};

export const getGame = async (req: Request, res: Response) => {
  const game = await getGameById(req.params.id);

  if (!game) {
    throw new ApiError(404, 'Game not found');
  }

  res.json({ data: game });
};

export const patchGame = async (req: Request, res: Response) => {
  const updated = await updateGame(req.params.id, req.body);

  if (!updated) {
    throw new ApiError(404, 'Game not found');
  }

  res.json({ data: updated });
};

export const removeGame = async (req: Request, res: Response) => {
  const deleted = await deleteGame(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Game not found');
  }

  res.status(204).send();
};

export const seedGames = async (_req: Request, res: Response) => {
  const result = await seedSampleGames();
  res.json({ data: result });
};
