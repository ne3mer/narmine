"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModel = void 0;
const mongoose_1 = require("mongoose");
const accountSchema = new mongoose_1.Schema({
    gameId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Game', required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    region: { type: String, required: true },
    type: { type: String, enum: ['standard', 'safe'], default: 'standard' },
    status: { type: String, enum: ['available', 'reserved', 'assigned', 'banned', 'expired'], default: 'available' }
}, { timestamps: true });
accountSchema.index({ gameId: 1, status: 1 });
exports.AccountModel = (0, mongoose_1.model)('Account', accountSchema);
//# sourceMappingURL=account.model.js.map