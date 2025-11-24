import { Schema, model, type Document, type Types } from 'mongoose';

export interface GameDocument extends Document {
  title: string;
  slug: string;
  description: string;
  detailedDescription?: string; // Rich text HTML
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;

  coverUrl?: string;
  gallery?: string[]; // Additional product images
  tags: string[];
  categories?: Types.ObjectId[]; // Reference to Category model
  
  // New media fields
  trailerUrl?: string;
  gameplayVideoUrl?: string;
  screenshots?: string[];
  
  // Enhanced metadata
  rating?: number;
  releaseDate?: Date;
  developer?: string;
  publisher?: string;
  ageRating?: string;
  features?: string[];
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  
  // SEO & Marketing
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  onSale?: boolean;
  salePrice?: number;

  // Multi-Product System Fields
  productType: 'digital_game' | 'physical_product' | 'digital_content' | 'gaming_gear' | 'collectible' | 'bundle';
  
  // Dynamic custom fields for different product types
  customFields?: Map<string, any>;
  
  // Inventory management (for physical products)
  inventory?: {
    trackInventory: boolean;
    quantity: number;
    reserved: number;
    lowStockThreshold: number;
    sku?: string;
  };
  
  // Shipping information (for physical products)
  shipping?: {
    requiresShipping: boolean;
    weight?: number; // grams
    dimensions?: {
      length: number; // cm
      width: number;
      height: number;
    };
    shippingCost?: number;
    freeShippingThreshold?: number;
  };

  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    id: string;
    selectedOptions: Map<string, string>;
    price: number;
    stock: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<GameDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    detailedDescription: { type: String }, // Rich text HTML
    genre: [{ type: String }], // Optional for physical
    platform: { type: String }, // Optional for physical
    regionOptions: [{ type: String }], // Optional for physical
    basePrice: { type: Number, required: true },

    coverUrl: { type: String },
    gallery: [{ type: String }],
    tags: [{ type: String }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    // New media fields
    trailerUrl: { type: String },
    gameplayVideoUrl: { type: String },
    screenshots: [{ type: String }],
    // Enhanced metadata
    rating: { type: Number, min: 0, max: 5 },
    releaseDate: { type: Date },
    developer: { type: String },
    publisher: { type: String },
    ageRating: { type: String },
    features: [{ type: String }],
    systemRequirements: {
      minimum: { type: String },
      recommended: { type: String }
    },
    // SEO & Marketing
    metaTitle: { type: String },
    metaDescription: { type: String },
    featured: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number },
    
    // Multi-Product System Fields
    productType: {
      type: String,
      enum: ['digital_game', 'physical_product', 'digital_content', 'gaming_gear', 'collectible', 'bundle'],
      default: 'physical_product' // Changed default
    },
    
    // Dynamic custom fields
    customFields: {
      type: Map,
      of: Schema.Types.Mixed
    },
    
    // Inventory management
    inventory: {
      trackInventory: { type: Boolean, default: true }, // Default true for physical
      quantity: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      sku: { type: String }
    },
    
    // Shipping information
    shipping: {
      requiresShipping: { type: Boolean, default: true }, // Default true for physical
      weight: { type: Number }, // grams
      dimensions: {
        length: { type: Number }, // cm
        width: { type: Number },
        height: { type: Number }
      },
      shippingCost: { type: Number },
      freeShippingThreshold: { type: Number }
    },
    
    // Options and variants
    options: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        values: [{ type: String, required: true }]
      }
    ],
    variants: [
      {
        id: { type: String, required: true },
        selectedOptions: { type: Map, of: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

gameSchema.index({ title: 'text', description: 'text' });

gameSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return { ...rest, id: _id };
  }
});

export const GameModel = model<GameDocument>('Game', gameSchema);
