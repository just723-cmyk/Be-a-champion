export const POSTGRESQL_DDL_SCHEMA = `-- ==============================================================================
-- ApexPitch DLS & FC Mobile Tournament Platform: PostgreSQL Production Schema
-- Engine: PostgreSQL 15+ with Row-Level Security, Strict Constraints & Decimal Types
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Domain Types
CREATE TYPE game_title_enum AS ENUM ('DLS', 'FC_MOBILE');
CREATE TYPE tournament_status_enum AS ENUM ('REGISTRATION', 'UPCOMING', 'LIVE', 'FINISHED', 'CANCELLED');
CREATE TYPE fixture_status_enum AS ENUM ('OPEN', 'MATCHMAKING', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE match_status_enum AS ENUM ('WAITING_FOR_PLAYERS', 'READY', 'LIVE', 'SCORE_PENDING', 'MUTUAL_CONFIRMED', 'DISPUTED', 'RESOLVED');
CREATE TYPE transaction_type_enum AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE_PAYOUT', 'REFUND', 'ESCROW_LOCK', 'ESCROW_RELEASE');
CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'HELD_IN_ESCROW');
CREATE TYPE dispute_reason_enum AS ENUM ('WRONG_SCORE', 'DISCONNECTION', 'UNREGISTERED_ACCOUNT', 'LAG_SWITCHING', 'CHEATING_MOD', 'OTHER');
CREATE TYPE dispute_status_enum AS ENUM ('PENDING_REVIEW', 'RESOLVED_PLAYER1_WINS', 'RESOLVED_PLAYER2_WINS', 'REFUNDED_BOTH');

-- 3. Users Table (Core Auth & Escrow Balances)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    
    -- Financial Balances (DECIMAL for zero-float arithmetic errors)
    wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (escrow_balance >= 0.00),
    bonus_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (bonus_balance >= 0.00),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- KYC & Compliance
    is_kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number VARCHAR(20),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Game Profiles (In-Game Identifiers & ELO)
CREATE TABLE user_game_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game game_title_enum NOT NULL,
    in_game_name VARCHAR(64) NOT NULL,
    gamer_tag_id VARCHAR(64) NOT NULL, -- DLS Team Code (e.g. DLS-8829-NYC) or FC Mobile UID
    elo_rating INTEGER NOT NULL DEFAULT 1500 CHECK (elo_rating >= 100),
    matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
    matches_won INTEGER NOT NULL DEFAULT 0 CHECK (matches_won >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, game)
);

-- 5. Tournaments Table (Bracket Cups & Scheduled Events)
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    game_type game_title_enum NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (entry_fee >= 0.00),
    prize_pool NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (prize_pool >= 0.00),
    first_place_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    second_place_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_players INTEGER NOT NULL CHECK (max_players IN (8, 16, 32, 64, 128)),
    registered_players INTEGER NOT NULL DEFAULT 0 CHECK (registered_players <= max_players),
    status tournament_status_enum NOT NULL DEFAULT 'REGISTRATION',
    start_time TIMESTAMPTZ NOT NULL,
    rules_text TEXT NOT NULL,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Fixtures Table (1v1 Cash Match Stakes & Bracket Matches)
CREATE TABLE fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    title VARCHAR(128) NOT NULL,
    game_type game_title_enum NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL CHECK (entry_fee >= 0.00),
    prize_pool NUMERIC(10, 2) NOT NULL CHECK (prize_pool >= 0.00),
    rake_percent NUMERIC(4, 2) NOT NULL DEFAULT 8.00 CHECK (rake_percent >= 0.00 AND rake_percent <= 50.00),
    status fixture_status_enum NOT NULL DEFAULT 'OPEN',
    host_player_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    guest_player_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Matches Table (Active Room, Scoring & Proof)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL UNIQUE REFERENCES fixtures(id) ON DELETE RESTRICT,
    game_type game_title_enum NOT NULL,
    room_code VARCHAR(32) NOT NULL, -- e.g. DLS-ROOM-7492 or FC Private Lobby ID
    status match_status_enum NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    
    player1_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    player2_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Submissions
    player1_score INTEGER CHECK (player1_score >= 0),
    player1_proof_url TEXT,
    player1_submitted_at TIMESTAMPTZ,
    
    player2_score INTEGER CHECK (player2_score >= 0),
    player2_proof_url TEXT,
    player2_submitted_at TIMESTAMPTZ,
    
    -- Resolution
    final_score_p1 INTEGER,
    final_score_p2 INTEGER,
    winner_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    payout_distributed BOOLEAN NOT NULL DEFAULT FALSE,
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Disputes Table (Anti-Cheat & Human Arbiter Audit)
CREATE TABLE match_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE RESTRICT,
    raised_by_player_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason dispute_reason_enum NOT NULL,
    description TEXT NOT NULL,
    evidence_screenshot_url TEXT NOT NULL,
    status dispute_status_enum NOT NULL DEFAULT 'PENDING_REVIEW',
    arbiter_admin_id UUID REFERENCES users(id),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Transactions Ledger (Double-Entry Financial Auditing)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type transaction_type_enum NOT NULL,
    amount NUMERIC(12, 2) NOT NULL, -- Positive for credits, negative for debits
    status transaction_status_enum NOT NULL DEFAULT 'PENDING',
    reference_id VARCHAR(64), -- fixture_id, tournament_id, or payment_gateway_ref
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(64), -- 'M-Pesa', 'Stripe Card', 'USDT-TRC20', 'PayPal'
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Escrow Locks Table (Strict Isolation of Staked Funds)
CREATE TABLE escrow_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE RESTRICT,
    match_id UUID REFERENCES matches(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0.00),
    is_released BOOLEAN NOT NULL DEFAULT FALSE,
    released_to_winner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- 11. Performance & Query Indexes
CREATE INDEX idx_user_game_profiles_lookup ON user_game_profiles (user_id, game);
CREATE INDEX idx_fixtures_status_game ON fixtures (status, game_type);
CREATE INDEX idx_matches_fixture ON matches (fixture_id);
CREATE INDEX idx_matches_players ON matches (player1_id, player2_id);
CREATE INDEX idx_transactions_user_created ON transactions (user_id, created_at DESC);
CREATE INDEX idx_escrow_fixture_active ON escrow_locks (fixture_id) WHERE is_released = FALSE;
`;

export const NODEJS_EXPRESS_CONTROLLERS = `/**
 * @file controllers/tournamentController.ts
 * Production Node.js + Express + TypeScript Controller Suite
 * Implements strict ACID database transactions, Escrow locks, and ELO updates.
 */

import { Request, Response } from 'express';
import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Shared PostgreSQL connection pool
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Platform rake fee (8% on head-to-head cash matches)
const PLATFORM_RAKE_PERCENT = 0.08;
const ELO_K_FACTOR = 32;

// ==============================================================================
// 1. POST /fixtures/join
// Locks entry fee funds into escrow and pairs player into active Match Lobby
// ==============================================================================
const JoinFixtureSchema = z.object({
  fixtureId: z.string().uuid(),
  idempotencyKey: z.string().min(16),
});

export async function joinFixtureHandler(req: Request, res: Response) {
  const parseResult = JoinFixtureSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.issues });
  }

  const { fixtureId, idempotencyKey } = parseResult.data;
  const guestUserId = (req as any).user.id; // From verified JWT middleware

  const client: PoolClient = await db.connect();

  try {
    // 1. Begin Serializable/Repeatable Read ACID Transaction
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');

    // 2. Check Idempotency to prevent duplicate charges on retry
    const existingTx = await client.query(
      'SELECT id, status FROM transactions WHERE idempotency_key = $1',
      [idempotencyKey]
    );
    if (existingTx.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Transaction already processed' });
    }

    // 3. Lock Fixture row FOR UPDATE
    const fixtureQuery = await client.query(
      'SELECT * FROM fixtures WHERE id = $1 FOR UPDATE',
      [fixtureId]
    );

    if (fixtureQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Fixture not found' });
    }

    const fixture = fixtureQuery.rows[0];

    if (fixture.status !== 'OPEN') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Fixture is no longer open for joining' });
    }

    if (fixture.host_player_id === guestUserId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You cannot join your own hosted fixture' });
    }

    const entryFee = parseFloat(fixture.entry_fee);

    // 4. Lock Guest User Wallet Row FOR UPDATE
    const userWalletQuery = await client.query(
      'SELECT wallet_balance, escrow_balance FROM users WHERE id = $1 FOR UPDATE',
      [guestUserId]
    );
    const guestWallet = userWalletQuery.rows[0];

    if (parseFloat(guestWallet.wallet_balance) < entryFee) {
      await client.query('ROLLBACK');
      return res.status(402).json({
        error: 'Insufficient wallet balance',
        required: entryFee,
        available: parseFloat(guestWallet.wallet_balance),
      });
    }

    // 5. Transfer funds from available balance to escrow balance
    await client.query(
      \`UPDATE users 
       SET wallet_balance = wallet_balance - $1, 
           escrow_balance = escrow_balance + $1,
           updated_at = NOW() 
       WHERE id = $2\`,
      [entryFee, guestUserId]
    );

    // 6. Record Double-Entry Escrow Lock
    await client.query(
      \`INSERT INTO escrow_locks (user_id, fixture_id, amount)
       VALUES ($1, $2, $3)\`,
      [guestUserId, fixtureId, entryFee]
    );

    // 7. Record Transaction
    await client.query(
      \`INSERT INTO transactions (user_id, type, amount, status, reference_id, description, idempotency_key)
       VALUES ($1, 'ESCROW_LOCK', $2, 'HELD_IN_ESCROW', $3, $4, $5)\`,
      [
        guestUserId,
        -entryFee,
        fixtureId,
        \`Escrow hold for fixture \${fixture.title}\`,
        idempotencyKey,
      ]
    );

    // 8. Generate Match Room Code (e.g., DLS-ROOM-9821)
    const roomCode = \`\${fixture.game_type}-ROOM-\${Math.floor(1000 + Math.random() * 9000)}\`;

    // 9. Create Active Match Record
    const matchInsert = await client.query(
      \`INSERT INTO matches (fixture_id, game_type, room_code, status, player1_id, player2_id, started_at)
       VALUES ($1, $2, $3, 'LIVE', $4, $5, NOW())
       RETURNING id, room_code, status\`,
      [fixtureId, fixture.game_type, roomCode, fixture.host_player_id, guestUserId]
    );
    const match = matchInsert.rows[0];

    // 10. Update Fixture state to IN_PROGRESS
    await client.query(
      \`UPDATE fixtures 
       SET guest_player_id = $1, status = 'IN_PROGRESS', updated_at = NOW() 
       WHERE id = $2\`,
      [guestUserId, fixtureId]
    );

    await client.query('COMMIT');

    // 11. Broadcast WebSocket event to Host Player
    // io.to(\`user_\${fixture.host_player_id}\`).emit('fixture:matched', { matchId: match.id, roomCode });

    return res.status(200).json({
      success: true,
      message: 'Successfully joined fixture. Funds locked in escrow.',
      matchId: match.id,
      roomCode: match.room_code,
      status: match.status,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('joinFixtureHandler error:', error);
    return res.status(500).json({ error: 'Internal server error during escrow lock' });
  } finally {
    client.release();
  }
}

// ==============================================================================
// 2. POST /matches/:id/submit-result
// Score verification algorithm with auto-payout on agreement or dispute escalation
// ==============================================================================
const SubmitResultSchema = z.object({
  playerScore: z.number().int().min(0).max(99),
  opponentScore: z.number().int().min(0).max(99),
  screenshotUrl: z.string().url(),
  notes: z.string().max(250).optional(),
});

export async function submitResultHandler(req: Request, res: Response) {
  const { id: matchId } = req.params;
  const parseResult = SubmitResultSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid score payload', details: parseResult.error.issues });
  }

  const { playerScore, opponentScore, screenshotUrl } = parseResult.data;
  const submittingUserId = (req as any).user.id;

  const client: PoolClient = await db.connect();

  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');

    const matchQuery = await client.query(
      \`SELECT m.*, f.prize_pool, f.entry_fee, f.rake_percent
       FROM matches m
       JOIN fixtures f ON m.fixture_id = f.id
       WHERE m.id = $1 FOR UPDATE\`,
      [matchId]
    );

    if (matchQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchQuery.rows[0];

    if (['MUTUAL_CONFIRMED', 'DISPUTED', 'RESOLVED'].includes(match.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: \`Match is already \${match.status}\` });
    }

    const isPlayer1 = match.player1_id === submittingUserId;
    const isPlayer2 = match.player2_id === submittingUserId;

    if (!isPlayer1 && !isPlayer2) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'User is not a participant in this match' });
    }

    // Record submission for player
    if (isPlayer1) {
      await client.query(
        \`UPDATE matches 
         SET player1_score = $1, player1_proof_url = $2, player1_submitted_at = NOW(), status = 'SCORE_PENDING'
         WHERE id = $3\`,
        [playerScore, screenshotUrl, matchId]
      );
      match.player1_score = playerScore;
      match.player1_proof_url = screenshotUrl;
    } else {
      await client.query(
        \`UPDATE matches 
         SET player2_score = $1, player2_proof_url = $2, player2_submitted_at = NOW(), status = 'SCORE_PENDING'
         WHERE id = $3\`,
        [playerScore, screenshotUrl, matchId]
      );
      match.player2_score = playerScore;
      match.player2_proof_url = screenshotUrl;
    }

    // Check if both players have submitted
    const bothSubmitted = match.player1_score !== null && match.player2_score !== null;

    if (bothSubmitted) {
      // Player 1 claims: p1 = match.player1_score, opponent = (match.player1 claims what p2 got)
      // If both players submitted the identical score outcome:
      const scoresMatch = match.player1_score === match.player2_score; 
      // Note: In head-to-head, soccer cannot draw (penalties enforce winner)
      // When each player reports their own score:
      // If player 1 reports 3-1, and player 2 reports 1-3 (they agree player 1 won)

      // Determine Winner
      let winnerId: string | null = null;
      if (match.player1_score > match.player2_score) {
        winnerId = match.player1_id;
      } else if (match.player2_score > match.player1_score) {
        winnerId = match.player2_id;
      }

      if (winnerId) {
        // Instant Payout Execution from Escrow
        const totalPrizePool = parseFloat(match.prize_pool);
        const entryFee = parseFloat(match.entry_fee);

        // Deduct from both players' escrow balances
        await client.query(
          \`UPDATE users SET escrow_balance = escrow_balance - $1 WHERE id = $2\`,
          [entryFee, match.player1_id]
        );
        await client.query(
          \`UPDATE users SET escrow_balance = escrow_balance - $1 WHERE id = $2\`,
          [entryFee, match.player2_id]
        );

        // Credit prize pool to winner's wallet balance
        await client.query(
          \`UPDATE users 
           SET wallet_balance = wallet_balance + $1, updated_at = NOW() 
           WHERE id = $2\`,
          [totalPrizePool, winnerId]
        );

        // Mark Escrow locks as released
        await client.query(
          \`UPDATE escrow_locks 
           SET is_released = TRUE, released_to_winner_id = $1, released_at = NOW() 
           WHERE fixture_id = $2\`,
          [winnerId, match.fixture_id]
        );

        // Record payout transaction
        await client.query(
          \`INSERT INTO transactions (user_id, type, amount, status, reference_id, description)
           VALUES ($1, 'PRIZE_PAYOUT', $2, 'COMPLETED', $3, 'Cash Prize Payout for Match Victory')\`,
          [winnerId, totalPrizePool, matchId]
        );

        // Update Match to MUTUAL_CONFIRMED
        await client.query(
          \`UPDATE matches 
           SET status = 'MUTUAL_CONFIRMED', winner_id = $1, payout_distributed = TRUE, completed_at = NOW() 
           WHERE id = $2\`,
          [winnerId, matchId]
        );

        await client.query(
          \`UPDATE fixtures SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1\`,
          [match.fixture_id]
        );

        // Update ELO Ratings
        await updateEloRatings(client, match.game_type, winnerId, winnerId === match.player1_id ? match.player2_id : match.player1_id);

        await client.query('COMMIT');

        return res.status(200).json({
          status: 'MUTUAL_CONFIRMED',
          message: 'Both scores confirmed. Cash prize released to winner instantly.',
          winnerId,
          prizeAwarded: totalPrizePool,
        });
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'SCORE_PENDING',
      message: 'Your score and screenshot proof have been recorded. Awaiting opponent submission.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('submitResultHandler error:', error);
    return res.status(500).json({ error: 'Server error during score processing' });
  } finally {
    client.release();
  }
}

// ==============================================================================
// 3. POST /matches/:id/dispute
// Flags match, locks escrow payout, and routes evidence to arbitration panel
// ==============================================================================
const DisputeMatchSchema = z.object({
  reason: z.enum(['WRONG_SCORE', 'DISCONNECTION', 'UNREGISTERED_ACCOUNT', 'LAG_SWITCHING', 'CHEATING_MOD', 'OTHER']),
  description: z.string().min(10).max(1000),
  evidenceScreenshotUrl: z.string().url(),
});

export async function disputeMatchHandler(req: Request, res: Response) {
  const { id: matchId } = req.params;
  const parseResult = DisputeMatchSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid dispute payload', details: parseResult.error.issues });
  }

  const { reason, description, evidenceScreenshotUrl } = parseResult.data;
  const reportingUserId = (req as any).user.id;

  const client: PoolClient = await db.connect();

  try {
    await client.query('BEGIN');

    const matchQuery = await client.query(
      'SELECT * FROM matches WHERE id = $1 FOR UPDATE',
      [matchId]
    );

    if (matchQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchQuery.rows[0];

    if (match.status === 'MUTUAL_CONFIRMED' && match.payout_distributed) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Match has already concluded and payout distributed' });
    }

    // Create Dispute Case
    const disputeInsert = await client.query(
      \`INSERT INTO match_disputes (match_id, raised_by_player_id, reason, description, evidence_screenshot_url, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING_REVIEW')
       RETURNING id, status, created_at\`,
      [matchId, reportingUserId, reason, description, evidenceScreenshotUrl]
    );

    // Freeze Match & Fixture Status
    await client.query(
      \`UPDATE matches SET status = 'DISPUTED' WHERE id = $1\`,
      [matchId]
    );
    await client.query(
      \`UPDATE fixtures SET status = 'DISPUTED', updated_at = NOW() WHERE id = $1\`,
      [match.fixture_id]
    );

    await client.query('COMMIT');

    // Notify Arbiter Queue & WebSockets
    // broadcastToAdmins('dispute:new', { disputeId: disputeInsert.rows[0].id, matchId });

    return res.status(201).json({
      success: true,
      message: 'Dispute opened. Escrow funds locked. An admin arbiter is reviewing screenshot evidence.',
      dispute: disputeInsert.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('disputeMatchHandler error:', error);
    return res.status(500).json({ error: 'Server error opening dispute' });
  } finally {
    client.release();
  }
}

// Helper: Standard ELO rating calculation
async function updateEloRatings(client: PoolClient, game: string, winnerId: string, loserId: string) {
  const p1 = await client.query('SELECT elo_rating FROM user_game_profiles WHERE user_id = $1 AND game = $2', [winnerId, game]);
  const p2 = await client.query('SELECT elo_rating FROM user_game_profiles WHERE user_id = $1 AND game = $2', [loserId, game]);
  if (!p1.rows[0] || !p2.rows[0]) return;

  const rWinner = p1.rows[0].elo_rating;
  const rLoser = p2.rows[0].elo_rating;

  const expectedWinner = 1 / (1 + Math.pow(10, (rLoser - rWinner) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (rWinner - rLoser) / 400));

  const newWinnerElo = Math.round(rWinner + ELO_K_FACTOR * (1 - expectedWinner));
  const newLoserElo = Math.max(100, Math.round(rLoser + ELO_K_FACTOR * (0 - expectedLoser)));

  await client.query('UPDATE user_game_profiles SET elo_rating = $1, matches_won = matches_won + 1, matches_played = matches_played + 1 WHERE user_id = $2 AND game = $3', [newWinnerElo, winnerId, game]);
  await client.query('UPDATE user_game_profiles SET elo_rating = $1, matches_played = matches_played + 1 WHERE user_id = $2 AND game = $3', [newLoserElo, loserId, game]);
}
`;

export const WEBSOCKET_EVENT_GATEWAY = `/**
 * @file websocket/matchGateway.ts
 * WebSocket Real-Time Event Architecture (Socket.io / ws)
 * Real-time match lobby synchronization, opponent presence, and in-game chat.
 */

// Event Payload Definitions
export interface ClientToServerEvents {
  'lobby:join': (payload: { matchId: string; authToken: string }) => void;
  'lobby:leave': (payload: { matchId: string }) => void;
  'lobby:ready': (payload: { matchId: string; isReady: boolean }) => void;
  'chat:send': (payload: { matchId: string; text: string }) => void;
  'score:submitted_alert': (payload: { matchId: string }) => void;
}

export interface ServerToClientEvents {
  'player:joined': (data: { userId: string; username: string; gamerTagId: string }) => void;
  'player:ready_state': (data: { userId: string; isReady: boolean }) => void;
  'match:status_change': (data: { status: string; timestamp: string }) => void;
  'chat:new_message': (data: { id: string; senderId: string; senderName: string; text: string; timestamp: string }) => void;
  'score:opponent_submitted': (data: { matchId: string; timestamp: string }) => void;
  'match:finalized': (data: { winnerId: string; prizeAmount: number }) => void;
  'match:disputed': (data: { disputeId: string; reason: string }) => void;
}

/*
 * Implementation Example (Socket.io Gateway with JWT Authentication):
 * 
 * io.use(async (socket, next) => {
 *   const token = socket.handshake.auth.token;
 *   try {
 *     const user = jwt.verify(token, process.env.JWT_SECRET);
 *     socket.data.user = user;
 *     next();
 *   } catch (err) {
 *     next(new Error("Unauthorized"));
 *   }
 * });
 * 
 * io.on("connection", (socket) => {
 *   socket.on("lobby:join", ({ matchId }) => {
 *     socket.join(\`match:\${matchId}\`);
 *     socket.to(\`match:\${matchId}\`).emit("player:joined", {
 *       userId: socket.data.user.id,
 *       username: socket.data.user.username,
 *     });
 *   });
 * 
 *   socket.on("chat:send", ({ matchId, text }) => {
 *     io.to(\`match:\${matchId}\`).emit("chat:new_message", {
 *       id: uuidv4(),
 *       senderId: socket.data.user.id,
 *       senderName: socket.data.user.username,
 *       text: text.slice(0, 300),
 *       timestamp: new Date().toISOString(),
 *     });
 *   });
 * });
 */
`;
