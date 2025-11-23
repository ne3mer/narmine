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
const TournamentSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    game: {
        name: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            required: true,
            enum: ['PS4', 'PS5', 'Xbox', 'PC', 'Cross-Platform']
        },
        image: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        required: true,
        enum: ['solo', 'duo', '1v1', 'squad', 'kill-race']
    },
    format: {
        type: String,
        required: true,
        enum: ['single-elimination', 'double-elimination', 'round-robin', 'battle-royale']
    },
    entryFee: {
        type: Number,
        required: true,
        min: 0
    },
    prizePool: {
        total: {
            type: Number,
            required: true,
            min: 0
        },
        distribution: {
            type: Map,
            of: Number,
            required: true
        }
    },
    maxPlayers: {
        type: Number,
        required: true,
        min: 2
    },
    currentPlayers: {
        type: Number,
        default: 0,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['upcoming', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    rules: [{
            type: String
        }],
    requirements: {
        psnId: {
            type: Boolean,
            default: false
        },
        activisionId: {
            type: Boolean,
            default: false
        },
        epicId: {
            type: Boolean,
            default: false
        },
        minLevel: {
            type: Number,
            min: 0
        }
    },
    banner: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    bracket: {
        type: mongoose_1.Schema.Types.Mixed
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
// Indexes for better query performance
TournamentSchema.index({ slug: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ featured: 1 });
TournamentSchema.index({ startDate: 1 });
TournamentSchema.index({ 'game.name': 1 });
// Virtual for checking if registration is open
TournamentSchema.virtual('isRegistrationOpen').get(function () {
    const now = new Date();
    return (this.status === 'registration-open' &&
        this.currentPlayers < this.maxPlayers &&
        now < this.registrationDeadline);
});
// Virtual for checking if tournament is full
TournamentSchema.virtual('isFull').get(function () {
    return this.currentPlayers >= this.maxPlayers;
});
exports.default = mongoose_1.default.model('Tournament', TournamentSchema);
//# sourceMappingURL=tournament.model.js.map