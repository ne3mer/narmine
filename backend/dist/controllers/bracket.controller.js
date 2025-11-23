"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBracket = exports.generateBracket = void 0;
const bracket_service_1 = require("../services/bracket.service");
const tournament_model_1 = __importDefault(require("../models/tournament.model"));
const generateBracket = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if tournament exists
        const tournament = await tournament_model_1.default.findById(id);
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        // Check if bracket already exists
        if (tournament.bracket && Object.keys(tournament.bracket).length > 0) {
            return res.status(400).json({ message: 'براکت این تورنمنت قبلاً ایجاد شده است' });
        }
        // Generate bracket
        const { bracket, matches } = await (0, bracket_service_1.generateSingleEliminationBracket)(id);
        res.json({
            message: 'براکت با موفقیت ایجاد شد',
            bracket,
            matchesCount: matches.length
        });
    }
    catch (error) {
        console.error('Error generating bracket:', error);
        res.status(500).json({ message: 'خطا در ایجاد براکت', error: error.message });
    }
};
exports.generateBracket = generateBracket;
const getBracket = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await tournament_model_1.default.findById(id).select('bracket');
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        res.json({ bracket: tournament.bracket });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت براکت', error: error.message });
    }
};
exports.getBracket = getBracket;
//# sourceMappingURL=bracket.controller.js.map