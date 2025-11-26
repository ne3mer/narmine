import mongoose, { Document, Schema } from 'mongoose';
import type { HomeContent } from '../config/homepageContent';
import { DEFAULT_HOME_CONTENT } from '../config/homepageContent';

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
  content: HomeContent;
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
  updatedBy: { type: String },
  content: { type: Schema.Types.Mixed, default: DEFAULT_HOME_CONTENT }
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
    id: 'dynamic-banners',
    enabled: true,
    order: 2,
    settings: {}
  },
  {
    id: 'sale-showcase',
    enabled: true,
    order: 3,
    settings: {
      layout: 'spotlight',
      highlightCount: 1,
      secondaryCount: 3
    }
  },
  {
    id: 'featured-collections',
    enabled: true,
    order: 4,
    settings: {
      itemCount: 8,
      sortBy: 'sales'
    }
  },
  {
    id: 'new-arrivals',
    enabled: true,
    order: 5,
    settings: {
      itemCount: 8,
      daysThreshold: 14
    }
  },
  {
    id: 'categories',
    enabled: true,
    order: 6,
    settings: {
      layout: 'grid',
      categoryCount: 6
    }
  },
  {
    id: 'trust-signals',
    enabled: true,
    order: 7,
    settings: {}
  },
  {
    id: 'shipping-experience',
    enabled: true,
    order: 8,
    settings: {}
  },
  {
    id: 'testimonials',
    enabled: true,
    order: 9,
    settings: {
      itemCount: 3,
      autoRotate: false
    }
  },
  {
    id: 'newsletter',
    enabled: true,
    order: 10,
    settings: {}
  }
];

export const HomepageSettings = mongoose.model<HomepageSettingsDocument>(
  'HomepageSettings',
  HomepageSettingsSchema
);
