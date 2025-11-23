import { Schema, model, type Document, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type FulfillmentStatus = 'pending' | 'assigned' | 'delivered' | 'refunded';

interface OrderItem {
  gameId: Types.ObjectId;
  variantId?: string;
  selectedOptions?: Map<string, string>;
  pricePaid: number;
  quantity: number;
  warranty?: {
    status: 'active' | 'expired' | 'voided';
    startDate?: Date;
    endDate?: Date;
    description?: string;
  };
}

interface ShippingAddress {
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  recipientName?: string;
  recipientPhone?: string;
}

interface CustomerInfo {
  name?: string;
  email: string;
  phone: string;
  shippingAddress?: ShippingAddress;
}

interface ShippingMethodInfo {
  id?: string;
  name: string;
  price: number;
  priceLabel?: string;
  eta?: string;
  badge?: string;
  icon?: string;
  perks?: string[];
  freeThreshold?: number;
}

interface ShippingPreferences {
  deliveryDate?: Date;
  instructions?: string;
}

export interface OrderDocument extends Document {
  userId?: Types.ObjectId;
  orderNumber: string;
  customerInfo: CustomerInfo;
  note?: string; // Customer note
  items: OrderItem[];
  totalAmount: number;
  couponCode?: string; // Applied coupon code
  discountAmount?: number; // Discount amount applied
  paymentMethod?: string; // 'online' | 'wallet'
  paymentStatus: PaymentStatus;
  paymentReference?: string; // ZarinPal Authority
  fulfillmentStatus: FulfillmentStatus;
  assignedAccounts: Types.ObjectId[];
  deliveryInfo?: {
    message?: string;
    credentials?: string;
    deliveredAt?: Date;
    updatedBy?: Types.ObjectId;
  };
  shippingMethod?: ShippingMethodInfo;
  shippingPreferences?: ShippingPreferences;
  customerAcknowledgement?: {
    acknowledged: boolean;
    acknowledgedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const generateOrderNumber = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `GC${year}${month}${day}-${random}`;
};

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orderNumber: { type: String, required: true, unique: true, default: generateOrderNumber },
    customerInfo: {
      name: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      // Shipping Address
      shippingAddress: {
        province: { type: String },
        city: { type: String },
        address: { type: String },
        postalCode: { type: String },
        recipientName: { type: String },
        recipientPhone: { type: String }
      }
    },
    note: { type: String },
    items: [
      {
        gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
        variantId: { type: String },
        selectedOptions: { type: Map, of: String },
        pricePaid: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        warranty: {
          status: { type: String, enum: ['active', 'expired', 'voided'], default: 'active' },
          startDate: { type: Date },
          endDate: { type: Date },
          description: { type: String }
        }
      }
    ],
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    discountAmount: { type: Number },
    paymentMethod: { type: String, default: 'online' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentReference: { type: String },
    fulfillmentStatus: { type: String, enum: ['pending', 'assigned', 'delivered', 'refunded'], default: 'pending' },
    assignedAccounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
    deliveryInfo: {
      message: { type: String },
      credentials: { type: String },
      trackingCode: { type: String }, // Added tracking code
      deliveredAt: { type: Date },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    shippingMethod: {
      id: { type: String },
      name: { type: String },
      price: { type: Number },
      priceLabel: { type: String },
      eta: { type: String },
      badge: { type: String },
      icon: { type: String },
      perks: [{ type: String }],
      freeThreshold: { type: Number }
    },
    shippingPreferences: {
      deliveryDate: { type: Date },
      instructions: { type: String }
    },
    customerAcknowledgement: {
      acknowledged: { type: Boolean, default: false },
      acknowledgedAt: { type: Date }
    }
  },
  { timestamps: true }
);

orderSchema.pre('validate', async function (next) {
  if (this.orderNumber) return next();
  let candidate = generateOrderNumber();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = this.constructor as any;
  // Ensure uniqueness by checking existing docs
  // eslint-disable-next-line no-constant-condition
  while (await model.exists({ orderNumber: candidate })) {
    candidate = generateOrderNumber();
  }
  this.orderNumber = candidate;
  next();
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ 'customerInfo.phone': 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderNumber: 1, createdAt: -1 });

export const OrderModel = model<OrderDocument>('Order', orderSchema);
