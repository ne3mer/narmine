import { Schema, model, type Document } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  telegram?: string;
  role: 'user' | 'admin';
  // Tournament-related fields
  gameTag?: {
    psn?: string;
    activision?: string;
    epic?: string;
  };
  telegramChatId?: string;
  bankInfo?: {
    accountNumber?: string;
    cardNumber?: string;
    iban?: string;
    accountHolder?: string;
  };
  walletBalance: number;
  banned?: {
    status: boolean;
    reason?: string;
    until?: Date;
    permanent: boolean;
  };
  warnings: Array<{
    reason: string;
    date: Date;
    tournamentId?: Schema.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    telegram: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Tournament fields
    gameTag: {
      psn: { type: String, trim: true },
      activision: { type: String, trim: true },
      epic: { type: String, trim: true }
    },
    telegramChatId: { type: String },
    bankInfo: {
      accountNumber: { type: String, trim: true },
      cardNumber: { type: String, trim: true },
      iban: { type: String, trim: true },
      accountHolder: { type: String, trim: true }
    },
    walletBalance: { type: Number, default: 0, min: 0 },
    banned: {
      status: { type: Boolean, default: false },
      reason: { type: String },
      until: { type: Date },
      permanent: { type: Boolean, default: false }
    },
    warnings: [{
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now },
      tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' }
    }]
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, password, ...rest } = ret;
    return { ...rest, id: _id };
  }
});

export const UserModel = model<UserDocument>('User', userSchema);
