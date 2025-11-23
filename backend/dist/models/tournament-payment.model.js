"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TournamentPaymentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tournamentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    gateway: {
        type: String,
        required: true,
        enum: ['zarinpal', 'idpay', 'payping', 'test']
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    authority: {
        type: String,
        required: true,
        unique: true
    },
    refId: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    },
    metadata: {
        cardPan: String,
        cardHash: String,
        feeType: String,
        fee: Number
    },
    verifiedAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },
    refundReason: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes
TournamentPaymentSchema.index({ userId: 1 });
TournamentPaymentSchema.index({ tournamentId: 1 });
TournamentPaymentSchema.index({ authority: 1 });
TournamentPaymentSchema.index({ transactionId: 1 });
TournamentPaymentSchema.index({ status: 1 });
TournamentPaymentSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('TournamentPayment', TournamentPaymentSchema);
//# sourceMappingURL=tournament-payment.model.js.map