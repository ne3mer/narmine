import { Request, Response } from 'express';
import Match from '../models/match.model';
import TournamentParticipant from '../models/tournament-participant.model';

// Report a dispute
export const reportDispute = async (req: Request, res: Response) => {
  try {
    const { id: matchId } = req.params;
    const { reason, evidence, description } = req.body;
    const userId = req.user!.id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'مسابقه یافت نشد' });
    }

    // Verify user is participant
    let isParticipant = false;
    if (match.player1?.toString() === userId || match.player2?.toString() === userId) {
      isParticipant = true;
    } else {
      // Check if participant ID matches (if using participant IDs in match)
      // Or check TournamentParticipant
      const participant = await TournamentParticipant.findOne({
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
      reportedBy: userId as any,
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
  } catch (error: any) {
    console.error('Error reporting dispute:', error);
    res.status(500).json({ message: 'خطا در ثبت اعتراض', error: error.message });
  }
};

// Resolve dispute (Admin)
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id: matchId } = req.params;
    const { resolution, winnerId } = req.body;
    
    const match = await Match.findById(matchId);
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
    match.dispute.resolvedBy = req.user!.id as any;
    match.dispute.resolvedAt = new Date();

    // Set winner and complete match
    if (winnerId) {
      match.winner = winnerId;
      match.status = 'completed';
    } else {
      // If no winner specified, maybe cancelled?
      match.status = 'cancelled';
    }

    await match.save();

    res.json({
      message: 'اعتراض با موفقیت حل شد',
      match
    });
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ message: 'خطا در حل اعتراض', error: error.message });
  }
};

// Get all disputes (Admin)
export const getDisputes = async (req: Request, res: Response) => {
  try {
    const { tournamentId, status } = req.query;
    const query: any = { status: 'disputed' }; // Only matches with disputed status

    if (status) {
      // If filtering by dispute status (open/resolved)
      query['dispute.status'] = status;
    }

    if (tournamentId) {
      query.tournamentId = tournamentId;
    }

    const matches = await Match.find(query)
      .populate('player1', 'name gameTag')
      .populate('player2', 'name gameTag')
      .populate('tournamentId', 'title')
      .populate('dispute.reportedBy', 'name gameTag')
      .populate('dispute.resolvedBy', 'name')
      .sort('-dispute.createdAt');

    res.json({ disputes: matches });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ message: 'خطا در دریافت اعتراضات', error: error.message });
  }
};
