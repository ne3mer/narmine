import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  round: number;
  roundName: string;
  player1: mongoose.Types.ObjectId;
  player2?: mongoose.Types.ObjectId; // Optional for bye rounds
  winner?: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in-progress' | 'completed' | 'disputed' | 'cancelled' | 'pending_verification';
  lobbyCode?: string;
  startTime: Date;
  results: Array<{
    playerId: mongoose.Types.ObjectId;
    score: number;
    screenshot?: string;
    submittedAt: Date;
    verified: boolean;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
  }>;
  dispute?: {
    reportedBy: mongoose.Types.ObjectId;
    reason: string;
    evidence: string[];
    status: 'open' | 'resolved';
    resolution?: string;
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
  };
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    round: {
      type: Number,
      required: true,
      min: 1
    },
    roundName: {
      type: String,
      required: true
    },
    player1: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    player2: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'in-progress', 'completed', 'disputed', 'cancelled', 'pending_verification'],
      default: 'scheduled'
    },
    lobbyCode: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    results: [{
      playerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      score: {
        type: Number,
        required: true,
        min: 0
      },
      screenshot: {
        type: String
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      verified: {
        type: Boolean,
        default: false
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: {
        type: Date
      }
    }],
    dispute: {
      reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String
      },
      evidence: [{
        type: String
      }],
      status: {
        type: String,
        enum: ['open', 'resolved']
      },
      resolution: {
        type: String
      },
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: {
        type: Date
      }
    },
    adminNotes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
MatchSchema.index({ tournamentId: 1, round: 1 });
MatchSchema.index({ player1: 1 });
MatchSchema.index({ player2: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ startTime: 1 });

// Virtual to check if both players submitted results
MatchSchema.virtual('bothSubmitted').get(function(this: IMatch) {
  if (!this.player2) return this.results.length >= 1; // Bye round
  return this.results.length >= 2;
});

export default mongoose.model<IMatch>('Match', MatchSchema);
