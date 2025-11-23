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
const TournamentParticipantSchema = new mongoose_1.Schema({
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
    gameTag: {
        psn: {
            type: String,
            trim: true
        },
        activision: {
            type: String,
            trim: true
        },
        epic: {
            type: String,
            trim: true
        }
    },
    paymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TournamentPayment',
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['registered', 'active', 'eliminated', 'winner', 'disqualified'],
        default: 'registered'
    },
    currentRound: {
        type: Number,
        default: 0
    },
    matchHistory: [{
            matchId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Match'
            },
            round: {
                type: Number,
                required: true
            },
            opponent: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            result: {
                type: String,
                enum: ['win', 'loss', 'pending'],
                default: 'pending'
            },
            score: {
                type: Number,
                default: 0
            }
        }],
    finalPlacement: {
        type: Number,
        min: 1
    },
    prizeWon: {
        type: Number,
        default: 0,
        min: 0
    },
    prizeStatus: {
        type: String,
        required: true,
        enum: ['none', 'pending', 'paid'],
        default: 'none'
    }
}, {
    timestamps: true
});
// Compound index to ensure one user can only register once per tournament
TournamentParticipantSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });
// Indexes for queries
TournamentParticipantSchema.index({ tournamentId: 1, status: 1 });
TournamentParticipantSchema.index({ userId: 1, status: 1 });
TournamentParticipantSchema.index({ paymentStatus: 1 });
exports.default = mongoose_1.default.model('TournamentParticipant', TournamentParticipantSchema);
//# sourceMappingURL=tournament-participant.model.js.map