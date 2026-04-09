import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════ */
const ADMIN_EMAIL = "admin@foxycloud.app";
const ADMIN_PASSWORD = "FoxyCloud@Admin2024";
const API = "/api";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
interface Bot {
  id: string;
  name: string;
  description: string;
  icon: string;
  pairLink: string;
  repoUrl: string;
  createdAt: number;
}

interface User {
  name: string;
  email: string;
  role?: "admin" | "user";
}

interface Deployment {
  id: string;
  botId: string;
  botName: string;
  botIcon: string;
  status: "cloning" | "installing" | "running" | "error" | "stopped";
  createdAt: number;
  error?: string;
  logCount?: number;
}

type View = "landing" | "bots" | "dashboard" | "deploy" | "admin" | "logs";

/* ═══════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════ */
function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem("fc_user") || "null"); } catch { return null; }
}
function saveUser(u: User) { localStorage.setItem("fc_user", JSON.stringify(u)); }
function clearUser() { localStorage.removeItem("fc_user"); }

const DEFAULT_BOTS: Bot[] = [
  {
    id: "webfoxy",
    name: "Webfoxy",
    description: "The original Foxy Bot — 200+ WhatsApp commands, AI chat, games, stickers, media tools and more.",
    icon: "🦊",
    pairLink: "",
    repoUrl: "https://github.com/wolfix-bots/Webfoxy",
    createdAt: Date.now(),
  },
];
function loadBots(): Bot[] {
  try { const s = localStorage.getItem("fc_bots"); return s ? JSON.parse(s) : DEFAULT_BOTS; } catch { return DEFAULT_BOTS; }
}
function saveBots(b: Bot[]) { localStorage.setItem("fc_bots", JSON.stringify(b)); }

function uid() { return Math.random().toString(36).slice(2, 10); }

/* ═══════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════ */
async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}
async function apiDelete(path: string) {
  const r = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ═══════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════ */
function Particles() {
  const colors = ["#ff00ff","#00ffff","#ff6600","#00ff88","#8800ff","#ff00aa","#00aaff"];
  const items = Array.from({ length: 22 }, (_, i) => ({
    id: i, left: `${(i * 4.6) % 100}%`,
    w: `${(i % 4) + 1}px`, h: `${(i % 4) + 1}px`,
    color: colors[i % colors.length],
    dur: `${(i % 10) + 12}s`, delay: `${(i * 0.7) % 8}s`,
  }));
  return (
    <>{items.map(p => (
      <div key={p.id} className="particle" style={{ left: p.left, width: p.w, height: p.h, background: p.color, boxShadow: `0 0 6px ${p.color}`, animationDuration: p.dur, animationDelay: p.delay }} />
    ))}</>
  );
}

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
function Nav({ user, view, onView, onLogin, onLogout }: {
  user: User | null; view: View;
  onView: (v: View) => void; onLogin: () => void; onLogout: () => void;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => onView("landing")} className="flex items-center gap-2 focus:outline-none">
          <span className="text-2xl animate-float" style={{ display: "inline-block" }}>🦊</span>
          <span className="gradient-text font-black text-xl tracking-tight">FoxyCloud</span>
        </button>

        {user ? (
          <>
            {/* Desktop links */}
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => onView("bots")} className={`nav-link ${view === "bots" ? "!text-white" : ""}`}>Bots</button>
              <button onClick={() => onView("dashboard")} className={`nav-link ${view === "dashboard" || view === "logs" ? "!text-white" : ""}`}>Dashboard</button>
              {user.role === "admin" && (
                <button onClick={() => onView("admin")} className={`nav-link ${view === "admin" ? "!text-purple-400" : "text-purple-400/60 hover:!text-purple-400"}`}>
                  ⚙ Admin
                </button>
              )}
              <button onClick={onLogout} className="ml-3 px-3 py-1.5 rounded-lg text-sm text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-all">
                Logout
              </button>
            </div>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden text-white/60 hover:text-white transition-colors text-lg">
              {mobileMenu ? "✕" : "☰"}
            </button>
          </>
        ) : (
          <button onClick={onLogin} className="btn-neon px-5 py-2 rounded-lg text-white font-semibold text-sm">
            Get Started
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {user && mobileMenu && (
        <div className="sm:hidden glass border-t border-white/5 px-5 py-4 space-y-2 animate-slide-up">
          {[
            { label: "Bots", view: "bots" as View },
            { label: "Dashboard", view: "dashboard" as View },
            ...(user.role === "admin" ? [{ label: "⚙ Admin", view: "admin" as View }] : []),
          ].map(({ label, view: v }) => (
            <button key={v} onClick={() => { onView(v); setMobileMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${view === v ? "text-white bg-white/5" : "text-white/50 hover:text-white"}`}>
              {label}
            </button>
          ))}
          <button onClick={() => { onLogout(); setMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-400/60 hover:text-red-400 transition-all">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   LANDING
═══════════════════════════════════════════ */
function Landing({ bots, onStart }: { bots: Bot[]; onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="animate-slide-up">
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto animate-float" style={{ background: "linear-gradient(135deg,rgba(128,0,255,.2),rgba(0,255,255,.1))", border: "1px solid rgba(128,0,255,.4)", boxShadow: "0 0 60px rgba(128,0,255,.3)" }}>🦊</div>
          <div className="absolute rounded-full animate-spin-slow" style={{ width: 140, height: 140, top: -6, left: -6, border: "1px solid transparent", background: "linear-gradient(135deg,#ff00ff33,#00ffff33,#ff660033,#00ff8833) border-box", WebkitMask: "linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0)", WebkitMaskComposite: "destination-out", maskComposite: "exclude" }} />
        </div>
        <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none"><span className="gradient-text">FoxyCloud</span></h1>
        <p className="text-white/50 text-xl max-w-xl mx-auto mb-3 font-light">Your WhatsApp bot. Always online. Fully managed.</p>
        <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
          Choose a bot, paste your session ID — we clone the code, set up the environment, and keep it running 24/7 on our servers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="btn-neon px-8 py-3.5 rounded-xl text-white font-bold text-lg w-full sm:w-auto">🚀 Deploy Your Bot</button>
        </div>
      </div>

      {bots.length > 0 && (
        <div className="mt-20 max-w-4xl w-full">
          <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-6">Available Bots</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.slice(0, 3).map((bot, i) => (
              <div key={bot.id} className="glass card-glow rounded-2xl p-6 text-left neon-border animate-slide-up" style={{ animationDelay: `${0.1*(i+1)}s`, opacity: 0 }}>
                <div className="text-3xl mb-3">{bot.icon || "🤖"}</div>
                <h3 className="text-white font-semibold mb-1">{bot.name}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{bot.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {[["24/7","Uptime"],["Free","To Start"],["Managed","Hosting"]].map(([v,l]) => (
          <div key={l} className="text-center">
            <div className="gradient-text text-2xl font-black">{v}</div>
            <div className="text-white/30 text-xs mt-1">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOT LIST
═══════════════════════════════════════════ */
function BotList({ bots, onDeploy }: { bots: Bot[]; onDeploy: (bot: Bot) => void }) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12 animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-black mb-2"><span className="gradient-text">Choose Your Bot</span></h2>
        <p className="text-white/40 text-sm">Select a bot to deploy on FoxyCloud. Your session ID is all you need.</p>
      </div>
      {bots.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-4">🤖</div>
          <p>No bots available yet. The admin will add bots soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map((bot, i) => (
            <div key={bot.id} className="glass card-glow neon-border rounded-2xl p-6 flex flex-col animate-slide-up" style={{ animationDelay: `${0.08*i}s`, opacity: 0 }}>
              <div className="text-4xl mb-4">{bot.icon || "🤖"}</div>
              <h3 className="text-white font-bold text-lg mb-2">{bot.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed flex-1 mb-5">{bot.description}</p>
              {bot.repoUrl && (
                <a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-white/25 text-xs hover:text-white/50 transition-colors mb-4 flex items-center gap-1">
                  📂 View source
                </a>
              )}
              <button onClick={() => onDeploy(bot)} className="btn-neon w-full py-3 rounded-xl text-white font-semibold text-sm">
                🚀 Deploy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEPLOY FLOW
═══════════════════════════════════════════ */
function DeployFlow({ bot, user, onDone, onBack }: { bot: Bot; user: User; onDone: (dep: Deployment) => void; onBack: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setError("");
    const sid = sessionId.trim();
    if (!sid) return setError("Please enter your Session ID.");
    if (sid.length < 8) return setError("That doesn't look like a valid session ID.");
    if (!bot.repoUrl) return setError("This bot has no repository URL configured. Contact the admin.");

    setDeploying(true);
    setStep(3);

    try {
      const result = await apiPost<{ id: string; status: string }>("/bots/deploy", {
        sessionId: sid,
        repoUrl: bot.repoUrl,
        botId: bot.id,
        botName: bot.name,
        botIcon: bot.icon,
        userEmail: user.email,
      });

      onDone({
        id: result.id,
        botId: bot.id,
        botName: bot.name,
        botIcon: bot.icon,
        status: "cloning",
        createdAt: Date.now(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Deploy failed: ${msg}`);
      setDeploying(false);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="animate-slide-up">
        <button onClick={onBack} className="text-white/40 text-sm hover:text-white/70 transition-colors mb-8 flex items-center gap-2">
          ← Back to bots
        </button>
        <div className="flex items-center gap-4 mb-10">
          <div className="text-5xl">{bot.icon || "🤖"}</div>
          <div>
            <h2 className="text-2xl font-black text-white">Deploy {bot.name}</h2>
            <p className="text-white/40 text-sm">Hosted on FoxyCloud — zero maintenance</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10">
          {[1,2,3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= n ? "btn-neon text-white" : "glass text-white/30 border border-white/10"}`}>
                {step > n ? "✓" : n}
              </div>
              {n < 3 && <div className={`h-px w-8 sm:w-14 transition-all ${step > n ? "bg-purple-500" : "bg-white/10"}`} />}
            </div>
          ))}
          <span className="ml-2 text-white/30 text-xs">{step===1?"Get Session ID":step===2?"Enter Session ID":"Deploying..."}</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="glass neon-border card-glow rounded-2xl p-6 animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2">Step 1 — Get Your Session ID</h3>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Open the pairing page, scan the QR code or enter your phone number, then copy the session ID you get. It will look like <code className="text-purple-400 font-mono">FOXY-BOT:xxxxxxxx...</code>
            </p>
            {bot.pairLink ? (
              <a href={bot.pairLink} target="_blank" rel="noopener noreferrer" className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm">
                📱 Open Pairing Page
              </a>
            ) : (
              <div className="p-4 rounded-xl mb-2" style={{ background:"rgba(255,160,0,.05)", border:"1px solid rgba(255,160,0,.2)" }}>
                <p className="text-yellow-400/70 text-sm">Pairing link not set up yet — contact the admin. You can still continue if you already have your session ID.</p>
              </div>
            )}
            <button onClick={() => setStep(2)} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-5">
              I have my Session ID →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="glass neon-border card-glow rounded-2xl p-6 animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2">Step 2 — Enter Session ID</h3>
            <p className="text-white/40 text-sm mb-5">
              This will be saved as <code className="text-purple-400 font-mono">SESSION_ID=...</code> in the bot's <code className="text-purple-400 font-mono">.env</code> file on our server.
            </p>
            <label className="field-label">Session ID</label>
            <textarea className="input-neon w-full rounded-xl px-4 py-3 text-sm font-mono resize-none h-24 mt-1" placeholder="FOXY-BOT:xxxxxxxxxxxxxxxx..." value={sessionId} onChange={e => setSessionId(e.target.value)} />
            {sessionId.trim() && (
              <div className="mt-3 p-3 rounded-xl" style={{ background:"rgba(0,255,136,.04)", border:"1px solid rgba(0,255,136,.15)" }}>
                <p className="text-green-400/60 text-xs font-semibold mb-1">.env that will be created on our server:</p>
                <code className="text-white/50 text-xs font-mono">SESSION_ID={sessionId.trim()}</code>
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl text-white/40 border border-white/10 hover:border-white/30 hover:text-white transition-all text-sm">← Back</button>
              <button onClick={handleDeploy} disabled={deploying || !sessionId.trim()} className="btn-neon flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-30">
                ☁️ Deploy on FoxyCloud
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="glass neon-border card-glow rounded-2xl p-8 text-center animate-slide-up">
            <div className="text-5xl mb-4 animate-float" style={{ display:"inline-block" }}>🚀</div>
            <h3 className="text-white font-bold text-xl mb-2">Deploying {bot.name}...</h3>
            <p className="text-white/40 text-sm mb-8">
              We're cloning the repo, writing your <code className="text-purple-400 font-mono">.env</code>, running <code className="text-purple-400 font-mono">npm install && npm start</code>. Check your dashboard for live logs.
            </p>
            <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,.05)" }}>
              <div className="h-full btn-neon rounded-full animate-progress" />
            </div>
            <p className="text-white/20 text-xs mt-4">Cloning repo → Writing .env → npm install → npm start</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function Dashboard({ user, onManage, onViewLogs }: {
  user: User; onManage: () => void; onViewLogs: (id: string) => void;
}) {
  const [deps, setDeps] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeps = async () => {
    try {
      const data = await apiGet<Deployment[]>(`/bots?userEmail=${encodeURIComponent(user.email)}`);
      setDeps(data);
    } catch { /* server may not be up yet */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeps();
    const t = setInterval(fetchDeps, 4000);
    return () => clearInterval(t);
  }, []);

  const stopBot = async (id: string) => {
    try { await apiDelete(`/bots/${id}`); fetchDeps(); } catch {}
  };

  const statusColor = (s: string) =>
    s === "running" ? "text-green-400" : s === "installing" || s === "cloning" ? "text-yellow-400" : s === "error" ? "text-red-400" : "text-white/30";
  const statusDot = (s: string) =>
    s === "running" ? "bg-green-400 animate-pulse" : s === "installing" || s === "cloning" ? "bg-yellow-400 animate-pulse" : s === "error" ? "bg-red-400" : "bg-white/20";
  const statusLabel: Record<string, string> = { cloning: "Cloning…", installing: "Installing…", running: "Running", error: "Error", stopped: "Stopped" };

  const fmt = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black"><span className="gradient-text">My Dashboard</span></h2>
          <p className="text-white/40 text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={onManage} className="btn-neon px-5 py-2.5 rounded-xl text-white font-semibold text-sm">+ Deploy New Bot</button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/30 animate-pulse">Loading deployments...</div>
      ) : deps.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center animate-slide-up" style={{ border:"1px solid rgba(255,255,255,.05)" }}>
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-white/30 text-sm mb-5">No deployments yet. Deploy your first bot!</p>
          <button onClick={onManage} className="btn-neon px-6 py-2.5 rounded-xl text-white font-semibold text-sm">Browse Bots →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {deps.map((dep, i) => (
            <div key={dep.id} className="glass card-glow rounded-2xl p-5 animate-slide-up" style={{ animationDelay:`${0.06*i}s`, opacity:0, border:"1px solid rgba(255,255,255,.06)" }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{dep.botIcon || "🤖"}</div>
                  <div>
                    <div className="text-white font-semibold">{dep.botName}</div>
                    <div className="text-white/25 text-xs mt-0.5">Deployed {fmt(dep.createdAt)}</div>
                    {dep.error && <div className="text-red-400/70 text-xs mt-1">⚠ {dep.error.slice(0, 60)}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusDot(dep.status)}`} />
                    <span className={`text-xs font-medium ${statusColor(dep.status)}`}>{statusLabel[dep.status] || dep.status}</span>
                  </div>
                  <button onClick={() => onViewLogs(dep.id)} className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-all">
                    📋 Logs
                  </button>
                  {dep.status !== "stopped" && (
                    <button onClick={() => stopBot(dep.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400/50 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">
                      ⏹ Stop
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOGS VIEWER
═══════════════════════════════════════════ */
function LogsViewer({ depId, onBack }: { depId: string; onBack: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`${API}/bots/${depId}/logs?stream=true`);
    esRef.current = es;
    setConnected(true);

    es.onmessage = (e) => {
      const d = JSON.parse(e.data) as { line?: string; status?: string; heartbeat?: boolean; done?: boolean };
      if (d.status) setStatus(d.status);
      if (d.line) setLogs(prev => [...prev.slice(-499), d.line!]);
      if (d.done) { es.close(); setConnected(false); }
    };
    es.onerror = () => { es.close(); setConnected(false); };

    return () => { es.close(); };
  }, [depId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const statusColor = status === "running" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="animate-slide-up">
        <button onClick={onBack} className="text-white/40 text-sm hover:text-white/70 transition-colors mb-6 flex items-center gap-2">← Back to dashboard</button>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Live Logs</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
              <span className={`text-xs ${statusColor}`}>{status || "connecting..."}</span>
              <span className="text-white/20 text-xs font-mono">· {depId}</span>
            </div>
          </div>
          <div className="text-white/20 text-xs">{logs.length} lines</div>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(128,0,255,.15)" }}>
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/40" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
            <div className="w-3 h-3 rounded-full bg-green-500/40" />
            <span className="ml-2 text-white/20 text-xs font-mono">foxycloud — bot logs</span>
          </div>
          <div className="h-96 overflow-y-auto p-4 font-mono text-xs leading-relaxed" style={{ background:"rgba(0,0,0,.5)" }}>
            {logs.length === 0 ? (
              <div className="text-white/20 flex items-center gap-2">
                <span className="animate-pulse">▶</span> Waiting for output...
              </div>
            ) : (
              logs.map((line, i) => (
                <div key={i} className={`${line.includes("[err]") || line.includes("❌") ? "text-red-400/80" : line.includes("✅") || line.includes("🦊") ? "text-green-400/80" : line.includes("▶") || line.includes("📝") ? "text-yellow-400/60" : "text-white/50"} whitespace-pre-wrap break-all`}>
                  {line}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {!connected && (
          <div className="mt-4 p-3 rounded-xl text-center text-white/30 text-xs" style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)" }}>
            Stream ended. Reload to reconnect.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════ */
function AdminPanel({ bots, onUpdate }: { bots: Bot[]; onUpdate: (b: Bot[]) => void }) {
  const [editing, setEditing] = useState<Bot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "🤖", pairLink: "", repoUrl: "" });
  const [saved, setSaved] = useState(false);
  const [allDeps, setAllDeps] = useState<Deployment[]>([]);

  useEffect(() => {
    apiGet<Deployment[]>("/bots").then(setAllDeps).catch(() => {});
    const t = setInterval(() => apiGet<Deployment[]>("/bots").then(setAllDeps).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, []);

  const openNew = () => {
    setForm({ name: "", description: "", icon: "🤖", pairLink: "", repoUrl: "" });
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (bot: Bot) => {
    setForm({ name: bot.name, description: bot.description, icon: bot.icon, pairLink: bot.pairLink, repoUrl: bot.repoUrl });
    setEditing(bot);
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const updated = editing
      ? bots.map(b => b.id === editing.id ? { ...b, ...form } : b)
      : [...bots, { id: uid(), ...form, createdAt: Date.now() }];
    saveBots(updated);
    onUpdate(updated);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleDelete = (id: string) => {
    const updated = bots.filter(b => b.id !== id);
    saveBots(updated);
    onUpdate(updated);
  };

  const statusDot = (s: string) => s === "running" ? "bg-green-400" : s === "cloning" || s === "installing" ? "bg-yellow-400" : "bg-red-400/60";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black"><span className="gradient-text">Admin Panel</span></h2>
          <p className="text-white/40 text-sm mt-1">Manage bots, pair links, repositories, and deployments</p>
        </div>
        <button onClick={openNew} className="btn-neon px-5 py-2.5 rounded-xl text-white font-bold text-sm">+ Add Bot</button>
      </div>

      {saved && <div className="mb-6 p-3 rounded-xl text-green-400 text-sm animate-slide-up" style={{ background:"rgba(0,255,136,.04)", border:"1px solid rgba(0,255,136,.2)" }}>✅ Saved</div>}

      {/* Bot cards */}
      <h3 className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">Bot Registry</h3>
      <div className="space-y-3 mb-10">
        {bots.length === 0 && <div className="glass rounded-2xl p-8 text-center text-white/25 text-sm" style={{ border:"1px solid rgba(255,255,255,.04)" }}>No bots yet. Click "+ Add Bot".</div>}
        {bots.map((bot, i) => (
          <div key={bot.id} className="glass card-glow rounded-2xl p-5 animate-slide-up" style={{ animationDelay:`${0.06*i}s`, opacity:0, border:"1px solid rgba(255,255,255,.06)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{bot.icon || "🤖"}</div>
                <div>
                  <div className="text-white font-bold">{bot.name}</div>
                  <div className="text-white/35 text-xs mt-0.5 max-w-sm">{bot.description || "No description"}</div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {bot.pairLink
                      ? <a href={bot.pairLink} target="_blank" rel="noopener noreferrer" className="text-purple-400/60 text-xs hover:text-purple-400 transition-colors">📱 Pair link ↗</a>
                      : <span className="text-yellow-400/40 text-xs">📱 No pair link</span>}
                    {bot.repoUrl
                      ? <a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400/60 text-xs hover:text-blue-400 transition-colors">📂 Repo ↗</a>
                      : <span className="text-white/20 text-xs">📂 No repo</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(bot)} className="px-4 py-2 rounded-xl text-sm text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-all">Edit</button>
                <button onClick={() => handleDelete(bot.id)} className="px-4 py-2 rounded-xl text-sm text-red-400/50 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live deployments */}
      <h3 className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">Live Deployments ({allDeps.length})</h3>
      <div className="space-y-2 mb-8">
        {allDeps.length === 0 && <div className="glass rounded-xl p-4 text-center text-white/25 text-xs" style={{ border:"1px solid rgba(255,255,255,.04)" }}>No active deployments</div>}
        {allDeps.map(dep => (
          <div key={dep.id} className="glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-3" style={{ border:"1px solid rgba(255,255,255,.05)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{dep.botIcon || "🤖"}</span>
              <div>
                <div className="text-white text-sm font-medium">{dep.botName}</div>
                <div className="text-white/25 text-xs font-mono">{dep.userEmail} · {dep.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusDot(dep.status)}`} />
              <span className="text-white/40 text-xs capitalize">{dep.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Credentials */}
      <div className="glass rounded-2xl p-5 animate-slide-up delay-300" style={{ border:"1px solid rgba(128,0,255,.12)" }}>
        <h3 className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">⚙ Admin Credentials</h3>
        <p className="text-white/25 text-xs leading-relaxed">
          Email: <code className="text-purple-400/60 font-mono">{ADMIN_EMAIL}</code><br />
          Password is set in source code as <code className="text-purple-400/60 font-mono">ADMIN_PASSWORD</code>.
        </p>
      </div>

      {/* Bot form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg neon-border rounded-2xl p-7 glass animate-slide-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>
            <h3 className="gradient-text font-black text-xl mb-6">{editing ? "Edit Bot" : "Add New Bot"}</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="field-label">Icon</label>
                  <input className="input-neon w-full rounded-xl px-3 py-3 text-center text-xl" value={form.icon} onChange={e => setForm({...form, icon:e.target.value})} placeholder="🤖" />
                </div>
                <div className="flex-1">
                  <label className="field-label">Bot Name *</label>
                  <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Webfoxy" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea className="input-neon w-full rounded-xl px-4 py-3 text-sm resize-none h-20" placeholder="What can this bot do?" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Pair Link URL <span className="text-white/25 font-normal normal-case tracking-normal ml-1">— where users scan to get session ID</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://..." value={form.pairLink} onChange={e => setForm({...form, pairLink:e.target.value})} />
              </div>
              <div>
                <label className="field-label">Repository URL <span className="text-white/25 font-normal normal-case tracking-normal ml-1">— GitHub repo to clone and run</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://github.com/..." value={form.repoUrl} onChange={e => setForm({...form, repoUrl:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-white/40 border border-white/10 hover:border-white/30 transition-all text-sm">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn-neon flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-30">
                {editing ? "Save Changes" : "Add Bot"} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════ */
function AuthModal({ onSuccess, onClose }: { onSuccess: (u: User) => void; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const em = email.trim().toLowerCase();
    const pw = password.trim();

    if (em === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
      const admin: User = { name: "Admin", email: ADMIN_EMAIL, role: "admin" };
      saveUser(admin);
      return onSuccess(admin);
    }

    if (mode === "register") {
      if (!name.trim() || !em || !pw) return setError("All fields are required.");
      if (pw.length < 6) return setError("Password must be at least 6 characters.");
      if (localStorage.getItem(`fc_acc_${em}`)) return setError("Account already exists.");
      localStorage.setItem(`fc_acc_${em}`, JSON.stringify({ name: name.trim(), password: pw }));
      const u: User = { name: name.trim(), email: em, role: "user" };
      saveUser(u);
      return onSuccess(u);
    } else {
      if (!em || !pw) return setError("Email and password are required.");
      const stored = localStorage.getItem(`fc_acc_${em}`);
      if (!stored) return setError("No account found. Please register first.");
      const acc = JSON.parse(stored);
      if (acc.password !== pw) return setError("Incorrect password.");
      const u: User = { name: acc.name, email: em, role: "user" };
      saveUser(u);
      return onSuccess(u);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md neon-border rounded-2xl p-8 glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 animate-float" style={{ display:"inline-block" }}>🦊</div>
          <h2 className="gradient-text font-black text-2xl">{mode==="login"?"Welcome Back":"Create Account"}</h2>
          <p className="text-white/35 text-sm mt-1">{mode==="login"?"Login to manage your bots":"Join FoxyCloud today"}</p>
        </div>
        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="field-label">Your Name</label>
              <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="field-label">Email</label>
            <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
        <button onClick={submit} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-6">
          {mode==="login"?"Login →":"Create Account →"}
        </button>
        <p className="text-center text-white/25 text-sm mt-4">
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); }} className="text-purple-400 hover:text-purple-300 transition-colors">
            {mode==="login"?"Register":"Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [view, setView] = useState<View>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [viewingLogId, setViewingLogId] = useState<string | null>(null);

  useEffect(() => {
    setUser(loadUser());
    setBots(loadBots());
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setShowAuth(false);
    // Admin goes straight to admin panel, users go to bot list
    setView(u.role === "admin" ? "admin" : "bots");
  };

  const handleLogout = () => { clearUser(); setUser(null); setView("landing"); };

  const handleDeploy = (bot: Bot) => {
    if (!user) { setShowAuth(true); return; }
    setSelectedBot(bot);
    setView("deploy");
  };

  const handleDeployDone = (dep: Deployment) => {
    setViewingLogId(dep.id);
    setView("logs");
  };

  const goView = (v: View) => {
    if ((v === "bots" || v === "dashboard" || v === "admin" || v === "logs") && !user) {
      setShowAuth(true);
      return;
    }
    if (v === "admin" && user?.role !== "admin") return;
    setView(v);
  };

  return (
    <div className="neon-bg min-h-screen relative overflow-x-hidden">
      <Particles />
      <Nav user={user} view={view} onView={goView} onLogin={() => setShowAuth(true)} onLogout={handleLogout} />

      {view === "landing" && <Landing bots={bots} onStart={() => { if(user) setView("bots"); else setShowAuth(true); }} />}
      {view === "bots" && user && <BotList bots={bots} onDeploy={handleDeploy} />}
      {view === "dashboard" && user && <Dashboard user={user} onManage={() => setView("bots")} onViewLogs={id => { setViewingLogId(id); setView("logs"); }} />}
      {view === "deploy" && user && selectedBot && <DeployFlow bot={selectedBot} user={user} onDone={handleDeployDone} onBack={() => setView("bots")} />}
      {view === "logs" && viewingLogId && <LogsViewer depId={viewingLogId} onBack={() => setView("dashboard")} />}
      {view === "admin" && user?.role === "admin" && <AdminPanel bots={bots} onUpdate={setBots} />}

      {showAuth && <AuthModal onSuccess={handleLogin} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
