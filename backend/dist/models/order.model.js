"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const generateOrderNumber = () => {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `GC${year}${month}${day}-${random}`;
};
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    orderNumber: { type: String, required: true, unique: true, default: generateOrderNumber },
    customerInfo: {
        name: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    note: { type: String },
    items: [
        {
            gameId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Game', required: true },
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
    assignedAccounts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Account' }],
    deliveryInfo: {
        message: { type: String },
        credentials: { type: String },
        deliveredAt: { type: Date },
        updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
    },
    customerAcknowledgement: {
        acknowledged: { type: Boolean, default: false },
        acknowledgedAt: { type: Date }
    }
}, { timestamps: true });
orderSchema.pre('validate', async function (next) {
    if (this.orderNumber)
        return next();
    let candidate = generateOrderNumber();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = this.constructor;
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
exports.OrderModel = (0, mongoose_1.model)('Order', orderSchema);
//# sourceMappingURL=order.model.js.map