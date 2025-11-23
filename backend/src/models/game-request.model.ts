import mongoose, { Schema, Document } from 'mongoose';

export interface IGameRequest extends Document {
  userId: mongoose.Types.ObjectId;
  gameName: string;
  platform: string;
  region: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  adminResponse?: string;
  createdAt: Date;
  respondedAt?: Date;
}

const GameRequestSchema = new Schema<IGameRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gameName: {
      type: String,
      required: [true, 'نام بازی الزامی است'],
      trim: true,
      maxlength: [200, 'نام بازی نباید بیشتر از 200 کاراکتر باشد']
    },
    platform: {
      type: String,
      required: [true, 'پلتفرم الزامی است'],
      enum: {
        values: ['PS4', 'PS5', 'Xbox One', 'Xbox Series X/S', 'PC', 'Nintendo Switch', 'Other'],
        message: 'پلتفرم انتخابی معتبر نیست'
      }
    },
    region: {
      type: String,
      required: [true, 'منطقه الزامی است'],
      enum: {
        values: ['USA', 'Europe', 'Turkey', 'UAE', 'Asia', 'Other'],
        message: 'منطقه انتخابی معتبر نیست'
      }
    },
    description: {
      type: String,
      required: [true, 'توضیحات الزامی است'],
      trim: true,
      maxlength: [1000, 'توضیحات نباید بیشتر از 1000 کاراکتر باشد']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled'],
      default: 'pending',
      index: true
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [500, 'پاسخ ادمین نباید بیشتر از 500 کاراکتر باشد']
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
GameRequestSchema.index({ userId: 1, createdAt: -1 });
GameRequestSchema.index({ status: 1, createdAt: -1 });

export const GameRequest = mongoose.model<IGameRequest>('GameRequest', GameRequestSchema);
