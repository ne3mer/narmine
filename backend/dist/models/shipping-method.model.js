"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingMethodModel = void 0;
const mongoose_1 = require("mongoose");
const shippingMethodSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.ShippingMethodModel = (0, mongoose_1.model)('ShippingMethod', shippingMethodSchema);
//# sourceMappingURL=shipping-method.model.js.map