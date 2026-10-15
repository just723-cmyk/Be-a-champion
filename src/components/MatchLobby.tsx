import React, { useState, useEffect, useRef } from 'react';
import { Match, ChatMessage, User } from '../types/tournament';
import { 
  Copy, 
  Check, 
  Send, 
  AlertCircle, 
  ShieldAlert, 
  Upload, 
  Clock, 
  Swords, 
  ExternalLink,
  MessageSquare,
  BookOpen,
  DollarSign
} from 'lucide-react';

interface MatchLobbyProps {
  match: Match;
  currentUser: User;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSubmitScore: () => void;
  onOpenDispute: () => void;
  onSimulateOpponentScore: (opponentP1Score: number, opponentP2Score: number) => void;
}

export const MatchLobby: React.FC<MatchLobbyProps> = ({
  match,
  currentUser,
  chatMessages,
  onSendMessage,
  onSubmitScore,
  onOpenDispute,
  onSimulateOpponentScore,
}) => {
  const [copiedGamerTag, setCopiedGamerTag] = useState(false);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'rules' | 'status'>('chat');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleCopyGamerTag = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedGamerTag(true);
    setTimeout(() => setCopiedGamerTag(false), 2000);
  };

  const handleCopyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRoomCode(true);
    setTimeout(() => setCopiedRoomCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput('');
  };

  const opponent = match.player1.id === currentUser.id ? match.player2 : match.player1;
  const userPlayer = match.player1.id === currentUser.id ? match.player1 : match.player2;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">{match.gameType} Esports Room</span>
            <span>·</span>
            <span>Match #{match.id.toUpperCase()}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Head-to-Head 1v1 Fixture Lobby
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Escrow Prize Pool</span>
            <span className="font-bold font-mono text-emerald-400 text-sm tabular-nums">
              ${match.prizePool.toFixed(2)} USD
            </span>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Time Remaining</span>
              <span className="font-mono font-bold text-white tabular-nums">18:42</span>
            </div>
          </div>
        </div>
      </div>

      {/* Versus Head-to-Head Arena Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          
          {/* Left Player (Current User) */}
          <div className="md:col-span-5 flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden border-2 border-emerald-500 shrink-0">
              <img 
                src={userPlayer.avatarUrl} 
                alt={userPlayer.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">YOU (Host)</span>
                <span className="text-xs text-slate-500">· ELO {userPlayer.elo}</span>
              </div>
              <h3 className="text-base font-extrabold text-white truncate">{userPlayer.username}</h3>
              <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                IGN: <span className="text-slate-100">{userPlayer.inGameName}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {userPlayer.gamerTagId}
                </span>
              </div>
            </div>
          </div>

          {/* VS Center Pillar */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-emerald-400 shadow-md">
              VS
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1">1v1 STAKE</span>
          </div>

          {/* Right Player (Opponent) */}
          <div className="md:col-span-5 flex items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">OPPONENT</span>
                <span className="text-xs text-slate-500">· ELO {opponent.elo}</span>
              </div>
              <h3 className="text-base font-extrabold text-white truncate">{opponent.username}</h3>
              <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                IGN: <span className="text-slate-100">{opponent.inGameName}</span>
              </p>
              
              {/* Opponent GamerTag with Copy Trigger */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                  {opponent.gamerTagId}
                </span>
                <button
                  onClick={() => handleCopyGamerTag(opponent.gamerTagId)}
                  className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors"
                  title="Copy Gamer Tag to clipboard"
                >
                  {copiedGamerTag ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Tag</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden border-2 border-amber-500/70 shrink-0">
              <img 
                src={opponent.avatarUrl} 
                alt={opponent.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Room Code & Connection Helper Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">In-Game Match Code:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono font-bold text-white">
              <span>{match.roomCode}</span>
              <button
                onClick={() => handleCopyRoomCode(match.roomCode)}
                className="p-1 hover:text-emerald-400 transition-colors"
                title="Copy Match Code"
              >
                {copiedRoomCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Launch Game:</span>
            <span className="text-emerald-400 font-semibold">{match.gameType === 'DLS' ? 'Dream League Soccer' : 'FC Mobile'}</span>
            <span>· Friend Match Mode</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Room (Chat, Rules, Status) & Score Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Tabbed Lobby Container (Live Chat, Rulebook, Verification Status) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px]">
          
          {/* Lobby Segmented Tabs */}
          <div className="flex items-center border-b border-slate-800 p-2 gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>In-Lobby Chat</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-1 rounded">
                Live WS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'rules'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Official Rulebook</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'status'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Submission Audit</span>
            </button>
          </div>

          {/* Tab Content: Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div 
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {chatMessages.map((msg) => {
                  const isUser = msg.senderId === currentUser.id;
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-emerald-400 block mb-1">ApexPitch Match System:</span>
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                        <span className="font-semibold text-slate-300">{msg.senderName}</span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                          isUser 
                            ? 'bg-emerald-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Message opponent or coordinate room invite..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: Rulebook */}
          {activeTab === 'rules' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-white text-sm">1. Game Settings & Duration</h4>
                <p className="mt-1 text-slate-400">Regular 90-minute in-game half lengths. Extra Time & Penalty Shootouts MUST be toggled ON in game settings. Draws are not accepted; a winner must be determined on the pitch.</p>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">2. Mandatory Screenshot Evidence</h4>
                <p className="mt-1 text-slate-400">At the final whistle, both players MUST screenshot the full-time summary screen showing the final score, gamer tags, and match statistics. Cropped or blurred screenshots will be rejected during dispute reviews.</p>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">3. Disconnection & Network Lag</h4>
                <p className="mt-1 text-slate-400">If a disconnection occurs within the first 15 minutes of in-game time without any goals scored, a full match restart is permitted. Disconnections after 15 minutes or when a player is losing count as a forfeiture.</p>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">4. Anti-Cheat & Fair Play</h4>
                <p className="mt-1 text-slate-400">Use of speed hacks, modified APKs, or network lag switches results in an instant lifetime ban and confiscation of all staked funds under Terms of Service.</p>
              </div>
            </div>
          )}

          {/* Tab Content: Submission Audit */}
          {activeTab === 'status' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Player 1 (ApexStriker) Submission:</span>
                {match.player1Submission ? (
                  <div className="text-slate-300 space-y-1">
                    <p>Reported Score: <strong>{match.player1Submission.playerScore} - {match.player1Submission.opponentScore}</strong></p>
                    <p className="text-slate-400 text-[11px]">Submitted at: {match.player1Submission.submittedAt}</p>
                    <span className="text-emerald-400 text-[11px] block">✓ Proof Screenshot Uploaded</span>
                  </div>
                ) : (
                  <p className="text-amber-400">No score submitted yet. Play match and click "Submit Score".</p>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Player 2 (BlitzKicker) Submission:</span>
                {match.player2Submission ? (
                  <div className="text-slate-300 space-y-1">
                    <p>Reported Score: <strong>{match.player2Submission.playerScore} - {match.player2Submission.opponentScore}</strong></p>
                    <p className="text-slate-400 text-[11px]">Submitted at: {match.player2Submission.submittedAt}</p>
                    <span className="text-emerald-400 text-[11px] block">✓ Proof Screenshot Uploaded</span>
                  </div>
                ) : (
                  <p className="text-slate-400">Awaiting opponent whistle upload...</p>
                )}
              </div>

              {/* Match Resolution Status */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                <span className="font-bold text-white block mb-1">Escrow Resolution Protocol:</span>
                <p className="text-slate-400">
                  When both players submit agreeing scores, the $18.40 prize pool is released automatically within 500ms. If submissions contradict each other, funds remain frozen in escrow and a human arbiter reviews both screenshots.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Score Submission & Dispute Center */}
        <div className="space-y-4">
          
          {/* Main Action Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Match Outcome Actions</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Once you have finished the 90-minute match in {match.gameType}, take a screenshot of the final score screen and submit it below.
            </p>

            <button
              onClick={onSubmitScore}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Result & Screenshot</span>
            </button>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={onOpenDispute}
                className="w-full py-2.5 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-rose-800/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Report Foul Play / Dispute Match</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Helper (For Testing/Demonstrating Full Platform Workflow) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-3">
            <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
              Simulate Opponent Actions (Demo Mode)
            </span>
            <p className="text-slate-400 text-[11px]">
              Trigger opponent behavior to observe automated escrow settlement or dispute handling:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onSimulateOpponentScore(2, 1)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium text-left px-3 flex items-center justify-between transition-colors"
              >
                <span>Opponent confirms you won 2 - 1</span>
                <span className="text-emerald-400 font-bold">Auto-Payout</span>
              </button>

              <button
                onClick={() => onSimulateOpponentScore(1, 3)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium text-left px-3 flex items-center justify-between transition-colors"
              >
                <span>Opponent claims they won 3 - 1</span>
                <span className="text-rose-400 font-bold">Dispute Freeze</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
