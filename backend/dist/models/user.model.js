"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    telegram: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Tournament fields
    gameTag: {
        psn: { type: String, trim: true },
        activision: { type: String, trim: true },
        epic: { type: String, trim: true }
    },
    telegramChatId: { type: String },
    bankInfo: {
        accountNumber: { type: String, trim: true },
        cardNumber: { type: String, trim: true },
        iban: { type: String, trim: true },
        accountHolder: { type: String, trim: true }
    },
    walletBalance: { type: Number, default: 0, min: 0 },
    banned: {
        status: { type: Boolean, default: false },
        reason: { type: String },
        until: { type: Date },
        permanent: { type: Boolean, default: false }
    },
    warnings: [{
            reason: { type: String, required: true },
            date: { type: Date, default: Date.now },
            tournamentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tournament' }
        }]
}, { timestamps: true });
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { _id, __v, password, ...rest } = ret;
        return { ...rest, id: _id };
    }
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=user.model.js.map