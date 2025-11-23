import { Schema, model, type Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewDocument extends Document {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  adminNote?: string; // Admin's note when approving/rejecting
  reviewedBy?: Types.ObjectId; // Admin who reviewed
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, minlength: 10 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

reviewSchema.index({ gameId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, gameId: 1 }); // Prevent duplicate reviews

reviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return { ...rest, id: _id };
  }
});

export const ReviewModel = model<ReviewDocument>('Review', reviewSchema);
