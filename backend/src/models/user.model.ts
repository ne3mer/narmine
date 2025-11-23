import { Schema, model, type Document } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  telegram?: string;
  role: 'user' | 'admin';

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
