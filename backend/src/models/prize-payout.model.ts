import mongoose, { Schema, Document } from 'mongoose';

export interface IPrizePayout extends Document {
  tournamentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  placement: number;
  amount: number;
  method: 'bank-transfer' | 'wallet' | 'crypto';
  bankInfo?: {
    accountNumber?: string;
    cardNumber?: string;
    iban?: string;
    accountHolder: string;
  };
  walletAddress?: string;
  status: 'pending' | 'requested' | 'processing' | 'paid' | 'failed' | 'cancelled';
  requestedAt?: Date;
  paidAt?: Date;
  transactionRef?: string;
  adminNotes?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrizePayoutSchema: Schema = new Schema(
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
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'TournamentParticipant',
      required: true
    },
    placement: {
      type: Number,
      required: true,
      min: 1
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      required: true,
      enum: ['bank-transfer', 'wallet', 'crypto']
    },
    bankInfo: {
      accountNumber: {
        type: String,
        trim: true
      },
      cardNumber: {
        type: String,
        trim: true
      },
      iban: {
        type: String,
        trim: true
      },
      accountHolder: {
        type: String,
        trim: true
      }
    },
    walletAddress: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'requested', 'processing', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },
    requestedAt: {
      type: Date
    },
    paidAt: {
      type: Date
    },
    transactionRef: {
      type: String,
      trim: true
    },
    adminNotes: {
      type: String
    },
    failureReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
PrizePayoutSchema.index({ tournamentId: 1 });
PrizePayoutSchema.index({ userId: 1 });
PrizePayoutSchema.index({ status: 1 });
PrizePayoutSchema.index({ createdAt: -1 });

// Ensure one payout per participant per tournament
PrizePayoutSchema.index({ tournamentId: 1, participantId: 1 }, { unique: true });

export default mongoose.model<IPrizePayout>('PrizePayout', PrizePayoutSchema);
