
import { Request, Response } from 'express';
import Tournament from '../models/tournament.model';
import TournamentParticipant from '../models/tournament-participant.model';
import TournamentPayment from '../models/tournament-payment.model';
import { emailService } from '../services/email.service';
import { telegramService } from '../services/telegram.service';
import { generateSlug } from '../utils/slug';

// Get all tournaments with filters
export const getTournaments = async (req: Request, res: Response) => {
  try {
    const {
      game,
      type,
      status,
      featured,
      minEntryFee,
      maxEntryFee,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (game) query['game.name'] = new RegExp(game as string, 'i');
    if (type) query.type = type;
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (minEntryFee) query.entryFee = { $gte: Number(minEntryFee) };
    if (maxEntryFee) query.entryFee = { ...query.entryFee, $lte: Number(maxEntryFee) };
    if (search) {
      query.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [tournaments, total] = await Promise.all([
      Tournament.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Tournament.countDocuments(query)
    ]);

    res.json({
      tournaments,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت تورنمنت‌ها', error: error.message });
  }
};

// Get featured tournaments
export const getFeaturedTournaments = async (req: Request, res: Response) => {
  try {
    const tournaments = await Tournament.find({
      featured: true,
      status: { $in: ['registration-open', 'upcoming', 'in-progress'] }
    })
      .sort('-startDate')
      .limit(6)
      .lean();

    res.json({ tournaments });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت تورنمنت‌های ویژه', error: error.message });
  }
};

// Get tournament by ID or slug
export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findOne({
      $or: [{ _id: id }, { slug: id }]
    }).lean();

    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    // Get participants count and list
    const participants = await TournamentParticipant.find({
      tournamentId: tournament._id,
      paymentStatus: 'paid'
    })
      .populate('userId', 'name email')
      .lean();

    // Check if current user is registered
    let myParticipation = null;
    if (req.user) {
      myParticipation = participants.find(
        (p: any) => p.userId._id.toString() === req.user!.id
      );
    }

    res.json({
      tournament,
      participants,
      myParticipation
    });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت اطلاعات تورنمنت', error: error.message });
  }
};

// Create tournament (Admin only)
export const createTournament = async (req: Request, res: Response) => {
  try {
    const tournamentData = req.body;
    
    // Generate slug from title
    tournamentData.slug = generateSlug(tournamentData.title);
    tournamentData.createdBy = req.user!.id;

    // Set initial status
    const now = new Date();
    const regDeadline = new Date(tournamentData.registrationDeadline);
    
    if (now < regDeadline) {
      tournamentData.status = 'registration-open';
    } else {
      tournamentData.status = 'upcoming';
    }

    const tournament = new Tournament(tournamentData);
    await tournament.save();

    res.status(201).json({
      message: 'تورنمنت با موفقیت ایجاد شد',
      tournament
    });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در ایجاد تورنمنت', error: error.message });
  }
};

// Get tournament details by slug
export const getTournamentDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tournament = await Tournament.findOne({ slug }).populate('game');
    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }
    const participants = await TournamentParticipant.find({ tournamentId: tournament._id })
      .populate('userId')
      .select('-__v -createdAt -updatedAt');

    // If user is authenticated, include their participation status
    let myParticipation = null;
    if (req.user) {
      myParticipation = await TournamentParticipant.findOne({
        tournamentId: tournament._id,
        userId: req.user.id
      });
    }

    res.json({
      tournament,
      participants,
      myParticipation
    });
  } catch (error: any) {
    console.error('Error fetching tournament details', error);
    res.status(500).json({ message: 'خطا در دریافت جزئیات تورنمنت', error: error.message });
  }
};

// Update tournament (Admin only)
// Register user for a tournament (User only)
export const registerForTournament = async (req: Request, res: Response) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user!.id;
    const { gameTag } = req.body;

    // Verify tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    // Check if already registered
    const existing = await TournamentParticipant.findOne({ tournamentId, userId });
    if (existing) {
      return res.status(400).json({ message: 'شما قبلاً در این تورنمنت ثبت‌نام کرده‌اید' });
    }

    // Create participant entry
    const participant = new TournamentParticipant({
      tournamentId,
      userId,
      gameTag,
      paymentStatus: 'pending'
    });
    await participant.save();

    // Create a payment placeholder (integration later)
    const payment = new TournamentPayment({
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
    const user = req.user!;
    
    // Email
    emailService.sendEmail({
      to: user.email,
      subject: `ثبت‌نام در تورنمنت ${tournament.title}`,
      html: emailService.getRegistrationTemplate((user as any).name || 'کاربر', tournament.title)
    });

    // Telegram
    telegramService.sendNotification(
      user.id,
      `✅ ثبت‌نام شما در تورنمنت ${tournament.title} انجام شد.\nبرای تکمیل پرداخت به پنل کاربری مراجعه کنید.`
    );

    res.status(201).json({
      message: 'ثبت‌نام با موفقیت انجام شد. لطفاً پرداخت را تکمیل کنید.',
      paymentUrl,
      participantId: participant._id
    });
  } catch (error: any) {
    console.error('Error registering for tournament', error);
    res.status(500).json({ message: 'خطا در ثبت‌نام تورنمنت', error: error.message });
  }
};

// Update tournament (Admin only)
export const updateTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If title is updated, regenerate slug
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    const tournament = await Tournament.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    res.json({
      message: 'تورنمنت با موفقیت بروزرسانی شد',
      tournament
    });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در بروزرسانی تورنمنت', error: error.message });
  }
};

// Delete tournament (Admin only)
export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tournament has participants
    const participantCount = await TournamentParticipant.countDocuments({
      tournamentId: id,
      paymentStatus: 'paid'
    });

    if (participantCount > 0) {
      return res.status(400).json({
        message: 'نمی‌توانید تورنمنتی با شرکت‌کننده را حذف کنید. ابتدا باید آن را لغو کنید.'
      });
    }

    const tournament = await Tournament.findByIdAndDelete(id);

    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    res.json({ message: 'تورنمنت با موفقیت حذف شد' });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در حذف تورنمنت', error: error.message });
  }
};

// Get tournament participants
export const getTournamentParticipants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const participants = await TournamentParticipant.find({
      tournamentId: id,
      paymentStatus: 'paid'
    })
      .populate('userId', 'name email gameTag')
      .sort('registeredAt')
      .lean();

    res.json({ participants });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت شرکت‌کنندگان', error: error.message });
  }
};

// Get user's tournaments
export const getMyTournaments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const participants = await TournamentParticipant.find({
      userId,
      paymentStatus: 'paid'
    })
      .populate('tournamentId')
      .sort('-registeredAt')
      .lean();

    // Categorize tournaments
    const active = participants.filter((p: any) =>
      ['registration-open', 'in-progress'].includes(p.tournamentId.status)
    );
    const completed = participants.filter((p: any) =>
      p.tournamentId.status === 'completed'
    );
    const upcoming = participants.filter((p: any) =>
      p.tournamentId.status === 'upcoming'
    );

    res.json({
      active,
      completed,
      upcoming
    });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت تورنمنت‌های شما', error: error.message });
  }
};

// Kick participant (Admin)
export const kickParticipant = async (req: Request, res: Response) => {
  try {
    const { id: tournamentId, userId } = req.params;

    const participant = await TournamentParticipant.findOneAndDelete({
      tournamentId,
      userId
    });

    if (!participant) {
      return res.status(404).json({ message: 'شرکت‌کننده یافت نشد' });
    }

    // Decrease currentPlayers count
    await Tournament.findByIdAndUpdate(tournamentId, {
      $inc: { currentPlayers: -1 }
    });

    res.json({ message: 'شرکت‌کننده با موفقیت حذف شد' });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در حذف شرکت‌کننده', error: error.message });
  }
};

// Update participant status (Admin)
export const updateParticipantStatus = async (req: Request, res: Response) => {
  try {
    const { id: tournamentId, userId } = req.params;
    const { paymentStatus, status } = req.body;

    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (status) updateData.status = status;

    const participant = await TournamentParticipant.findOneAndUpdate(
      { tournamentId, userId },
      updateData,
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'شرکت‌کننده یافت نشد' });
    }

    res.json({ message: 'وضعیت شرکت‌کننده بروزرسانی شد', participant });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در بروزرسانی وضعیت', error: error.message });
  }
};
