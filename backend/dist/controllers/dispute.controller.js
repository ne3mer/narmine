"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisputes = exports.resolveDispute = exports.reportDispute = void 0;
const match_model_1 = __importDefault(require("../models/match.model"));
const tournament_participant_model_1 = __importDefault(require("../models/tournament-participant.model"));
// Report a dispute
const reportDispute = async (req, res) => {
    try {
        const { id: matchId } = req.params;
        const { reason, evidence, description } = req.body;
        const userId = req.user.id;
        const match = await match_model_1.default.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'مسابقه یافت نشد' });
        }
        // Verify user is participant
        let isParticipant = false;
        if (match.player1?.toString() === userId || match.player2?.toString() === userId) {
            isParticipant = true;
        }
        else {
            // Check if participant ID matches (if using participant IDs in match)
            // Or check TournamentParticipant
            const participant = await tournament_participant_model_1.default.findOne({
                tournamentId: match.tournamentId,
                userId: userId
            });
            if (participant) {
                if (match.player1?.toString() === participant._id.toString() ||
                    match.player2?.toString() === participant._id.toString()) {
                    isParticipant = true;
                }
            }
        }
        if (!isParticipant) {
            return res.status(403).json({ message: 'شما در این مسابقه شرکت ندارید' });
        }
        // Update match with dispute
        match.status = 'disputed';
        match.dispute = {
            reportedBy: userId,
            reason,
            evidence: evidence || [],
            status: 'open',
            // description field is not in schema, adding it to reason or adminNotes?
            // Schema has: reason: string. Let's append description to reason or update schema.
            // Let's just use reason for now.
        };
        await match.save();
        res.json({
            message: 'اعتراض با موفقیت ثبت شد. ادمین بررسی خواهد کرد.',
            match
        });
    }
    catch (error) {
        console.error('Error reporting dispute:', error);
        res.status(500).json({ message: 'خطا در ثبت اعتراض', error: error.message });
    }
};
exports.reportDispute = reportDispute;
// Resolve dispute (Admin)
const resolveDispute = async (req, res) => {
    try {
        const { id: matchId } = req.params;
        const { resolution, winnerId } = req.body;
        const match = await match_model_1.default.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'مسابقه یافت نشد' });
        }
        if (match.status !== 'disputed') {
            return res.status(400).json({ message: 'این مسابقه در وضعیت اعتراض نیست' });
        }
        if (!match.dispute) {
            return res.status(400).json({ message: 'اطلاعات اعتراض یافت نشد' });
        }
        // Update dispute status
        match.dispute.status = 'resolved';
        match.dispute.resolution = resolution;
        match.dispute.resolvedBy = req.user.id;
        match.dispute.resolvedAt = new Date();
        // Set winner and complete match
        if (winnerId) {
            match.winner = winnerId;
            match.status = 'completed';
        }
        else {
            // If no winner specified, maybe cancelled?
            match.status = 'cancelled';
        }
        await match.save();
        res.json({
            message: 'اعتراض با موفقیت حل شد',
            match
        });
    }
    catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ message: 'خطا در حل اعتراض', error: error.message });
    }
};
exports.resolveDispute = resolveDispute;
// Get all disputes (Admin)
const getDisputes = async (req, res) => {
    try {
        const { tournamentId, status } = req.query;
        const query = { status: 'disputed' }; // Only matches with disputed status
        if (status) {
            // If filtering by dispute status (open/resolved)
            query['dispute.status'] = status;
        }
        if (tournamentId) {
            query.tournamentId = tournamentId;
        }
        const matches = await match_model_1.default.find(query)
            .populate('player1', 'name gameTag')
            .populate('player2', 'name gameTag')
            .populate('tournamentId', 'title')
            .populate('dispute.reportedBy', 'name gameTag')
            .populate('dispute.resolvedBy', 'name')
            .sort('-dispute.createdAt');
        res.json({ disputes: matches });
    }
    catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ message: 'خطا در دریافت اعتراضات', error: error.message });
    }
};
exports.getDisputes = getDisputes;
//# sourceMappingURL=dispute.controller.js.map