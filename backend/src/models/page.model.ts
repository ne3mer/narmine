import { Schema, model, Document } from 'mongoose';

export interface PageSection {
  id: string;
  type: 'text' | 'list' | 'faq' | 'contact-info' | 'steps';
  title: string;
  content: string;
  items?: string[];
  order: number;
}

export interface PageDocument extends Document {
  pageSlug: string;
  title: string;
  subtitle?: string;
  sections: PageSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  isActive: boolean;
  updatedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSectionSchema = new Schema<PageSection>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'list', 'faq', 'contact-info', 'steps'],
    required: true 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  items: [{ type: String }],
  order: { type: Number, required: true, default: 0 }
}, { _id: false });

const pageSchema = new Schema<PageDocument>({
  pageSlug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  sections: [pageSectionSchema],
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export const PageModel = model<PageDocument>('Page', pageSchema);
