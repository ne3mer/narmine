import { Schema, model, type Document, Types } from 'mongoose';

export interface PriceAlertDocument extends Document {
  userId?: Types.ObjectId;
  gameId: Types.ObjectId;
  targetPrice: number;
  channel: 'email' | 'telegram';
  destination: string;
  active: boolean;
  createdAt: Date;
}

const priceAlertSchema = new Schema<PriceAlertDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    targetPrice: { type: Number, required: true },
    channel: { type: String, enum: ['email', 'telegram'], required: true },
    destination: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

priceAlertSchema.index({ gameId: 1, targetPrice: 1, active: 1 });

export const PriceAlertModel = model<PriceAlertDocument>('PriceAlert', priceAlertSchema);
