"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedGames = exports.removeGame = exports.patchGame = exports.getGame = exports.postGame = exports.getGames = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const game_service_1 = require("../services/game.service");
const getGames = async (req, res) => {
    try {
        const { genre, region, search, sort, limit } = req.query;
        const games = await (0, game_service_1.listGames)({
            genre: genre || undefined,
            region: region || undefined,
            search: search || undefined,
            sort: sort || undefined,
            limit: limit ? parseInt(limit, 10) : undefined
        });
        res.json({ data: games });
    }
    catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({
            message: 'Error fetching games',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getGames = getGames;
const postGame = async (req, res) => {
    const game = await (0, game_service_1.createGame)(req.body);
    res.status(201).json({ data: game });
};
exports.postGame = postGame;
const getGame = async (req, res) => {
    const game = await (0, game_service_1.getGameById)(req.params.id);
    if (!game) {
        throw new errorHandler_1.ApiError(404, 'Game not found');
    }
    res.json({ data: game });
};
exports.getGame = getGame;
const patchGame = async (req, res) => {
    const updated = await (0, game_service_1.updateGame)(req.params.id, req.body);
    if (!updated) {
        throw new errorHandler_1.ApiError(404, 'Game not found');
    }
    res.json({ data: updated });
};
exports.patchGame = patchGame;
const removeGame = async (req, res) => {
    const deleted = await (0, game_service_1.deleteGame)(req.params.id);
    if (!deleted) {
        throw new errorHandler_1.ApiError(404, 'Game not found');
    }
    res.status(204).send();
};
exports.removeGame = removeGame;
const seedGames = async (_req, res) => {
    const result = await (0, game_service_1.seedSampleGames)();
    res.json({ data: result });
};
exports.seedGames = seedGames;
//# sourceMappingURL=game.controller.js.map