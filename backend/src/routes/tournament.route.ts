import { Router } from 'express';
import { getTournaments, getFeaturedTournaments, getTournamentById, createTournament, updateTournament, deleteTournament, getTournamentParticipants, getMyTournaments, registerForTournament, kickParticipant, updateParticipantStatus } from '../controllers/tournament.controller';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public routes
router.get('/', getTournaments);
router.get('/featured', getFeaturedTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/participants', getTournamentParticipants);

// User routes (authenticated)
router.get('/my/tournaments', authenticateUser, getMyTournaments);
router.post('/:id/register', authenticateUser, registerForTournament);

// Admin routes
router.post('/', authenticateUser, adminAuth, createTournament);
router.patch('/:id', authenticateUser, adminAuth, updateTournament);
router.delete('/:id', authenticateUser, adminAuth, deleteTournament);

// Participant Management (Admin)
router.delete('/:id/participants/:userId', authenticateUser, adminAuth, kickParticipant);
router.patch('/:id/participants/:userId/status', authenticateUser, adminAuth, updateParticipantStatus);

export default router;
