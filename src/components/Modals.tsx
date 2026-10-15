import React, { useState } from 'react';
import { Fixture, Tournament, User, GameType } from '../types/tournament';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Upload, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Smartphone, 
  CreditCard, 
  Coins, 
  Swords,
  Clock
} from 'lucide-react';

// ============================================================================
// 1. Join Fixture / Tournament Escrow Confirmation Modal
// ============================================================================
interface JoinFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture?: Fixture | null;
  tournament?: Tournament | null;
  user: User;
  onConfirmJoin: (fee: number) => void;
}

export const JoinFixtureModal: React.FC<JoinFixtureModalProps> = ({
  isOpen,
  onClose,
  fixture,
  tournament,
  user,
  onConfirmJoin,
}) => {
  if (!isOpen || (!fixture && !tournament)) return null;

  const title = fixture ? fixture.title : tournament?.title;
  const gameType = fixture ? fixture.gameType : tournament?.gameType;
  const entryFee = fixture ? fixture.entryFee : tournament?.entryFee || 0;
  const prize = fixture ? fixture.prizePool : tournament?.prizePool || 0;
  const hasEnoughFunds = user.walletBalance >= entryFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Escrow Stake Confirmation</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{gameType} Match</span>
          <h4 className="text-lg font-extrabold text-white mt-0.5">{title}</h4>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Entry Fee Required:</span>
            <span className="font-mono font-bold text-white text-sm tabular-nums">${entryFee.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Potential First Place Win:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">${prize.toFixed(2)} USD</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Current Available Balance:</span>
            <span className={`font-mono font-bold tabular-nums ${hasEnoughFunds ? 'text-slate-200' : 'text-rose-400'}`}>
              ${user.walletBalance.toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your stake will be held in atomic escrow. If the opponent fails to appear within 15 minutes or cancels, your funds are returned 100% with zero deductions.
          </p>
        </div>

        {hasEnoughFunds ? (
          <button
            onClick={() => onConfirmJoin(entryFee)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 stroke-[2.5]" />
            <span>Lock ${entryFee.toFixed(2)} & Enter Match Room</span>
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-rose-400 text-center font-semibold">
              Insufficient balance (${user.walletBalance.toFixed(2)} available). Please top up your wallet.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Cancel & Top-Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. Score Submission & Screenshot Proof Modal
// ============================================================================
interface ScoreSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  onSubmit: (p1Score: number, p2Score: number, proofUrl: string) => void;
}

export const ScoreSubmitModal: React.FC<ScoreSubmitModalProps> = ({
  isOpen,
  onClose,
  gameType,
  onSubmit,
}) => {
  const [playerScore, setPlayerScore] = useState<number>(2);
  const [opponentScore, setOpponentScore] = useState<number>(1);
  const [proofUrl, setProofUrl] = useState<string>('/src/assets/images/screenshot_match_proof_1792049038443.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(playerScore, opponentScore, proofUrl);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Submit Final Match Result</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Final Whistle Scoreline
            </label>
            <div className="grid grid-cols-5 gap-2 items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="col-span-2 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Your Score</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={playerScore}
                  onChange={(e) => setPlayerScore(parseInt(e.target.value) || 0)}
                  className="w-full text-center text-2xl font-black font-mono bg-slate-900 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-1 text-center font-bold text-slate-500 text-lg">
                —
              </div>

              <div className="col-span-2 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Opponent Score</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={opponentScore}
                  onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                  className="w-full text-center text-2xl font-black font-mono bg-slate-900 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Screenshot Proof Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Match Result Screenshot Proof
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Must clearly display final score, in-game tags, and match statistics.
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <img 
                src={proofUrl} 
                alt="Match result screenshot proof"
                className="w-full h-44 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2">
                <span className="font-mono text-emerald-400">✓ In-game screenshot verified</span>
                <span className="text-slate-500">EXIF: Today · 1080x2400</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
            <strong>Consensus Rule:</strong> When both players submit the same scoreline, the cash prize is disbursed immediately to the winner's wallet.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Verifying & Submitting...' : 'Confirm & Submit Result'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 3. Dispute Filing Modal
// ============================================================================
interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  onConfirmDispute: (reason: string, description: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  matchId,
  onConfirmDispute,
}) => {
  const [reason, setReason] = useState<string>('WRONG_SCORE');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmDispute(reason, description);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">File Match Dispute</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Dispute Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="WRONG_SCORE">Opponent Submitted Incorrect Score</option>
              <option value="DISCONNECTION">Opponent Quit / Intentionally Disconnected</option>
              <option value="LAG_SWITCHING">Extreme Lag-Switching / Network Tampering</option>
              <option value="UNREGISTERED_ACCOUNT">Opponent used different In-Game Account</option>
              <option value="CHEATING_MOD">Modified Game APK / Speed Cheat</option>
              <option value="OTHER">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Incident Explanation
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details (minute of match, goals scored, what opponent did)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-200">
            <strong>Arbitration Notice:</strong> Prize escrow will be immediately frozen. A human tournament referee will review chat logs, gamer tags, and screenshot proof.
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            {isSubmitting ? 'Locking Escrow & Escalating...' : 'Freeze Escrow & Open Dispute'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 4. Deposit Funds Modal
// ============================================================================
interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, method: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState<number>(25);
  const [method, setMethod] = useState<'MPESA' | 'CARD' | 'CRYPTO'>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const methodName = method === 'MPESA' ? 'M-Pesa STK Push' : method === 'CARD' ? 'Visa/Mastercard' : 'USDT TRC-20';
      onDepositSuccess(amount, methodName);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Deposit Wallet Funds</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          {/* Amount Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                    amount === amt
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Payment Channel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('MPESA')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'MPESA'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">M-Pesa / Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'CARD'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CRYPTO')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  method === 'CRYPTO'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">USDT Crypto</span>
              </button>
            </div>
          </div>

          {method === 'MPESA' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">M-Pesa Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">An instant STK Push prompt will be sent to your mobile device.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isProcessing ? 'Initiating Payment Request...' : `Deposit $${amount.toFixed(2)} USD`}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 5. Withdrawal / Instant Cashout Modal
// ============================================================================
interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onWithdrawSuccess: (amount: number, method: string) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  user,
  onWithdrawSuccess,
}) => {
  const [cashoutAmount, setCashoutAmount] = useState<number>(30);
  const [method, setMethod] = useState<'MPESA' | 'BANK' | 'USDT'>('MPESA');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashoutAmount > user.walletBalance || cashoutAmount < 5) return;
    setIsProcessing(true);
    setTimeout(() => {
      const rail = method === 'MPESA' ? 'Instant M-Pesa' : method === 'BANK' ? 'ACH Bank Transfer' : 'USDT TRC-20';
      onWithdrawSuccess(cashoutAmount, rail);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Instant Cashout</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Available to Withdraw:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
              ${user.walletBalance.toFixed(2)} USD
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Cashout Amount ($)</label>
            <input
              type="number"
              min="5"
              max={user.walletBalance}
              value={cashoutAmount}
              onChange={(e) => setCashoutAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Minimum withdrawal: $5.00 · Zero fee</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Destination Rail</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMethod('MPESA')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  method === 'MPESA' ? 'border-emerald-500 bg-emerald-950/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">M-Pesa Express</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">Instant (&lt; 2 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('BANK')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  method === 'BANK' ? 'border-emerald-500 bg-emerald-950/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Bank Direct (ACH/SEPA)</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">12 - 24 hrs</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || cashoutAmount > user.walletBalance || cashoutAmount < 5}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isProcessing ? 'Broadcasting Payout...' : `Confirm Cashout of $${cashoutAmount.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
