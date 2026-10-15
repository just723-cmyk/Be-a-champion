import React, { useState } from 'react';
import { GameType, Tournament, Fixture, User } from '../types/tournament';
import { 
  Trophy, 
  Swords, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  Award,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

interface HomeDashboardProps {
  user: User;
  selectedGame: GameType;
  setSelectedGame: (game: GameType) => void;
  tournaments: Tournament[];
  fixtures: Fixture[];
  onSelectFixture: (fixture: Fixture) => void;
  onCreateFixture: () => void;
  onJoinTournament: (tournament: Tournament) => void;
  onGoToMatchLobby: () => void;
  hasActiveMatch: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  selectedGame,
  setSelectedGame,
  tournaments,
  fixtures,
  onSelectFixture,
  onCreateFixture,
  onJoinTournament,
  onGoToMatchLobby,
  hasActiveMatch,
}) => {
  const [stakeFilter, setStakeFilter] = useState<'ALL' | 'MICRO' | 'MID' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tournaments by selected game
  const filteredTournaments = tournaments.filter(t => t.gameType === selectedGame);

  // Filter 1v1 fixtures
  const filteredFixtures = fixtures.filter(f => {
    if (f.gameType !== selectedGame) return false;
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.hostPlayerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (stakeFilter === 'MICRO') return f.entryFee <= 5;
    if (stakeFilter === 'MID') return f.entryFee > 5 && f.entryFee <= 15;
    if (stakeFilter === 'HIGH') return f.entryFee > 15;
    return true;
  });

  const currentGameProfile = user.gameProfiles[selectedGame];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Active Match Banner Notice (if user has an in-progress fixture) */}
      {hasActiveMatch && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Match in progress</span>
                <span className="text-xs text-slate-400">· Room Code #DLS-ROOM-7492</span>
              </div>
              <p className="text-sm font-semibold text-white">
                ApexStriker vs BlitzKicker · $18.40 Escrow Locked
              </p>
            </div>
          </div>
          <button
            onClick={onGoToMatchLobby}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            Enter Match Lobby →
          </button>
        </div>
      )}

      {/* Game Selector & User Ranking Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Esports Discipline</span>
          {/* Segmented Game Toggle */}
          <div className="flex items-center gap-2 mt-2 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md">
            <button
              onClick={() => setSelectedGame('DLS')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedGame === 'DLS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Dream League Soccer (DLS)</span>
            </button>
            <button
              onClick={() => setSelectedGame('FC_MOBILE')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedGame === 'FC_MOBILE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>EA SPORTS FC Mobile</span>
            </button>
          </div>
        </div>

        {/* User Gamer Profile Card */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate">{currentGameProfile.inGameName}</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                {currentGameProfile.gamerTagId}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>ELO <strong className="text-slate-200 font-mono">{currentGameProfile.eloRating}</strong></span>
              <span>·</span>
              <span>{currentGameProfile.matchesWon}W / {currentGameProfile.matchesPlayed - currentGameProfile.matchesWon}L ({Math.round((currentGameProfile.matchesWon / currentGameProfile.matchesPlayed) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="absolute inset-0">
          <img 
            src="/src/assets/images/hero_esports_arena_1792049036999.jpg" 
            alt="Esports Arena"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Competitive Skill-Based Football Gaming</span>
            <span>·</span>
            <span>Instant Automated Escrow</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight text-balance leading-tight">
            {selectedGame === 'DLS' 
              ? 'Dream League Soccer Cash Cups & Head-to-Head Wagers' 
              : 'EA SPORTS FC Mobile Championship Fixtures'}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
            Stake your entry fee in our automated escrow vault. Connect with certified opponents via In-Game ID, play 90 minutes, and upload match whistle screenshots to claim verified cash payouts.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateFixture}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 stroke-[2.5]" />
              <span>Create 1v1 Match Stake</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Double-entry ledger & human arbiter anti-cheat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tournaments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Official Bracket Tournaments</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Single elimination cups with multi-tier cash prize pools.
            </p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Platform rake: 8% on net pool
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400">
                      {tournament.gameType === 'DLS' ? 'DLS 2026' : 'FC Mobile H2H'}
                    </span>
                    <span>·</span>
                    <span>{tournament.format.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tournament.startTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {tournament.title}
                </h3>

                <div className="grid grid-cols-3 gap-3 my-4 py-3 px-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Entry Fee</span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      ${tournament.entryFee.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Prize Pool</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      ${tournament.prizePool.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Slots Filled</span>
                    <span className="text-sm font-bold font-mono text-slate-200 tabular-nums">
                      {tournament.registeredPlayers}/{tournament.maxPlayers}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Rule Highlights:</span>
                  <ul className="text-xs text-slate-300 space-y-0.5">
                    {tournament.rules.slice(0, 2).map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        <span className="truncate">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onJoinTournament(tournament)}
                className="w-full py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Tournament (${tournament.entryFee.toFixed(2)})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 1v1 Cash Fixtures Hub (Head-to-Head Wagers) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-400" />
              <span>1v1 Head-to-Head Cash Fixtures</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant wager matches with real opponent gamer tags. Funds locked in escrow before kickoff.
            </p>
          </div>

          {/* Stake Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['ALL', 'MICRO', 'MID', 'HIGH'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStakeFilter(filter)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  stakeFilter === filter
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'All Stakes' : filter === 'MICRO' ? '≤ $5' : filter === 'MID' ? '$5 - $15' : '$15+'}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures List */}
        <div className="space-y-3">
          {filteredFixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                  <img
                    src={fixture.hostPlayerAvatar}
                    alt={fixture.hostPlayerName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{fixture.title}</span>
                    <span className="text-xs font-mono text-slate-400">· {fixture.gameType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Host: <strong className="text-slate-200">{fixture.hostPlayerName}</strong></span>
                    <span>·</span>
                    <span>ELO <strong className="text-emerald-400 font-mono">{fixture.hostPlayerElo}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Stake / Prize</span>
                  <div className="text-xs font-semibold text-slate-300">
                    <span className="font-mono tabular-nums">${fixture.entryFee.toFixed(2)}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-emerald-400 font-bold font-mono tabular-nums">${fixture.prizePool.toFixed(2)} Win</span>
                  </div>
                </div>

                {fixture.status === 'IN_PROGRESS' ? (
                  <button
                    onClick={onGoToMatchLobby}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    View Room
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectFixture(fixture)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap cursor-pointer"
                  >
                    Accept Match (${fixture.entryFee.toFixed(2)})
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredFixtures.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <Swords className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No active cash fixtures match this filter</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to create a wager room!</p>
              <button
                onClick={onCreateFixture}
                className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Create Cash Match Stake
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trust & Escrow Guarantee Footer Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Escrow</h4>
            <p className="text-xs text-slate-400 mt-0.5">Funds are held by strict database locks until both players confirm scores or whistle proof is checked.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
          <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Anti-Cheat & Disputes</h4>
            <p className="text-xs text-slate-400 mt-0.5">Screenshot proof with timestamp validation and 24/7 human arbiters to resolve foul play or quitters.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official ELO Rankings</h4>
            <p className="text-xs text-slate-400 mt-0.5">Skill-based rating adjustments after every fixture ensure fair matchmaking between equal opponents.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
