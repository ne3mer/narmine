import mongoose, { Document, Schema } from 'mongoose';

export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface HomepageSettingsDocument extends Document {
  sections: SectionConfig[];
  updatedAt: Date;
  updatedBy?: string;
}

const SectionConfigSchema = new Schema({
  id: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, required: true },
  settings: { type: Map, of: Schema.Types.Mixed, default: {} }
}, { _id: false });

const HomepageSettingsSchema = new Schema({
  sections: [SectionConfigSchema],
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String }
}, {
  timestamps: true
});

// Default sections configuration
export const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'hero-carousel',
    enabled: true,
    order: 1,
    settings: {
      autoPlay: true,
      speed: 5000,
      showArrows: true,
      showIndicators: true
    }
  },
  {
    id: 'popular-games',
    enabled: true,
    order: 2,
    settings: {
      itemCount: 8,
      sortBy: 'sales',
      categoryFilter: null
    }
  },
  {
    id: 'new-arrivals',
    enabled: true,
    order: 3,
    settings: {
      itemCount: 8,
      daysThreshold: 14
    }
  },
  {
    id: 'categories',
    enabled: true,
    order: 4,
    settings: {
      layout: 'grid',
      categoryCount: 6
    }
  },
  {
    id: 'gaming-gear',
    enabled: true,
    order: 5,
    settings: {
      itemCount: 4,
      productTypes: ['gaming_gear']
    }
  },
  {
    id: 'collectibles',
    enabled: true,
    order: 6,
    settings: {
      itemCount: 4,
      productTypes: ['action_figure', 'collectible_card']
    }
  },
  {
    id: 'testimonials',
    enabled: true,
    order: 7,
    settings: {
      itemCount: 3,
      autoRotate: false
    }
  },
  {
    id: 'trust-signals',
    enabled: true,
    order: 8,
    settings: {}
  }
];

export const HomepageSettings = mongoose.model<HomepageSettingsDocument>(
  'HomepageSettings',
  HomepageSettingsSchema
);
