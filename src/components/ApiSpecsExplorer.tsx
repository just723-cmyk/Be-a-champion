import React, { useState } from 'react';
import { 
  POSTGRESQL_DDL_SCHEMA, 
  NODEJS_EXPRESS_CONTROLLERS, 
  WEBSOCKET_EVENT_GATEWAY 
} from '../data/specsData';
import { 
  Database, 
  Server, 
  Radio, 
  Smartphone, 
  Copy, 
  Check, 
  Play, 
  Code2, 
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ApiSpecsExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SANDBOX' | 'DATABASE' | 'EXPRESS_API' | 'WEBSOCKET' | 'MOBILE_SPECS'>('SANDBOX');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<'JOIN' | 'SUBMIT' | 'DISPUTE'>('JOIN');
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify({
      fixtureId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      idempotencyKey: "tx_idem_99824817294821",
    }, null, 2)
  );
  const [sandboxResponse, setSandboxResponse] = useState<{
    status: number;
    latencyMs: number;
    data: any;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSelectEndpoint = (ep: 'JOIN' | 'SUBMIT' | 'DISPUTE') => {
    setSandboxEndpoint(ep);
    if (ep === 'JOIN') {
      setSandboxPayload(JSON.stringify({
        fixtureId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        idempotencyKey: `tx_idem_${Date.now()}`,
      }, null, 2));
    } else if (ep === 'SUBMIT') {
      setSandboxPayload(JSON.stringify({
        playerScore: 2,
        opponentScore: 1,
        screenshotUrl: "https://storage.apexpitch.gg/proofs/mtc_8921_p1_final.png",
        notes: "Won 2-1 in regular time, clean game.",
      }, null, 2));
    } else if (ep === 'DISPUTE') {
      setSandboxPayload(JSON.stringify({
        reason: "WRONG_SCORE",
        description: "Opponent reported 3-1 win, but I won 2-1. Attached full-time match statistics screenshot proving possession and scoreline.",
        evidenceScreenshotUrl: "https://storage.apexpitch.gg/disputes/mtc_8921_proof.png",
      }, null, 2));
    }
    setSandboxResponse(null);
  };

  const handleExecuteSandbox = () => {
    setIsExecuting(true);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(sandboxPayload);
        if (sandboxEndpoint === 'JOIN') {
          setSandboxResponse({
            status: 200,
            latencyMs: 84,
            data: {
              success: true,
              message: "Successfully joined fixture. Funds locked in escrow.",
              matchId: "mtc_8921_uuid",
              roomCode: "DLS-ROOM-7492",
              status: "LIVE",
              escrowDetails: {
                stakedAmount: 10.00,
                currency: "USD",
                totalPrizePool: 18.40,
                platformRake: 1.60,
              },
            },
          });
        } else if (sandboxEndpoint === 'SUBMIT') {
          setSandboxResponse({
            status: 200,
            latencyMs: 112,
            data: {
              status: "MUTUAL_CONFIRMED",
              message: "Both scores matched! Cash prize released to winner instantly.",
              winnerId: "usr_882910a",
              prizeAwarded: 18.40,
              payoutTransactionId: "tx_payout_8829",
              eloUpdate: {
                previousRating: 1640,
                newRating: 1658,
                delta: "+18",
              },
            },
          });
        } else if (sandboxEndpoint === 'DISPUTE') {
          setSandboxResponse({
            status: 201,
            latencyMs: 95,
            data: {
              success: true,
              message: "Dispute opened. Escrow funds locked. An admin arbiter is reviewing screenshot evidence.",
              disputeId: "dsp_9921_uuid",
              matchStatus: "DISPUTED",
              escrowStatus: "FROZEN_PENDING_ARBITRATION",
              estimatedReviewTimeMinutes: 15,
            },
          });
        }
      } catch (e: any) {
        setSandboxResponse({
          status: 400,
          latencyMs: 12,
          data: { error: "Malformed JSON payload in request body", details: e.message },
        });
      }
      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Code2 className="w-4 h-4" />
          <span>Esports Platform Architecture Specifications</span>
          <span>·</span>
          <span>Node.js / Express · PostgreSQL · WebSockets</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Database Models, REST APIs & WebSocket Specs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Production-grade database schema, double-entry escrow locking controllers, mutual score verification, and interactive API execution sandbox.
        </p>
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('SANDBOX')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SANDBOX'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5 stroke-[3]" />
          <span>Live API Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'DATABASE'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema DDL</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPRESS_API')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EXPRESS_API'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Express REST Controllers</span>
        </button>

        <button
          onClick={() => setActiveTab('WEBSOCKET')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'WEBSOCKET'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>WebSocket Real-Time Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('MOBILE_SPECS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MOBILE_SPECS'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>React Native / Flutter Specs</span>
        </button>
      </div>

      {/* Tab 1: Live Interactive API Sandbox */}
      {activeTab === 'SANDBOX' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">Interactive REST API Request Tester</h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an endpoint below to test database locking, mutual score verification, or dispute arbitration with live JSON input/output.
            </p>

            {/* Endpoint Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleSelectEndpoint('JOIN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
                  sandboxEndpoint === 'JOIN'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span className="font-bold text-emerald-400">POST</span>
                <span>/fixtures/join</span>
              </button>

              <button
                onClick={() => handleSelectEndpoint('SUBMIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
                  sandboxEndpoint === 'SUBMIT'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span className="font-bold text-emerald-400">POST</span>
                <span>/matches/:id/submit-result</span>
              </button>

              <button
                onClick={() => handleSelectEndpoint('DISPUTE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
                  sandboxEndpoint === 'DISPUTE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span className="font-bold text-rose-400">POST</span>
                <span>/matches/:id/dispute</span>
              </button>
            </div>

            {/* Sandbox Split: Request Editor & Live Response */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Request Payload Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Request Body (application/json)</span>
                  <span className="font-mono text-[11px] text-slate-500">Bearer &lt;JWT_TOKEN&gt;</span>
                </div>
                <textarea
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  rows={9}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleExecuteSandbox}
                  disabled={isExecuting}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Simulating Database Transaction...' : 'Send API Request'}</span>
                </button>
              </div>

              {/* Response Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Simulated Server Response</span>
                  {sandboxResponse && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded ${
                        sandboxResponse.status === 200 || sandboxResponse.status === 201 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        HTTP {sandboxResponse.status}
                      </span>
                      <span className="text-slate-500">{sandboxResponse.latencyMs}ms</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-[240px] overflow-y-auto text-xs font-mono">
                  {sandboxResponse ? (
                    <pre className="text-slate-200">
                      {JSON.stringify(sandboxResponse.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                      <Play className="w-6 h-6 mb-2 opacity-50" />
                      <span>Click "Send API Request" to execute</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Transaction Blueprint Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <Lock className="w-4 h-4" />
                <span>FOR UPDATE Row-Locking</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents double-spending and race conditions when two players attempt to accept a single open fixture concurrently.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mutual Consensus Engine</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Releases escrow funds only when both players independently confirm identical scores. Zero delays when no disputes occur.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Idempotency Protection</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every wallet debit enforces an idempotency key, preventing repeated deductions during mobile network retries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL Schema DDL */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">PostgreSQL 15+ Production DDL Schema</h3>
              <p className="text-xs text-slate-400">Strict constraints, NUMERIC(12, 2) financial precision, and index definitions.</p>
            </div>
            <button
              onClick={() => handleCopy(POSTGRESQL_DDL_SCHEMA, 'ddl')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'ddl' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
            <pre>{POSTGRESQL_DDL_SCHEMA}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: Express REST Controllers */}
      {activeTab === 'EXPRESS_API' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Node.js Express + TypeScript Controllers</h3>
              <p className="text-xs text-slate-400">ACID transactions, escrow locks, score consensus, and ELO ratings calculation.</p>
            </div>
            <button
              onClick={() => handleCopy(NODEJS_EXPRESS_CONTROLLERS, 'controllers')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'controllers' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Code</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy TypeScript</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
            <pre>{NODEJS_EXPRESS_CONTROLLERS}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: WebSocket Real-Time Gateway */}
      {activeTab === 'WEBSOCKET' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">WebSocket Real-Time Event Architecture</h3>
              <p className="text-xs text-slate-400">Socket.io / WS contracts for lobby synchronization, opponent chat, and score notifications.</p>
            </div>
            <button
              onClick={() => handleCopy(WEBSOCKET_EVENT_GATEWAY, 'websocket')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'websocket' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Specs</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Events</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
            <pre>{WEBSOCKET_EVENT_GATEWAY}</pre>
          </div>
        </div>
      )}

      {/* Tab 5: Mobile App Architecture (React Native / Flutter) */}
      {activeTab === 'MOBILE_SPECS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Mobile Architecture (React Native & Flutter)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For native mobile tournament execution in Dream League Soccer and EA FC Mobile, specific device-level capabilities must be integrated:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">1. In-App Match Deep Linking</h4>
                <p className="text-slate-300">
                  When a match room is confirmed, trigger custom URI schemes or Android Intent actions to open the game directly:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300">
                  <code>Linking.openURL('dls://friendmatch?code=7492');</code>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Copies the opponent's GamerTag ID to clipboard automatically before launching DLS or FC Mobile.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">2. Anti-Tamper Screenshot Verification</h4>
                <p className="text-slate-300">
                  To prevent players from uploading fake or old screenshots downloaded from Google Images:
                </p>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Validate EXIF creation timestamp is within &lt; 20 minutes of match start.</li>
                  <li>Perform on-device perceptual hash (pHash) against known screenshot database.</li>
                  <li>Server-side OCR extracting final score and player gamer tags from image canvas.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">3. Mobile State Management (Zustand / Riverpod)</h4>
                <p className="text-slate-300">
                  Persistent wallet state with offline-first event queue and optimistic room updates:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300">
                  <code>useTournamentStore(state =&gt; state.activeMatch);</code>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">4. Mobile Money (M-Pesa STK Push)</h4>
                <p className="text-slate-300">
                  DLS & FC Mobile have massive player bases in Africa and LatAm. The Flutter/React Native app integrates Daraja M-Pesa STK push for instant 1-tap mobile money deposits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
