import { Schema, model, type Document, type Types } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  seoDescription: string;
  seoKeywords: string[];
  imageUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
  parentCategory?: Types.ObjectId;
  productCount: number;
  showOnHome: boolean;
  createdAt: Date;
  updatedAt: Date;
  updateProductCount: () => Promise<void>;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    description: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: [{ type: String }],
    imageUrl: { type: String, default: '' },
    icon: { type: String, default: '🎮' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    parentCategory: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category', 
      default: null 
    },
    productCount: { type: Number, default: 0 },
    showOnHome: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes
categorySchema.index({ isActive: 1, order: 1 });
categorySchema.index({ parentCategory: 1 });

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const GameModel = model('Game');
  const count = await GameModel.countDocuments({ 
    categories: this._id,
    isActive: true 
  });
  this.productCount = count;
  await this.save();
};

// Pre-save hook to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug && this.nameEn) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

categorySchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return { ...rest, id: _id };
  }
});

export const CategoryModel = model<CategoryDocument>('Category', categorySchema);
