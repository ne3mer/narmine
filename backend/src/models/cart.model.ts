import { model, Schema, type Document } from 'mongoose';

export interface ICartItem {
  gameId: Schema.Types.ObjectId;
  variantId?: string;
  selectedOptions?: Map<string, string>;
  quantity: number;
  priceAtAdd: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    variantId: {
      type: String
    },
    selectedOptions: {
      type: Map,
      of: String
    },
    priceAtAdd: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
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

// Index for faster queries
// cartSchema.index({ userId: 1 }); // Removed duplicate index (already defined as unique in schema)

export const CartModel = model<ICart>('Cart', cartSchema);
