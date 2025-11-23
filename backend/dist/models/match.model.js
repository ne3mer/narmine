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
const MatchSchema = new mongoose_1.Schema({
    tournamentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    round: {
        type: Number,
        required: true,
        min: 1
    },
    roundName: {
        type: String,
        required: true
    },
    player1: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    player2: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    winner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: ['scheduled', 'in-progress', 'completed', 'disputed', 'cancelled', 'pending_verification'],
        default: 'scheduled'
    },
    lobbyCode: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    results: [{
            playerId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            score: {
                type: Number,
                required: true,
                min: 0
            },
            screenshot: {
                type: String
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            verified: {
                type: Boolean,
                default: false
            },
            verifiedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            verifiedAt: {
                type: Date
            }
        }],
    dispute: {
        reportedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String
        },
        evidence: [{
                type: String
            }],
        status: {
            type: String,
            enum: ['open', 'resolved']
        },
        resolution: {
            type: String
        },
        resolvedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: {
            type: Date
        }
    },
    adminNotes: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes
MatchSchema.index({ tournamentId: 1, round: 1 });
MatchSchema.index({ player1: 1 });
MatchSchema.index({ player2: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ startTime: 1 });
// Virtual to check if both players submitted results
MatchSchema.virtual('bothSubmitted').get(function () {
    if (!this.player2)
        return this.results.length >= 1; // Bye round
    return this.results.length >= 2;
});
exports.default = mongoose_1.default.model('Match', MatchSchema);
//# sourceMappingURL=match.model.js.map