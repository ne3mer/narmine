import mongoose, { Schema, Document } from 'mongoose';

export interface ITournamentPayment extends Document {
  userId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  amount: number;
  gateway: string;
  transactionId?: string;
  authority: string;
  refId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  metadata?: {
    cardPan?: string;
    cardHash?: string;
    feeType?: string;
    fee?: number;
  };
  createdAt: Date;
  verifiedAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
}

const TournamentPaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    gateway: {
      type: String,
      required: true,
      enum: ['zarinpal', 'idpay', 'payping', 'test']
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    authority: {
      type: String,
      required: true,
      unique: true
    },
    refId: {
      type: String
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending'
    },
    metadata: {
      cardPan: String,
      cardHash: String,
      feeType: String,
      fee: Number
    },
    verifiedAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
TournamentPaymentSchema.index({ userId: 1 });
TournamentPaymentSchema.index({ tournamentId: 1 });
TournamentPaymentSchema.index({ authority: 1 });
TournamentPaymentSchema.index({ transactionId: 1 });
TournamentPaymentSchema.index({ status: 1 });
TournamentPaymentSchema.index({ createdAt: -1 });

export default mongoose.model<ITournamentPayment>('TournamentPayment', TournamentPaymentSchema);
