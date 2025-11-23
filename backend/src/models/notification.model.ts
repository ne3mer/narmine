import { Schema, model, type Document, Types } from 'mongoose';

export interface NotificationDocument extends Document {
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  type: 'order_email' | 'order_update' | 'price_alert' | 'system';
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    type: {
      type: String,
      enum: ['order_email', 'order_update', 'price_alert', 'system'],
      required: true
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const NotificationModel = model<NotificationDocument>('Notification', notificationSchema);

