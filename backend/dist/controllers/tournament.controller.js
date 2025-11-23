"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParticipantStatus = exports.kickParticipant = exports.getMyTournaments = exports.getTournamentParticipants = exports.deleteTournament = exports.updateTournament = exports.registerForTournament = exports.getTournamentDetails = exports.createTournament = exports.getTournamentById = exports.getFeaturedTournaments = exports.getTournaments = void 0;
const tournament_model_1 = __importDefault(require("../models/tournament.model"));
const tournament_participant_model_1 = __importDefault(require("../models/tournament-participant.model"));
const tournament_payment_model_1 = __importDefault(require("../models/tournament-payment.model"));
const email_service_1 = require("../services/email.service");
const telegram_service_1 = require("../services/telegram.service");
const slug_1 = require("../utils/slug");
// Get all tournaments with filters
const getTournaments = async (req, res) => {
    try {
        const { game, type, status, featured, minEntryFee, maxEntryFee, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
        const query = {};
        // Apply filters
        if (game)
            query['game.name'] = new RegExp(game, 'i');
        if (type)
            query.type = type;
        if (status)
            query.status = status;
        if (featured === 'true')
            query.featured = true;
        if (minEntryFee)
            query.entryFee = { $gte: Number(minEntryFee) };
        if (maxEntryFee)
            query.entryFee = { ...query.entryFee, $lte: Number(maxEntryFee) };
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const [tournaments, total] = await Promise.all([
            tournament_model_1.default.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            tournament_model_1.default.countDocuments(query)
        ]);
        res.json({
            tournaments,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تورنمنت‌ها', error: error.message });
    }
};
exports.getTournaments = getTournaments;
// Get featured tournaments
const getFeaturedTournaments = async (req, res) => {
    try {
        const tournaments = await tournament_model_1.default.find({
            featured: true,
            status: { $in: ['registration-open', 'upcoming', 'in-progress'] }
        })
            .sort('-startDate')
            .limit(6)
            .lean();
        res.json({ tournaments });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تورنمنت‌های ویژه', error: error.message });
    }
};
exports.getFeaturedTournaments = getFeaturedTournaments;
// Get tournament by ID or slug
const getTournamentById = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await tournament_model_1.default.findOne({
            $or: [{ _id: id }, { slug: id }]
        }).lean();
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        // Get participants count and list
        const participants = await tournament_participant_model_1.default.find({
            tournamentId: tournament._id,
            paymentStatus: 'paid'
        })
            .populate('userId', 'name email')
            .lean();
        // Check if current user is registered
        let myParticipation = null;
        if (req.user) {
            myParticipation = participants.find((p) => p.userId._id.toString() === req.user.id);
        }
        res.json({
            tournament,
            participants,
            myParticipation
        });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت اطلاعات تورنمنت', error: error.message });
    }
};
exports.getTournamentById = getTournamentById;
// Create tournament (Admin only)
const createTournament = async (req, res) => {
    try {
        const tournamentData = req.body;
        // Generate slug from title
        tournamentData.slug = (0, slug_1.generateSlug)(tournamentData.title);
        tournamentData.createdBy = req.user.id;
        // Set initial status
        const now = new Date();
        const regDeadline = new Date(tournamentData.registrationDeadline);
        if (now < regDeadline) {
            tournamentData.status = 'registration-open';
        }
        else {
            tournamentData.status = 'upcoming';
        }
        const tournament = new tournament_model_1.default(tournamentData);
        await tournament.save();
        res.status(201).json({
            message: 'تورنمنت با موفقیت ایجاد شد',
            tournament
        });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در ایجاد تورنمنت', error: error.message });
    }
};
exports.createTournament = createTournament;
// Get tournament details by slug
const getTournamentDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const tournament = await tournament_model_1.default.findOne({ slug }).populate('game');
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        const participants = await tournament_participant_model_1.default.find({ tournamentId: tournament._id })
            .populate('userId')
            .select('-__v -createdAt -updatedAt');
        // If user is authenticated, include their participation status
        let myParticipation = null;
        if (req.user) {
            myParticipation = await tournament_participant_model_1.default.findOne({
                tournamentId: tournament._id,
                userId: req.user.id
            });
        }
        res.json({
            tournament,
            participants,
            myParticipation
        });
    }
    catch (error) {
        console.error('Error fetching tournament details', error);
        res.status(500).json({ message: 'خطا در دریافت جزئیات تورنمنت', error: error.message });
    }
};
exports.getTournamentDetails = getTournamentDetails;
// Update tournament (Admin only)
// Register user for a tournament (User only)
const registerForTournament = async (req, res) => {
    try {
        const { id: tournamentId } = req.params;
        const userId = req.user.id;
        const { gameTag } = req.body;
        // Verify tournament exists
        const tournament = await tournament_model_1.default.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        // Check if already registered
        const existing = await tournament_participant_model_1.default.findOne({ tournamentId, userId });
        if (existing) {
            return res.status(400).json({ message: 'شما قبلاً در این تورنمنت ثبت‌نام کرده‌اید' });
        }
        // Create participant entry
        const participant = new tournament_participant_model_1.default({
            tournamentId,
            userId,
            gameTag,
            paymentStatus: 'pending'
        });
        await participant.save();
        // Create a payment placeholder (integration later)
        const payment = new tournament_payment_model_1.default({
            tournamentId,
            userId,
            amount: tournament.entryFee,
            status: 'pending',
            method: 'manual' // placeholder
        });
        await payment.save();
        // Placeholder payment URL (to be replaced with real gateway)
        const paymentUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment/${payment._id}`;
        // Send Notifications
        const user = req.user;
        // Email
        email_service_1.emailService.sendEmail({
            to: user.email,
            subject: `ثبت‌نام در تورنمنت ${tournament.title}`,
            html: email_service_1.emailService.getRegistrationTemplate(user.name || 'کاربر', tournament.title)
        });
        // Telegram
        telegram_service_1.telegramService.sendNotification(user.id, `✅ ثبت‌نام شما در تورنمنت ${tournament.title} انجام شد.\nبرای تکمیل پرداخت به پنل کاربری مراجعه کنید.`);
        res.status(201).json({
            message: 'ثبت‌نام با موفقیت انجام شد. لطفاً پرداخت را تکمیل کنید.',
            paymentUrl,
            participantId: participant._id
        });
    }
    catch (error) {
        console.error('Error registering for tournament', error);
        res.status(500).json({ message: 'خطا در ثبت‌نام تورنمنت', error: error.message });
    }
};
exports.registerForTournament = registerForTournament;
// Update tournament (Admin only)
const updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // If title is updated, regenerate slug
        if (updates.title) {
            updates.slug = (0, slug_1.generateSlug)(updates.title);
        }
        const tournament = await tournament_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        res.json({
            message: 'تورنمنت با موفقیت بروزرسانی شد',
            tournament
        });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در بروزرسانی تورنمنت', error: error.message });
    }
};
exports.updateTournament = updateTournament;
// Delete tournament (Admin only)
const deleteTournament = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if tournament has participants
        const participantCount = await tournament_participant_model_1.default.countDocuments({
            tournamentId: id,
            paymentStatus: 'paid'
        });
        if (participantCount > 0) {
            return res.status(400).json({
                message: 'نمی‌توانید تورنمنتی با شرکت‌کننده را حذف کنید. ابتدا باید آن را لغو کنید.'
            });
        }
        const tournament = await tournament_model_1.default.findByIdAndDelete(id);
        if (!tournament) {
            return res.status(404).json({ message: 'تورنمنت یافت نشد' });
        }
        res.json({ message: 'تورنمنت با موفقیت حذف شد' });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در حذف تورنمنت', error: error.message });
    }
};
exports.deleteTournament = deleteTournament;
// Get tournament participants
const getTournamentParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const participants = await tournament_participant_model_1.default.find({
            tournamentId: id,
            paymentStatus: 'paid'
        })
            .populate('userId', 'name email gameTag')
            .sort('registeredAt')
            .lean();
        res.json({ participants });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت شرکت‌کنندگان', error: error.message });
    }
};
exports.getTournamentParticipants = getTournamentParticipants;
// Get user's tournaments
const getMyTournaments = async (req, res) => {
    try {
        const userId = req.user.id;
        const participants = await tournament_participant_model_1.default.find({
            userId,
            paymentStatus: 'paid'
        })
            .populate('tournamentId')
            .sort('-registeredAt')
            .lean();
        // Categorize tournaments
        const active = participants.filter((p) => ['registration-open', 'in-progress'].includes(p.tournamentId.status));
        const completed = participants.filter((p) => p.tournamentId.status === 'completed');
        const upcoming = participants.filter((p) => p.tournamentId.status === 'upcoming');
        res.json({
            active,
            completed,
            upcoming
        });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در دریافت تورنمنت‌های شما', error: error.message });
    }
};
exports.getMyTournaments = getMyTournaments;
// Kick participant (Admin)
const kickParticipant = async (req, res) => {
    try {
        const { id: tournamentId, userId } = req.params;
        const participant = await tournament_participant_model_1.default.findOneAndDelete({
            tournamentId,
            userId
        });
        if (!participant) {
            return res.status(404).json({ message: 'شرکت‌کننده یافت نشد' });
        }
        // Decrease currentPlayers count
        await tournament_model_1.default.findByIdAndUpdate(tournamentId, {
            $inc: { currentPlayers: -1 }
        });
        res.json({ message: 'شرکت‌کننده با موفقیت حذف شد' });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در حذف شرکت‌کننده', error: error.message });
    }
};
exports.kickParticipant = kickParticipant;
// Update participant status (Admin)
const updateParticipantStatus = async (req, res) => {
    try {
        const { id: tournamentId, userId } = req.params;
        const { paymentStatus, status } = req.body;
        const updateData = {};
        if (paymentStatus)
            updateData.paymentStatus = paymentStatus;
        if (status)
            updateData.status = status;
        const participant = await tournament_participant_model_1.default.findOneAndUpdate({ tournamentId, userId }, updateData, { new: true });
        if (!participant) {
            return res.status(404).json({ message: 'شرکت‌کننده یافت نشد' });
        }
        res.json({ message: 'وضعیت شرکت‌کننده بروزرسانی شد', participant });
    }
    catch (error) {
        res.status(500).json({ message: 'خطا در بروزرسانی وضعیت', error: error.message });
    }
};
exports.updateParticipantStatus = updateParticipantStatus;
//# sourceMappingURL=tournament.controller.js.map