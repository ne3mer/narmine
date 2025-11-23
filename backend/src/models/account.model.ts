import { Schema, model, type Document, Types } from 'mongoose';

export type AccountStatus = 'available' | 'reserved' | 'assigned' | 'banned' | 'expired';
export type AccountType = 'standard' | 'safe';

export interface AccountDocument extends Document {
  gameId: Types.ObjectId;
  email: string;
  passwordHash: string;
  region: string;
  type: AccountType;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<AccountDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    region: { type: String, required: true },
    type: { type: String, enum: ['standard', 'safe'], default: 'standard' },
    status: { type: String, enum: ['available', 'reserved', 'assigned', 'banned', 'expired'], default: 'available' }
  },
  { timestamps: true }
);

accountSchema.index({ gameId: 1, status: 1 });

export const AccountModel = model<AccountDocument>('Account', accountSchema);
