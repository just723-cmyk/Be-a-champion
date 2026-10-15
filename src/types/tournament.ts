export type GameType = 'DLS' | 'FC_MOBILE';

export type FixtureStatus = 'OPEN' | 'MATCHMAKING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';

export type TournamentStatus = 'REGISTRATION' | 'UPCOMING' | 'LIVE' | 'FINISHED';

export type MatchStatus = 'WAITING_FOR_PLAYERS' | 'READY' | 'LIVE' | 'SCORE_PENDING' | 'MUTUAL_CONFIRMED' | 'DISPUTED' | 'RESOLVED';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE_PAYOUT' | 'REFUND' | 'ESCROW_LOCK' | 'ESCROW_RELEASE';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'HELD_IN_ESCROW';

export interface UserGameProfile {
  game: GameType;
  inGameName: string;
  gamerTagId: string; // e.g., DLS Team Code or FC Mobile UID
  eloRating: number;
  matchesPlayed: number;
  matchesWon: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  walletBalance: number;
  escrowBalance: number;
  bonusBalance: number;
  currency: string;
  isKycVerified: boolean;
  gameProfiles: Record<GameType, UserGameProfile>;
  createdAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  gameType: GameType;
  entryFee: number;
  prizePool: number;
  firstPlacePrize: number;
  secondPlacePrize: number;
  maxPlayers: number;
  registeredPlayers: number;
  status: TournamentStatus;
  startTime: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'SWISS';
  rules: string[];
  bannerUrl?: string;
}

export interface Fixture {
  id: string;
  title: string;
  gameType: GameType;
  entryFee: number;
  prizePool: number; // e.g. 2 x entryFee - 8% platform fee
  rakePercent: number; // e.g. 8%
  status: FixtureStatus;
  scheduledTime: string;
  hostPlayerId: string;
  hostPlayerName: string;
  hostPlayerAvatar: string;
  hostPlayerElo: number;
  guestPlayerId?: string;
  guestPlayerName?: string;
  guestPlayerAvatar?: string;
  guestPlayerElo?: number;
  matchId?: string;
}

export interface PlayerScoreSubmission {
  playerId: string;
  playerScore: number;
  opponentScore: number;
  screenshotUrl: string;
  submittedAt: string;
  notes?: string;
}

export interface MatchDispute {
  id: string;
  matchId: string;
  raisedByPlayerId: string;
  reason: 'WRONG_SCORE' | 'DISCONNECTION' | 'UNREGISTERED_ACCOUNT' | 'LAG_SWITCHING' | 'CHEATING_MOD' | 'OTHER';
  description: string;
  evidenceScreenshotUrl: string;
  createdAt: string;
  status: 'PENDING_REVIEW' | 'RESOLVED_PLAYER1_WINS' | 'RESOLVED_PLAYER2_WINS' | 'REFUNDED_BOTH';
  adminNotes?: string;
}

export interface Match {
  id: string;
  fixtureId: string;
  gameType: GameType;
  roomCode: string;
  status: MatchStatus;
  entryFee: number;
  prizePool: number;
  player1: {
    id: string;
    username: string;
    inGameName: string;
    gamerTagId: string;
    avatarUrl: string;
    elo: number;
  };
  player2: {
    id: string;
    username: string;
    inGameName: string;
    gamerTagId: string;
    avatarUrl: string;
    elo: number;
  };
  player1Submission?: PlayerScoreSubmission;
  player2Submission?: PlayerScoreSubmission;
  finalScore?: {
    player1: number;
    player2: number;
  };
  winnerId?: string;
  dispute?: MatchDispute;
  startedAt?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  referenceId?: string; // fixture_id or withdrawal_id
  description: string;
  paymentMethod?: string;
  createdAt: string;
}
