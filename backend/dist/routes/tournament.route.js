"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournament_controller_1 = require("../controllers/tournament.controller");
const authenticateUser_1 = require("../middleware/authenticateUser");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', tournament_controller_1.getTournaments);
router.get('/featured', tournament_controller_1.getFeaturedTournaments);
router.get('/:id', tournament_controller_1.getTournamentById);
router.get('/:id/participants', tournament_controller_1.getTournamentParticipants);
// User routes (authenticated)
router.get('/my/tournaments', authenticateUser_1.authenticateUser, tournament_controller_1.getMyTournaments);
router.post('/:id/register', authenticateUser_1.authenticateUser, tournament_controller_1.registerForTournament);
// Admin routes
router.post('/', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, tournament_controller_1.createTournament);
router.patch('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, tournament_controller_1.updateTournament);
router.delete('/:id', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, tournament_controller_1.deleteTournament);
// Participant Management (Admin)
router.delete('/:id/participants/:userId', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, tournament_controller_1.kickParticipant);
router.patch('/:id/participants/:userId/status', authenticateUser_1.authenticateUser, adminAuth_1.adminAuth, tournament_controller_1.updateParticipantStatus);
exports.default = router;
//# sourceMappingURL=tournament.route.js.map