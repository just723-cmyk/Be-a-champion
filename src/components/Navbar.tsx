import React from 'react';
import { Gamepad2, Smartphone, Monitor, Wallet, Plus } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'lobby' | 'wallet' | 'specs';
  setCurrentTab: (tab: 'dashboard' | 'lobby' | 'wallet' | 'specs') => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean) => void;
  walletBalance: number;
  escrowBalance: number;
  onOpenDeposit: () => void;
  activeMatchBadgeCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileDeviceFrame,
  setIsMobileDeviceFrame,
  walletBalance,
  escrowBalance,
  onOpenDeposit,
  activeMatchBadgeCount = 1,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark (Strict single-element contract) */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
              ApexPitch
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line prose, no pills) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'dashboard'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tournaments
            {currentTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('lobby')}
            className={`whitespace-nowrap transition-colors relative py-1 flex items-center gap-2 ${
              currentTab === 'lobby'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Match Room
            {activeMatchBadgeCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {currentTab === 'lobby' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('wallet')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'wallet'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wallet & Escrow
            {currentTab === 'wallet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('specs')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'specs'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture & API Sandbox
            {currentTab === 'specs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Viewport Frame Toggle (Mobile Preview vs Web Layout) */}
          <button
            onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
            title={isMobileDeviceFrame ? "Switch to Desktop Browser Layout" : "Switch to Mobile Phone Device Frame"}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            {isMobileDeviceFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>Desktop Mode</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Wallet Balance Display & Deposit Button */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setCurrentTab('wallet')}
              className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums font-mono">${walletBalance.toFixed(2)}</span>
              {escrowBalance > 0 && (
                <span className="text-[11px] text-slate-500 font-mono">(${escrowBalance.toFixed(2)} held)</span>
              )}
            </button>
            <button
              onClick={onOpenDeposit}
              className="px-2 py-1 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md transition-colors flex items-center gap-1 shadow-sm shadow-emerald-500/20"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Deposit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
