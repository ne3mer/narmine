import mongoose, { Schema, Document } from 'mongoose';

export interface ITournament extends Document {
  title: string;
  slug: string;
  description: string;
  game: {
    name: string;
    platform: string;
    image: string;
  };
  type: 'solo' | 'duo' | '1v1' | 'squad' | 'kill-race';
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'battle-royale';
  entryFee: number;
  prizePool: {
    total: number;
    distribution: {
      first: number;
      second?: number;
      third?: number;
      fourth?: number;
      [key: string]: number | undefined;
    };
  };
  maxPlayers: number;
  currentPlayers: number;
  startDate: Date;
  endDate?: Date;
  registrationDeadline: Date;
  status: 'upcoming' | 'registration-open' | 'registration-closed' | 'in-progress' | 'completed' | 'cancelled';
  rules: string[];
  requirements: {
    psnId: boolean;
    activisionId: boolean;
    epicId: boolean;
    minLevel?: number;
  };
  banner: string;
  featured: boolean;
  bracket?: any; // Will be populated during tournament
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    game: {
      name: {
        type: String,
        required: true
      },
      platform: {
        type: String,
        required: true,
        enum: ['PS4', 'PS5', 'Xbox', 'PC', 'Cross-Platform']
      },
      image: {
        type: String,
        required: true
      }
    },
    type: {
      type: String,
      required: true,
      enum: ['solo', 'duo', '1v1', 'squad', 'kill-race']
    },
    format: {
      type: String,
      required: true,
      enum: ['single-elimination', 'double-elimination', 'round-robin', 'battle-royale']
    },
    entryFee: {
      type: Number,
      required: true,
      min: 0
    },
    prizePool: {
      total: {
        type: Number,
        required: true,
        min: 0
      },
      distribution: {
        type: Map,
        of: Number,
        required: true
      }
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 2
    },
    currentPlayers: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    registrationDeadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['upcoming', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    rules: [{
      type: String
    }],
    requirements: {
      psnId: {
        type: Boolean,
        default: false
      },
      activisionId: {
        type: Boolean,
        default: false
      },
      epicId: {
        type: Boolean,
        default: false
      },
      minLevel: {
        type: Number,
        min: 0
      }
    },
    banner: {
      type: String,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    bracket: {
      type: Schema.Types.Mixed
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
TournamentSchema.index({ slug: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ featured: 1 });
TournamentSchema.index({ startDate: 1 });
TournamentSchema.index({ 'game.name': 1 });

// Virtual for checking if registration is open
TournamentSchema.virtual('isRegistrationOpen').get(function(this: ITournament) {
  const now = new Date();
  return (
    this.status === 'registration-open' &&
    this.currentPlayers < this.maxPlayers &&
    now < this.registrationDeadline
  );
});

// Virtual for checking if tournament is full
TournamentSchema.virtual('isFull').get(function(this: ITournament) {
  return this.currentPlayers >= this.maxPlayers;
});

export default mongoose.model<ITournament>('Tournament', TournamentSchema);
