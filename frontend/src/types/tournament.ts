// Tournament System Types

export type TournamentType = 'solo' | 'duo' | '1v1' | 'squad' | 'kill-race';
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'battle-royale';
export type TournamentStatus = 'upcoming' | 'registration-open' | 'registration-closed' | 'in-progress' | 'completed' | 'cancelled';
export type ParticipantStatus = 'registered' | 'active' | 'eliminated' | 'winner' | 'disqualified';
export type MatchStatus = 'scheduled' | 'in-progress' | 'completed' | 'disputed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PrizeStatus = 'none' | 'pending' | 'paid';
export type PayoutMethod = 'bank-transfer' | 'wallet' | 'crypto';

export interface Tournament {
  _id: string;
  title: string;
  slug: string;
  description: string;
  game: {
    name: string;
    platform: string;
    image: string;
  };
  type: TournamentType;
  format: TournamentFormat;
  entryFee: number;
  prizePool: {
    total: number;
    distribution: {
      first: number;
      second?: number;
      third?: number;
      fourth?: number;
      [key: string]: number | undefined;
    };
  };
  maxPlayers: number;
  currentPlayers: number;
  startDate: string;
  endDate?: string;
  registrationDeadline: string;
  status: TournamentStatus;
  rules: string[];
  requirements: {
    psnId: boolean;
    activisionId: boolean;
    epicId: boolean;
    minLevel?: number;
  };
  banner: string;
  featured: boolean;
  bracket?: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  isRegistrationOpen?: boolean;
  isFull?: boolean;
}

export interface TournamentParticipant {
  _id: string;
  tournamentId: string;
  userId: string;
  gameTag: {
    psn?: string;
    activision?: string;
    epic?: string;
  };
  paymentId: string;
  paymentStatus: PaymentStatus;
  registeredAt: string;
  status: ParticipantStatus;
  currentRound: number;
  matchHistory: Array<{
    matchId: string;
    round: number;
    opponent: string;
    result: 'win' | 'loss' | 'pending';
    score: number;
  }>;
  finalPlacement?: number;
  prizeWon: number;
  prizeStatus: PrizeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  _id: string;
  tournamentId: string;
  round: number;
  roundName: string;
  player1: string | User;
  player2?: string | User;
  winner?: string | User;
  status: MatchStatus;
  lobbyCode?: string;
  startTime: string;
  results: Array<{
    playerId: string;
    score: number;
    screenshot?: string;
    submittedAt: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  }>;
  dispute?: {
    reportedBy: string;
    reason: string;
    evidence: string[];
    status: 'open' | 'resolved';
    resolution?: string;
    resolvedBy?: string;
    resolvedAt?: string;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentPayment {
  _id: string;
  userId: string;
  tournamentId: string;
  amount: number;
  gateway: string;
  transactionId?: string;
  authority: string;
  refId?: string;
  status: PaymentStatus;
  metadata?: {
    cardPan?: string;
    cardHash?: string;
    feeType?: string;
    fee?: number;
  };
  createdAt: string;
  verifiedAt?: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface PrizePayout {
  _id: string;
  tournamentId: string;
  userId: string;
  participantId: string;
  placement: number;
  amount: number;
  method: PayoutMethod;
  bankInfo?: {
    accountNumber?: string;
    cardNumber?: string;
    iban?: string;
    accountHolder: string;
  };
  walletAddress?: string;
  status: 'pending' | 'requested' | 'processing' | 'paid' | 'failed' | 'cancelled';
  requestedAt?: string;
  paidAt?: string;
  transactionRef?: string;
  adminNotes?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended User type for tournament features
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  telegram?: string;
  role: 'user' | 'admin';
  gameTag?: {
    psn?: string;
    activision?: string;
    epic?: string;
  };
  telegramChatId?: string;
  bankInfo?: {
    accountNumber?: string;
    cardNumber?: string;
    iban?: string;
    accountHolder?: string;
  };
  walletBalance: number;
  banned?: {
    status: boolean;
    reason?: string;
    until?: string;
    permanent: boolean;
  };
  warnings: Array<{
    reason: string;
    date: string;
    tournamentId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface TournamentsResponse {
  tournaments: Tournament[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MyTournamentsResponse {
  active: Array<Tournament & { participant: TournamentParticipant }>;
  completed: Array<Tournament & { participant: TournamentParticipant }>;
  upcoming: Array<Tournament & { participant: TournamentParticipant }>;
}

export interface TournamentDetailsResponse {
  tournament: Tournament;
  participants: TournamentParticipant[];
  myParticipation?: TournamentParticipant;
  upcomingMatch?: Match;
}

export interface BracketNode {
  id: string;
  round: number;
  roundName: string;
  matchId: string;
  player1?: User | { name: string }; // Allow placeholder objects
  player2?: User | { name: string };
  winner?: User | { name: string };
  children?: BracketNode[];
}

// Form Types
export interface TournamentRegistrationForm {
  gameTag: {
    psn?: string;
    activision?: string;
    epic?: string;
  };
  phone: string;
  email: string;
  acceptTerms: boolean;
  joinTelegram?: boolean;
}

export interface MatchResultSubmission {
  matchId: string;
  score: number;
  screenshot: File;
  result: 'win' | 'loss';
  comments?: string;
}

export interface PrizePayoutRequest {
  method: PayoutMethod;
  bankInfo?: {
    accountNumber?: string;
    cardNumber?: string;
    iban?: string;
    accountHolder: string;
  };
  walletAddress?: string;
}

// Filter Types
export interface TournamentFilters {
  game?: string;
  type?: TournamentType;
  status?: TournamentStatus;
  minEntryFee?: number;
  maxEntryFee?: number;
  featured?: boolean;
  search?: string;
}
