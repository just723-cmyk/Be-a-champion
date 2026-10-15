import React, { useState } from 'react';
import { User, Transaction, TransactionType } from '../types/tournament';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Coins,
  History
} from 'lucide-react';

interface WalletScreenProps {
  user: User;
  transactions: Transaction[];
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  user,
  transactions,
  onOpenDeposit,
  onOpenWithdrawal,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'STAKE' | 'PAYOUT'>('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DEPOSIT') return t.type === 'DEPOSIT';
    if (filterType === 'WITHDRAWAL') return t.type === 'WITHDRAWAL';
    if (filterType === 'STAKE') return t.type === 'ENTRY_FEE' || t.type === 'ESCROW_LOCK';
    if (filterType === 'PAYOUT') return t.type === 'PRIZE_PAYOUT';
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Wallet Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Player Wallet & Escrow Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time balance, instant mobile money cashouts, and double-entry transaction ledger.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDeposit}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>Deposit Funds</span>
          </button>

          <button
            onClick={onOpenWithdrawal}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Instant Cashout</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            ${user.walletBalance.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Ready for instant tournament stake
          </span>
        </div>

        {/* Escrow Locked Funds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Held in Active Escrow</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            ${user.escrowBalance.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Locked in Match #MTC-8921
          </span>
        </div>

        {/* Bonus Tournament Credits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Bonus Match Credits</span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-teal-400 tabular-nums">
            ${user.bonusBalance.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            100% usable on tournament entry fees
          </span>
        </div>

        {/* KYC Verification & Limits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>KYC Security Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-white">Tier 2 Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Max Daily Cashout: $2,500.00
          </span>
        </div>
      </div>

      {/* Supported Payment & Cashout Rails */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Supported Cashout & Top-Up Rails</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">M-Pesa & Mobile Money</span>
              <span className="text-slate-400 text-[11px]">Instant STK Push (&lt; 2 min)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Cards (Visa / Master)</span>
              <span className="text-slate-400 text-[11px]">3D-Secure 2.0 Protection</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Crypto (USDT TRC-20)</span>
              <span className="text-slate-400 text-[11px]">Zero network surcharge</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Bank Wire / ACH</span>
              <span className="text-slate-400 text-[11px]">Direct account credit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>Double-Entry Transaction History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable ledger of deposits, escrow holds, cashout redemptions, and prize payouts.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'STAKE', 'PAYOUT'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All Transactions' : cat === 'DEPOSIT' ? 'Deposits' : cat === 'WITHDRAWAL' ? 'Withdrawals' : cat === 'STAKE' ? 'Match Stakes' : 'Prizes'}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'DEPOSIT' || tx.type === 'PRIZE_PAYOUT'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : tx.type === 'ESCROW_LOCK'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'PRIZE_PAYOUT' ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      ) : tx.type === 'ESCROW_LOCK' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{tx.description}</span>
                        {tx.paymentMethod && (
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            · {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-500">#{tx.id}</span>
                        <span>·</span>
                        <span>{tx.createdAt}</span>
                        <span>·</span>
                        <span className={`font-semibold ${
                          tx.status === 'COMPLETED' ? 'text-emerald-400' : tx.status === 'HELD_IN_ESCROW' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-extrabold font-mono tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">USD</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
