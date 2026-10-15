import React, { useState } from 'react';
import { 
  CURRENT_USER, 
  INITIAL_TOURNAMENTS, 
  INITIAL_FIXTURES, 
  INITIAL_ACTIVE_MATCH, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_TRANSACTIONS 
} from './data/mockData';
import { GameType, Tournament, Fixture, Match, ChatMessage, Transaction, User } from './types/tournament';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { MatchLobby } from './components/MatchLobby';
import { WalletScreen } from './components/WalletScreen';
import { ApiSpecsExplorer } from './components/ApiSpecsExplorer';
import { 
  JoinFixtureModal, 
  ScoreSubmitModal, 
  DisputeModal, 
  DepositModal, 
  WithdrawalModal 
} from './components/Modals';
import { CreateFixtureModal } from './components/CreateFixtureModal';
import { 
  Gamepad2, 
  Swords, 
  Wallet, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Smartphone,
  Wifi,
  Battery,
  Trophy
} from 'lucide-react';

export default function App() {
  // Navigation & Viewport State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'lobby' | 'wallet' | 'specs'>('dashboard');
  const [selectedGame, setSelectedGame] = useState<GameType>('DLS');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);

  // Data State
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [activeMatch, setActiveMatch] = useState<Match>(INITIAL_ACTIVE_MATCH);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Modals
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedFixtureForJoin, setSelectedFixtureForJoin] = useState<Fixture | null>(null);
  const [selectedTournamentForJoin, setSelectedTournamentForJoin] = useState<Tournament | null>(null);
  const [createFixtureModalOpen, setCreateFixtureModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Actions
  const handleOpenJoinFixture = (fixture: Fixture) => {
    setSelectedFixtureForJoin(fixture);
    setSelectedTournamentForJoin(null);
    setJoinModalOpen(true);
  };

  const handleOpenJoinTournament = (tournament: Tournament) => {
    setSelectedTournamentForJoin(tournament);
    setSelectedFixtureForJoin(null);
    setJoinModalOpen(true);
  };

  const handleConfirmJoin = (entryFee: number) => {
    setJoinModalOpen(false);

    // Deduct from wallet balance, increment escrow balance
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - entryFee,
      escrowBalance: prev.escrowBalance + entryFee,
    }));

    // Record Transaction
    const newTx: Transaction = {
      id: `tx_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      type: 'ESCROW_LOCK',
      amount: -entryFee,
      status: 'HELD_IN_ESCROW',
      description: `Escrow hold for ${selectedFixtureForJoin?.title || selectedTournamentForJoin?.title}`,
      createdAt: 'Just now',
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast(`$${entryFee.toFixed(2)} entry locked in escrow. Match room ready!`, 'success');
    setCurrentTab('lobby');
  };

  const handleCreateFixture = (title: string, gameType: GameType, entryFee: number, prizePool: number) => {
    // Deduct entry fee to escrow
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - entryFee,
      escrowBalance: prev.escrowBalance + entryFee,
    }));

    const newFixture: Fixture = {
      id: `fix_${Date.now()}`,
      title,
      gameType,
      entryFee,
      prizePool,
      rakePercent: 8,
      status: 'OPEN',
      scheduledTime: 'Available to Join',
      hostPlayerId: user.id,
      hostPlayerName: user.username,
      hostPlayerAvatar: user.avatarUrl,
      hostPlayerElo: user.gameProfiles[gameType].eloRating,
    };

    setFixtures(prev => [newFixture, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      type: 'ESCROW_LOCK',
      amount: -entryFee,
      status: 'HELD_IN_ESCROW',
      description: `Host Match Escrow Lock: ${title}`,
      createdAt: 'Just now',
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast(`Fixture created! $${entryFee.toFixed(2)} held in escrow for opponent.`, 'success');
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      matchId: activeMatch.id,
      senderId: user.id,
      senderName: user.username,
      text,
      timestamp: 'Just now',
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Opponent auto-reply simulation for interactive feedback
    setTimeout(() => {
      const replies = [
        "Sounds good! Launching game now.",
        "Joined room, send me the kickoff invite!",
        "Gamer tag accepted. Let's get this win!",
        "Good luck! Extra time on.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const opponentMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        matchId: activeMatch.id,
        senderId: activeMatch.player2.id,
        senderName: activeMatch.player2.username,
        text: randomReply,
        timestamp: 'Just now',
      };
      setChatMessages(prev => [...prev, opponentMsg]);
    }, 1200);
  };

  const handleSubmitScore = (playerScore: number, opponentScore: number, screenshotUrl: string) => {
    setActiveMatch(prev => ({
      ...prev,
      status: 'SCORE_PENDING',
      player1Submission: {
        playerId: user.id,
        playerScore,
        opponentScore,
        screenshotUrl,
        submittedAt: 'Just now',
      },
    }));

    showToast(`Reported ${playerScore} - ${opponentScore} with proof screenshot. Awaiting opponent submission.`, 'info');
  };

  const handleSimulateOpponentScore = (p1Score: number, p2Score: number) => {
    // p1Score = what user got (2), p2Score = what opponent got (1)
    if (p1Score === 2 && p2Score === 1) {
      // Both agree user won 2 - 1
      const prize = activeMatch.prizePool;
      setUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance + prize,
        escrowBalance: Math.max(0, prev.escrowBalance - activeMatch.entryFee),
      }));

      setActiveMatch(prev => ({
        ...prev,
        status: 'MUTUAL_CONFIRMED',
        player2Submission: {
          playerId: prev.player2.id,
          playerScore: p2Score,
          opponentScore: p1Score,
          screenshotUrl: '/src/assets/images/screenshot_match_proof_1792049038443.jpg',
          submittedAt: 'Just now',
        },
        finalScore: { player1: 2, player2: 1 },
        winnerId: user.id,
      }));

      // Record payout transaction
      const payoutTx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'PRIZE_PAYOUT',
        amount: prize,
        status: 'COMPLETED',
        referenceId: activeMatch.id,
        description: `1st Place Cash Payout: 1v1 High Roller Stakes (${activeMatch.gameType})`,
        paymentMethod: 'In-App Wallet',
        createdAt: 'Just now',
      };
      setTransactions(prev => [payoutTx, ...prev]);

      showToast(`🏆 Scores matched! $${prize.toFixed(2)} cash prize deposited directly to your wallet!`, 'success');
    } else {
      // Disagreeing scores -> Dispute
      setActiveMatch(prev => ({
        ...prev,
        status: 'DISPUTED',
        player2Submission: {
          playerId: prev.player2.id,
          playerScore: 3,
          opponentScore: 1,
          screenshotUrl: '/src/assets/images/screenshot_match_proof_1792049038443.jpg',
          submittedAt: 'Just now',
        },
      }));
      showToast('⚠️ Score conflict detected! Opponent claims different score. Escrow frozen & referee ticket opened.', 'error');
    }
  };

  const handleDisputeConfirm = (reason: string, description: string) => {
    setActiveMatch(prev => ({
      ...prev,
      status: 'DISPUTED',
      dispute: {
        id: `dsp_${Date.now()}`,
        matchId: prev.id,
        raisedByPlayerId: user.id,
        reason: reason as any,
        description,
        evidenceScreenshotUrl: '/src/assets/images/screenshot_match_proof_1792049038443.jpg',
        createdAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      },
    }));

    showToast('Match dispute opened. Escrow funds locked. An admin arbiter is reviewing evidence.', 'info');
  };

  const handleDepositSuccess = (amount: number, method: string) => {
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED',
      description: `Wallet Deposit via ${method}`,
      paymentMethod: method,
      createdAt: 'Just now',
    };
    setTransactions(prev => [tx, ...prev]);

    showToast(`Successfully deposited $${amount.toFixed(2)} via ${method}!`, 'success');
  };

  const handleWithdrawSuccess = (amount: number, method: string) => {
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
    }));

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'WITHDRAWAL',
      amount: -amount,
      status: 'COMPLETED',
      description: `Cashout via ${method}`,
      paymentMethod: method,
      createdAt: 'Just now',
    };
    setTransactions(prev => [tx, ...prev]);

    showToast(`Cashout of $${amount.toFixed(2)} initiated to ${method}!`, 'success');
  };

  // Render Screen Content
  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <HomeDashboard
            user={user}
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            tournaments={tournaments}
            fixtures={fixtures}
            onSelectFixture={handleOpenJoinFixture}
            onCreateFixture={() => setCreateFixtureModalOpen(true)}
            onJoinTournament={handleOpenJoinTournament}
            onGoToMatchLobby={() => setCurrentTab('lobby')}
            hasActiveMatch={activeMatch.status === 'LIVE' || activeMatch.status === 'SCORE_PENDING'}
          />
        );
      case 'lobby':
        return (
          <MatchLobby
            match={activeMatch}
            currentUser={user}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onSubmitScore={() => setScoreModalOpen(true)}
            onOpenDispute={() => setDisputeModalOpen(true)}
            onSimulateOpponentScore={handleSimulateOpponentScore}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            user={user}
            transactions={transactions}
            onOpenDeposit={() => setDepositModalOpen(true)}
            onOpenWithdrawal={() => setWithdrawalModalOpen(true)}
          />
        );
      case 'specs':
        return <ApiSpecsExplorer />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-500/50'
              : 'bg-slate-900 text-slate-200 border-slate-700'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Bar (Conforms to 3-zone Top Bar Contract) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileDeviceFrame={isMobileDeviceFrame}
        setIsMobileDeviceFrame={setIsMobileDeviceFrame}
        walletBalance={user.walletBalance}
        escrowBalance={user.escrowBalance}
        onOpenDeposit={() => setDepositModalOpen(true)}
        activeMatchBadgeCount={activeMatch.status === 'LIVE' ? 1 : 0}
      />

      {/* Viewport Rendering: Mobile Device Simulation vs Desktop Layout */}
      {isMobileDeviceFrame ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900/40">
          {/* Smartphone Frame Wrapper */}
          <div className="w-full max-w-[410px] h-[850px] max-h-[92vh] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-2xl shadow-black relative flex flex-col overflow-hidden ring-1 ring-slate-700/50">
            
            {/* Mobile Status Bar */}
            <div className="h-10 pt-2 px-6 flex items-center justify-between text-[11px] font-bold text-slate-400 bg-slate-950 shrink-0 z-30 select-none">
              <span>9:41</span>
              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 bg-slate-900 rounded-full border border-slate-800" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-400" />
                <Battery className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Mobile Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-20">
              {renderScreen()}
            </div>

            {/* Fixed Mobile Bottom Tab Bar (Conforms to Mobile Reference Pattern 1) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center z-40 px-2 select-none">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  currentTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="text-[10px] mt-1">Play</span>
              </button>

              <button
                onClick={() => setCurrentTab('lobby')}
                className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                  currentTab === 'lobby' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Swords className="w-5 h-5" />
                <span className="text-[10px] mt-1">Room</span>
                {activeMatch.status === 'LIVE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-6" />
                )}
              </button>

              <button
                onClick={() => setCurrentTab('wallet')}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  currentTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] mt-1">Wallet</span>
              </button>

              <button
                onClick={() => setCurrentTab('specs')}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  currentTab === 'specs' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <FileCode className="w-5 h-5" />
                <span className="text-[10px] mt-1">API Specs</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Desktop / Responsive Canvas Layout */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderScreen()}
        </main>
      )}

      {/* Global Modals */}
      <JoinFixtureModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        fixture={selectedFixtureForJoin}
        tournament={selectedTournamentForJoin}
        user={user}
        onConfirmJoin={handleConfirmJoin}
      />

      <CreateFixtureModal
        isOpen={createFixtureModalOpen}
        onClose={() => setCreateFixtureModalOpen(false)}
        user={user}
        selectedGame={selectedGame}
        onCreateFixture={handleCreateFixture}
      />

      <ScoreSubmitModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        gameType={activeMatch.gameType}
        onSubmit={handleSubmitScore}
      />

      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        matchId={activeMatch.id}
        onConfirmDispute={handleDisputeConfirm}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawalModal
        isOpen={withdrawalModalOpen}
        onClose={() => setWithdrawalModalOpen(false)}
        user={user}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
