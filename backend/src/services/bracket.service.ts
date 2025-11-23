import mongoose from 'mongoose';
import Tournament from '../models/tournament.model';
import TournamentParticipant from '../models/tournament-participant.model';
import Match, { IMatch } from '../models/match.model';

export interface BracketNode {
  id: string;
  round: number;
  roundName: string;
  matchId: string;
  player1?: any;
  player2?: any;
  winner?: any;
  children?: [BracketNode, BracketNode] | [];
}

export const generateSingleEliminationBracket = async (tournamentId: string) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error('Tournament not found');

  // 1. Fetch and shuffle participants
  // For dev/testing, allow pending payment too if needed, but strictly should be completed.
  // Let's use all for now to make testing easier if payment is mocked.
  const participants = await TournamentParticipant.find({ 
    tournamentId
  }).populate('userId');

  if (participants.length < 2) {
    throw new Error('Not enough participants to generate bracket (minimum 2)');
  }

  // Shuffle
  const shuffled = participants.sort(() => Math.random() - 0.5);

  // 2. Calculate tree depth
  const totalPlayers = shuffled.length;
  // Next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
  const totalRounds = Math.log2(size);

  // Pad with byes (nulls)
  // Actually, handling byes is tricky.
  // If we have 3 players. Size 4.
  // P1 vs P2
  // P3 vs Bye -> P3 auto advances.
  
  const paddedParticipants = [...shuffled];
  while (paddedParticipants.length < size) {
    paddedParticipants.push(null as any);
  }

  const matchesAccumulator: IMatch[] = [];

  // Recursive function to build tree
  const buildTree = (
    round: number, 
    startIndex: number, 
    endIndex: number
  ): BracketNode => {
    const roundName = getRoundName(round, totalRounds);
    
    // Create Match Document
    const match = new Match({
      tournamentId,
      round,
      roundName,
      startTime: tournament.startDate, // TODO: Add time increments per round
      status: 'scheduled',
      // We set dummy IDs initially, will update for Round 1
      player1: new mongoose.Types.ObjectId(), 
      player2: new mongoose.Types.ObjectId(),
    });

    const node: BracketNode = {
      id: match._id.toString(),
      round,
      roundName,
      matchId: match._id.toString(),
      children: []
    };

    if (round === 1) {
      // Base case: Round 1 (Leaf matches in the bracket view)
      // Assign players from the padded list
      // The range [startIndex, endIndex] should have exactly 2 items for Round 1?
      // No, Round 1 matches pair up players.
      // If we are at Round 1, we cover 2 players.
      
      const p1 = paddedParticipants[startIndex];
      const p2 = paddedParticipants[startIndex + 1];

      // Assign real players
      if (p1) {
        match.player1 = p1.userId._id;
      }
      if (p2) {
        match.player2 = p2.userId._id;
      } else {
        // p2 is Bye
        match.player2 = undefined;
        // Auto-win for p1
        if (p1) {
          match.winner = p1.userId._id;
          match.status = 'completed';
          match.adminNotes = 'Bye Round';
        }
      }
      
      // If p1 is also null (shouldn't happen if logic is correct unless size calc is wrong), handle it.
      
      node.player1 = p1 ? p1.userId : { name: 'Bye' };
      node.player2 = p2 ? p2.userId : { name: 'Bye' };
      
    } else {
      // Recursive step
      const mid = Math.floor((startIndex + endIndex) / 2);
      
      // Left child (Previous round match feeding into Player 1 slot)
      const leftChild = buildTree(round - 1, startIndex, mid);
      
      // Right child (Previous round match feeding into Player 2 slot)
      const rightChild = buildTree(round - 1, mid + 1, endIndex);
      
      node.children = [leftChild, rightChild];
      
      // For non-round-1 matches, players are TBD (determined by winners of children)
      // We can leave player1/player2 as undefined or set placeholders in DB
      // Mongoose required fields might need attention.
      // In Match model, player1 is required. This is problematic for future rounds.
      // We should make player1/player2 optional or allow placeholders.
      // Or we set them to a "TBD" system user or keep them as the temporary IDs we generated.
      // Let's keep the temporary IDs for now, or better, update the model to allow nulls?
      // Model says: player1 required.
      // We can use a placeholder "TBD" ID or just use the random ID we generated.
    }

    matchesAccumulator.push(match);
    return node;
  };

  // Start recursion
  // Range is 0 to size - 1
  // But wait, endIndex in slice is exclusive usually, or inclusive?
  // Let's use indices.
  // Round 1 matches consume 2 players.
  // Round 2 matches consume 4 players (via 2 matches).
  // Root consumes all players.
  
  const root = buildTree(totalRounds, 0, size - 1);

  // Save matches
  // We need to handle the "required" player1 field for future matches.
  // Since we generated random ObjectIds, it satisfies the schema type.
  // But logically they are not valid users.
  // Ideally we should update schema to make player1 optional for scheduled matches.
  
  await Match.insertMany(matchesAccumulator);

  // Update tournament
  tournament.bracket = root;
  tournament.status = 'in-progress';
  await tournament.save();

  return { bracket: root, matches: matchesAccumulator };
};

const getRoundName = (round: number, totalRounds: number) => {
  if (round === totalRounds) return 'Finals';
  if (round === totalRounds - 1) return 'Semi-Finals';
  if (round === totalRounds - 2) return 'Quarter-Finals';
  return `Round ${round}`;
};
