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
exports.GameRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GameRequestSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    gameName: {
        type: String,
        required: [true, 'نام بازی الزامی است'],
        trim: true,
        maxlength: [200, 'نام بازی نباید بیشتر از 200 کاراکتر باشد']
    },
    platform: {
        type: String,
        required: [true, 'پلتفرم الزامی است'],
        enum: {
            values: ['PS4', 'PS5', 'Xbox One', 'Xbox Series X/S', 'PC', 'Nintendo Switch', 'Other'],
            message: 'پلتفرم انتخابی معتبر نیست'
        }
    },
    region: {
        type: String,
        required: [true, 'منطقه الزامی است'],
        enum: {
            values: ['USA', 'Europe', 'Turkey', 'UAE', 'Asia', 'Other'],
            message: 'منطقه انتخابی معتبر نیست'
        }
    },
    description: {
        type: String,
        required: [true, 'توضیحات الزامی است'],
        trim: true,
        maxlength: [1000, 'توضیحات نباید بیشتر از 1000 کاراکتر باشد']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'fulfilled'],
        default: 'pending',
        index: true
    },
    adminResponse: {
        type: String,
        trim: true,
        maxlength: [500, 'پاسخ ادمین نباید بیشتر از 500 کاراکتر باشد']
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Index for efficient queries
GameRequestSchema.index({ userId: 1, createdAt: -1 });
GameRequestSchema.index({ status: 1, createdAt: -1 });
exports.GameRequest = mongoose_1.default.model('GameRequest', GameRequestSchema);
//# sourceMappingURL=game-request.model.js.map