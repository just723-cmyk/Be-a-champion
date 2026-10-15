import React, { useState } from 'react';
import { GameType, User } from '../types/tournament';
import { X, Swords, Lock, ShieldCheck } from 'lucide-react';

interface CreateFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  selectedGame: GameType;
  onCreateFixture: (title: string, gameType: GameType, entryFee: number, prizePool: number) => void;
}

export const CreateFixtureModal: React.FC<CreateFixtureModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedGame,
  onCreateFixture,
}) => {
  const [game, setGame] = useState<GameType>(selectedGame);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [customTitle, setCustomTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalPot = stakeAmount * 2;
  const platformRake = totalPot * 0.08;
  const winnerPrize = totalPot - platformRake;
  const hasFunds = user.walletBalance >= stakeAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFunds) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const title = customTitle.trim() || `1v1 ${game === 'DLS' ? 'DLS' : 'FC Mobile'} Cash Stake ($${stakeAmount})`;
      onCreateFixture(title, game, stakeAmount, winnerPrize);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Create 1v1 Cash Fixture</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Game Discipline</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGame('DLS')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  game === 'DLS'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Dream League Soccer
              </button>
              <button
                type="button"
                onClick={() => setGame('FC_MOBILE')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  game === 'FC_MOBILE'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                EA FC Mobile
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Match Stake Amount</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[2, 5, 10, 25].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setStakeAmount(amt)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                    stakeAmount === amt
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Escrow Pool Math Breakdown */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Your Stake (Locked in Escrow):</span>
              <span className="text-white">${stakeAmount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Opponent Match Stake:</span>
              <span className="text-white">${stakeAmount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Platform Rake (8%):</span>
              <span className="text-slate-500">-${platformRake.toFixed(2)} USD</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-slate-200">Winner Take-Home:</span>
              <span className="text-emerald-400">${winnerPrize.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Your gamer tag ({user.gameProfiles[game].gamerTagId}) will be presented to any opponent who accepts this match.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasFunds}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Locking Escrow & Posting...' : `Lock $${stakeAmount.toFixed(2)} & Create Fixture`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
