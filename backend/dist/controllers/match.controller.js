"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchDetails = exports.submitMatchResult = void 0;
const match_model_1 = __importDefault(require("../models/match.model"));
const tournament_participant_model_1 = __importDefault(require("../models/tournament-participant.model"));
// Submit match result
const submitMatchResult = async (req, res) => {
    try {
        const { id: matchId } = req.params;
        const { score, screenshot, comments } = req.body;
        const userId = req.user.id;
        const match = await match_model_1.default.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'مسابقه یافت نشد' });
        }
        if (match.status !== 'scheduled' && match.status !== 'in-progress') {
            return res.status(400).json({ message: 'این مسابقه فعال نیست' });
        }
        // Determine which player is submitting
        let playerIndex = -1;
        if (match.player1?.toString() === userId)
            playerIndex = 1;
        else if (match.player2?.toString() === userId)
            playerIndex = 2;
        if (playerIndex === -1) {
            // Check if user is part of a team in the match (if team based)
            // For now assuming 1v1 and user ID matches player ID
            // If players are Participant IDs, we need to look up Participant
            const participant = await tournament_participant_model_1.default.findOne({
                tournamentId: match.tournamentId,
                userId: userId
            });
            if (participant) {
                if (match.player1?.toString() === participant._id.toString())
                    playerIndex = 1;
                else if (match.player2?.toString() === participant._id.toString())
                    playerIndex = 2;
            }
        }
        if (playerIndex === -1) {
            return res.status(403).json({ message: 'شما در این مسابقه شرکت ندارید' });
        }
        // Update match result in results array
        const existingResultIndex = match.results.findIndex(r => r.playerId.toString() === userId);
        const resultData = {
            playerId: userId,
            score,
            screenshot,
            submittedAt: new Date(),
            verified: false
        };
        if (existingResultIndex > -1) {
            match.results[existingResultIndex] = { ...match.results[existingResultIndex], ...resultData };
        }
        else {
            match.results.push(resultData);
        }
        // Check if both players submitted
        // We need to count unique submitters
        const uniqueSubmitters = new Set(match.results.map(r => r.playerId.toString()));
        // If it's a 1v1 match and we have 2 results
        if (match.player2 && uniqueSubmitters.size >= 2) {
            match.status = 'pending_verification';
        }
        await match.save();
        res.json({
            message: 'نتیجه با موفقیت ثبت شد',
            match
        });
    }
    catch (error) {
        console.error('Error submitting match result', error);
        res.status(500).json({ message: 'خطا در ثبت نتیجه', error: error.message });
    }
};
exports.submitMatchResult = submitMatchResult;
// Get match details
const getMatchDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await match_model_1.default.findById(id)
            .populate('player1', 'name email gameTag')
            .populate('player2', 'name email gameTag')
            .populate('tournamentId');
        if (!match) {
            return res.status(404).json({ message: 'مسابقه یافت نشد' });
        }
        res.json({ match });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت جزئیات مسابقه', error: error.message });
    }
};
exports.getMatchDetails = getMatchDetails;
//# sourceMappingURL=match.controller.js.map