"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    productCount: { type: Number, default: 0 },
    showOnHome: { type: Boolean, default: false }
}, { timestamps: true });
// Indexes
categorySchema.index({ isActive: 1, order: 1 });
categorySchema.index({ parentCategory: 1 });
// Method to update product count
categorySchema.methods.updateProductCount = async function () {
    const GameModel = (0, mongoose_1.model)('Game');
    const count = await GameModel.countDocuments({
        categories: this._id,
        isActive: true
    });
    this.productCount = count;
    await this.save();
};
// Pre-save hook to generate slug if not provided
categorySchema.pre('save', function (next) {
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
        return { ...rest, id: _id, _id };
    }
});
exports.CategoryModel = (0, mongoose_1.model)('Category', categorySchema);
//# sourceMappingURL=category.model.js.map