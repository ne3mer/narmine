"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageModel = void 0;
const mongoose_1 = require("mongoose");
const pageSectionSchema = new mongoose_1.Schema({
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
const pageSchema = new mongoose_1.Schema({
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
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});
exports.PageModel = (0, mongoose_1.model)('Page', pageSchema);
//# sourceMappingURL=page.model.js.map