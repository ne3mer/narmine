import { model, Schema, type Document } from 'mongoose';

export interface IGameRequest extends Document {
  productName: string;
  category: string;
  brand: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  userId: Schema.Types.ObjectId;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const gameRequestSchema = new Schema<IGameRequest>(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adminNote: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { ...rest, id: _id };
      }
    }
  }
);

export const GameRequestModel = model<IGameRequest>('GameRequest', gameRequestSchema);
