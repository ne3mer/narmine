import mongoose, { Schema, Document } from 'mongoose';

export interface ITournamentParticipant extends Document {
  tournamentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  gameTag: {
    psn?: string;
    activision?: string;
    epic?: string;
  };
  paymentId: mongoose.Types.ObjectId;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  registeredAt: Date;
  status: 'registered' | 'active' | 'eliminated' | 'winner' | 'disqualified';
  currentRound: number;
  matchHistory: Array<{
    matchId: mongoose.Types.ObjectId;
    round: number;
    opponent: mongoose.Types.ObjectId;
    result: 'win' | 'loss' | 'pending';
    score: number;
  }>;
  finalPlacement?: number;
  prizeWon: number;
  prizeStatus: 'none' | 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const TournamentParticipantSchema: Schema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gameTag: {
      psn: {
        type: String,
        trim: true
      },
      activision: {
        type: String,
        trim: true
      },
      epic: {
        type: String,
        trim: true
      }
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'TournamentPayment',
      required: true
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      required: true,
      enum: ['registered', 'active', 'eliminated', 'winner', 'disqualified'],
      default: 'registered'
    },
    currentRound: {
      type: Number,
      default: 0
    },
    matchHistory: [{
      matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
      },
      round: {
        type: Number,
        required: true
      },
      opponent: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      result: {
        type: String,
        enum: ['win', 'loss', 'pending'],
        default: 'pending'
      },
      score: {
        type: Number,
        default: 0
      }
    }],
    finalPlacement: {
      type: Number,
      min: 1
    },
    prizeWon: {
      type: Number,
      default: 0,
      min: 0
    },
    prizeStatus: {
      type: String,
      required: true,
      enum: ['none', 'pending', 'paid'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one user can only register once per tournament
TournamentParticipantSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });

// Indexes for queries
TournamentParticipantSchema.index({ tournamentId: 1, status: 1 });
TournamentParticipantSchema.index({ userId: 1, status: 1 });
TournamentParticipantSchema.index({ paymentStatus: 1 });

export default mongoose.model<ITournamentParticipant>('TournamentParticipant', TournamentParticipantSchema);
