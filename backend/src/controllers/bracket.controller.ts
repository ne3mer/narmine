import { Request, Response } from 'express';
import { generateSingleEliminationBracket } from '../services/bracket.service';
import Tournament from '../models/tournament.model';

export const generateBracket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if tournament exists
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    // Check if bracket already exists
    if (tournament.bracket && Object.keys(tournament.bracket).length > 0) {
      return res.status(400).json({ message: 'براکت این تورنمنت قبلاً ایجاد شده است' });
    }

    // Generate bracket
    const { bracket, matches } = await generateSingleEliminationBracket(id);

    res.json({
      message: 'براکت با موفقیت ایجاد شد',
      bracket,
      matchesCount: matches.length
    });
  } catch (error: any) {
    console.error('Error generating bracket:', error);
    res.status(500).json({ message: 'خطا در ایجاد براکت', error: error.message });
  }
};

export const getBracket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id).select('bracket');
    
    if (!tournament) {
      return res.status(404).json({ message: 'تورنمنت یافت نشد' });
    }

    res.json({ bracket: tournament.bracket });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در دریافت براکت', error: error.message });
  }
};
