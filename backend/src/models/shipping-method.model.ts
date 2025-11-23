import { Schema, model, type Document } from 'mongoose';

export interface ShippingMethodDocument extends Document {
  name: string;
  price: number;
  priceLabel?: string;
  eta?: string;
  badge?: string;
  icon?: string;
  perks: string[];
  freeThreshold?: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const shippingMethodSchema = new Schema<ShippingMethodDocument>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    priceLabel: { type: String },
    eta: { type: String },
    badge: { type: String },
    icon: { type: String },
    perks: [{ type: String }],
    freeThreshold: { type: Number },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ShippingMethodModel = model<ShippingMethodDocument>('ShippingMethod', shippingMethodSchema);
