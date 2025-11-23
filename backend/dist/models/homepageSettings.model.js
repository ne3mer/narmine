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
exports.HomepageSettings = exports.DEFAULT_SECTIONS = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const homepageContent_1 = require("../config/homepageContent");
const SectionConfigSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, required: true },
    settings: { type: Map, of: mongoose_1.Schema.Types.Mixed, default: {} }
}, { _id: false });
const HomepageSettingsSchema = new mongoose_1.Schema({
    sections: [SectionConfigSchema],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String },
    content: { type: mongoose_1.Schema.Types.Mixed, default: homepageContent_1.DEFAULT_HOME_CONTENT }
}, {
    timestamps: true
});
// Default sections configuration
exports.DEFAULT_SECTIONS = [
    {
        id: 'hero-carousel',
        enabled: true,
        order: 1,
        settings: {
            autoPlay: true,
            speed: 5000,
            showArrows: true,
            showIndicators: true
        }
    },
    {
        id: 'popular-games',
        enabled: true,
        order: 2,
        settings: {
            itemCount: 8,
            sortBy: 'sales',
            categoryFilter: null
        }
    },
    {
        id: 'new-arrivals',
        enabled: true,
        order: 3,
        settings: {
            itemCount: 8,
            daysThreshold: 14
        }
    },
    {
        id: 'categories',
        enabled: true,
        order: 4,
        settings: {
            layout: 'grid',
            categoryCount: 6
        }
    },
    {
        id: 'gaming-gear',
        enabled: true,
        order: 5,
        settings: {
            itemCount: 4,
            productTypes: ['gaming_gear']
        }
    },
    {
        id: 'collectibles',
        enabled: true,
        order: 6,
        settings: {
            itemCount: 4,
            productTypes: ['action_figure', 'collectible_card']
        }
    },
    {
        id: 'testimonials',
        enabled: true,
        order: 7,
        settings: {
            itemCount: 3,
            autoRotate: false
        }
    },
    {
        id: 'trust-signals',
        enabled: true,
        order: 8,
        settings: {}
    }
];
exports.HomepageSettings = mongoose_1.default.model('HomepageSettings', HomepageSettingsSchema);
//# sourceMappingURL=homepageSettings.model.js.map