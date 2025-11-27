import { Schema, model, type Document } from 'mongoose';

export interface PaymentMethodDocument extends Document {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<PaymentMethodDocument>(
  {
    name: { type: String, required: true }, // e.g., 'online', 'cash', 'card-to-card'
    label: { type: String, required: true }, // e.g., 'پرداخت آنلاین'
    description: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const PaymentMethodModel = model<PaymentMethodDocument>('PaymentMethod', paymentMethodSchema);
