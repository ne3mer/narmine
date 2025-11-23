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
const PrizePayoutSchema = new mongoose_1.Schema({
    tournamentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TournamentParticipant',
        required: true
    },
    placement: {
        type: Number,
        required: true,
        min: 1
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        required: true,
        enum: ['bank-transfer', 'wallet', 'crypto']
    },
    bankInfo: {
        accountNumber: {
            type: String,
            trim: true
        },
        cardNumber: {
            type: String,
            trim: true
        },
        iban: {
            type: String,
            trim: true
        },
        accountHolder: {
            type: String,
            trim: true
        }
    },
    walletAddress: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'requested', 'processing', 'paid', 'failed', 'cancelled'],
        default: 'pending'
    },
    requestedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    },
    transactionRef: {
        type: String,
        trim: true
    },
    adminNotes: {
        type: String
    },
    failureReason: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes
PrizePayoutSchema.index({ tournamentId: 1 });
PrizePayoutSchema.index({ userId: 1 });
PrizePayoutSchema.index({ status: 1 });
PrizePayoutSchema.index({ createdAt: -1 });
// Ensure one payout per participant per tournament
PrizePayoutSchema.index({ tournamentId: 1, participantId: 1 }, { unique: true });
exports.default = mongoose_1.default.model('PrizePayout', PrizePayoutSchema);
//# sourceMappingURL=prize-payout.model.js.map