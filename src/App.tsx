import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const ADMIN_EMAIL = "admin@foxycloud.app";
const ADMIN_PASSWORD = "FoxyCloud@Admin2024";

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
  sessionId: string;
  status: "deploying" | "running" | "stopped";
  createdAt: number;
}

/* ═══════════════════════════════════════════
   STORAGE UTILITIES
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
  try {
    const stored = localStorage.getItem("fc_bots");
    return stored ? JSON.parse(stored) : DEFAULT_BOTS;
  } catch { return DEFAULT_BOTS; }
}
function saveBots(bots: Bot[]) { localStorage.setItem("fc_bots", JSON.stringify(bots)); }

function loadDeployments(email: string): Deployment[] {
  try { return JSON.parse(localStorage.getItem(`fc_deps_${email}`) || "[]"); } catch { return []; }
}
function saveDeployments(email: string, deps: Deployment[]) {
  localStorage.setItem(`fc_deps_${email}`, JSON.stringify(deps));
}

function uid() { return Math.random().toString(36).slice(2, 10); }

/* ═══════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════ */
function Particles() {
  const colors = ["#ff00ff", "#00ffff", "#ff6600", "#00ff88", "#8800ff", "#ff00aa", "#00aaff"];
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 4.5) % 100}%`,
    width: `${(i % 4) + 1}px`,
    height: `${(i % 4) + 1}px`,
    color: colors[i % colors.length],
    duration: `${(i % 10) + 12}s`,
    delay: `${(i * 0.7) % 8}s`,
  }));
  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.width, height: p.height, background: p.color, boxShadow: `0 0 6px ${p.color}`, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
type View = "landing" | "bots" | "dashboard" | "deploy" | "admin";

function Nav({ user, view, onView, onLogin, onLogout }: {
  user: User | null; view: View;
  onView: (v: View) => void; onLogin: () => void; onLogout: () => void;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 glass border-b border-white/5">
      <button onClick={() => onView("landing")} className="flex items-center gap-2 focus:outline-none">
        <span className="text-2xl animate-float" style={{ display: "inline-block" }}>🦊</span>
        <span className="gradient-text font-black text-xl tracking-tight">FoxyCloud</span>
      </button>
      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <button onClick={() => onView("bots")} className={`nav-link hidden sm:block ${view === "bots" ? "text-white" : ""}`}>Bots</button>
            <button onClick={() => onView("dashboard")} className={`nav-link hidden sm:block ${view === "dashboard" ? "text-white" : ""}`}>Dashboard</button>
            {user.role === "admin" && (
              <button onClick={() => onView("admin")} className={`nav-link hidden sm:block ${view === "admin" ? "text-purple-400" : "text-purple-400/60"}`}>⚙ Admin</button>
            )}
            <button onClick={onLogout} className="px-3 py-1.5 rounded-lg text-sm text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-all">
              Logout
            </button>
          </>
        ) : (
          <button onClick={onLogin} className="btn-neon px-5 py-2 rounded-lg text-white font-semibold text-sm">
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   LANDING
═══════════════════════════════════════════ */
function Landing({ bots, onStart, onViewBots }: { bots: Bot[]; onStart: () => void; onViewBots: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="animate-slide-up">
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto animate-float" style={{ background: "linear-gradient(135deg,rgba(128,0,255,.2),rgba(0,255,255,.1))", border: "1px solid rgba(128,0,255,.4)", boxShadow: "0 0 60px rgba(128,0,255,.3),0 0 120px rgba(0,255,255,.1)" }}>
            🦊
          </div>
          <div className="absolute inset-0 m-auto rounded-full animate-spin-slow" style={{ width: "140px", height: "140px", top: "-6px", left: "-6px", border: "1px solid transparent", background: "linear-gradient(135deg,#ff00ff33,#00ffff33,#ff660033,#00ff8833) border-box", WebkitMask: "linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0)", WebkitMaskComposite: "destination-out", maskComposite: "exclude" }} />
        </div>

        <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none tracking-tight">
          <span className="gradient-text">FoxyCloud</span>
        </h1>
        <p className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto mb-3 font-light">
          Your WhatsApp bot. Always online. Fully managed.
        </p>
        <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
          Choose a bot, paste your session ID, and we handle the rest — on our servers, 24/7.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="btn-neon px-8 py-3.5 rounded-xl text-white font-bold text-lg w-full sm:w-auto">
            🚀 Deploy Your Bot
          </button>
          <button onClick={onViewBots} className="px-8 py-3.5 rounded-xl text-white/70 font-semibold text-base border border-white/10 hover:border-white/30 hover:text-white transition-all w-full sm:w-auto">
            Browse Bots ↓
          </button>
        </div>
      </div>

      {/* Bot preview cards */}
      {bots.length > 0 && (
        <div className="mt-20 max-w-4xl w-full">
          <h2 className="text-white/40 text-sm uppercase tracking-widest font-semibold mb-6">Available Bots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.slice(0, 3).map((bot, i) => (
              <div key={bot.id} className="glass card-glow rounded-2xl p-6 text-left neon-border animate-slide-up" style={{ animationDelay: `${0.1 * (i + 1)}s`, opacity: 0 }}>
                <div className="text-3xl mb-3">{bot.icon || "🤖"}</div>
                <h3 className="text-white font-semibold mb-1">{bot.name}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{bot.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {[["24/7", "Uptime"], ["Free", "To Start"], ["Managed", "Hosting"]].map(([v, l]) => (
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
        <p className="text-white/40">Select a bot to deploy on FoxyCloud. Your session ID is all you need.</p>
      </div>

      {bots.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-4">🤖</div>
          <p>No bots available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map((bot, i) => (
            <div key={bot.id} className="glass card-glow neon-border rounded-2xl p-6 flex flex-col animate-slide-up" style={{ animationDelay: `${0.08 * i}s`, opacity: 0 }}>
              <div className="text-4xl mb-4">{bot.icon || "🤖"}</div>
              <h3 className="text-white font-bold text-lg mb-2">{bot.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed flex-1 mb-5">{bot.description}</p>
              {bot.repoUrl && (
                <a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs hover:text-white/60 transition-colors mb-4 flex items-center gap-1">
                  <span>📂</span> View source
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
function DeployFlow({ bot, user, onDone }: { bot: Bot; user: User; onDone: (dep: Deployment) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = () => {
    setError("");
    const sid = sessionId.trim();
    if (!sid) return setError("Please enter your Session ID.");
    if (sid.length < 10) return setError("That doesn't look like a valid session ID.");
    setDeploying(true);
    setStep(3);
    setTimeout(() => {
      const dep: Deployment = {
        id: uid(),
        botId: bot.id,
        botName: bot.name,
        botIcon: bot.icon,
        sessionId: sid,
        status: "running",
        createdAt: Date.now(),
      };
      onDone(dep);
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="animate-slide-up">
        <button onClick={() => { if (!deploying) window.history.back(); }} className="text-white/40 text-sm hover:text-white/70 transition-colors mb-8 flex items-center gap-2">
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
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= n ? "btn-neon text-white" : "glass text-white/30 border border-white/10"}`}>
                {step > n ? "✓" : n}
              </div>
              {n < 3 && <div className={`h-px w-8 sm:w-16 transition-all ${step > n ? "bg-purple-500" : "bg-white/10"}`} />}
            </div>
          ))}
          <div className="ml-2 text-white/40 text-xs">{step === 1 ? "Get Session ID" : step === 2 ? "Enter Session ID" : "Deploying..."}</div>
        </div>

        {/* Step 1: Get session ID */}
        {step === 1 && (
          <div className="glass neon-border card-glow rounded-2xl p-6 animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2">Step 1 — Get Your Session ID</h3>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              To connect your WhatsApp account, you need a session ID. Click the button below to open the pairing page, scan the QR code (or enter your phone number), then copy the session ID you receive.
            </p>
            {bot.pairLink ? (
              <a
                href={bot.pairLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm mb-4"
              >
                📱 Open Pairing Page
              </a>
            ) : (
              <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(255,160,0,0.05)", border: "1px solid rgba(255,160,0,0.2)" }}>
                <p className="text-yellow-400/80 text-sm">Pairing link not configured yet. Contact the admin to set it up, or continue if you already have your session ID.</p>
              </div>
            )}
            <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(128,0,255,0.05)", border: "1px solid rgba(128,0,255,0.2)" }}>
              <p className="text-white/50 text-xs leading-relaxed">
                Your session ID looks like: <code className="text-purple-400 font-mono">FOXY-BOT:xxxxxxxx...</code>. It starts with the bot name prefix and contains your authentication token.
              </p>
            </div>
            <button onClick={() => setStep(2)} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-6">
              I have my Session ID →
            </button>
          </div>
        )}

        {/* Step 2: Enter session ID */}
        {step === 2 && (
          <div className="glass neon-border card-glow rounded-2xl p-6 animate-slide-up">
            <h3 className="text-white font-bold text-lg mb-2">Step 2 — Enter Session ID</h3>
            <p className="text-white/40 text-sm mb-6">
              Paste your session ID below. It will be stored securely as <code className="text-purple-400 font-mono">SESSION_ID</code> in your bot's environment.
            </p>

            <label className="text-white/50 text-xs uppercase tracking-widest font-semibold block mb-2">Session ID</label>
            <textarea
              className="input-neon w-full rounded-xl px-4 py-3 text-sm font-mono resize-none h-24"
              placeholder="FOXY-BOT:xxxxxxxxxxxxxxxxxxxxxxxx..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />

            {sessionId.trim() && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)" }}>
                <p className="text-green-400/70 text-xs font-semibold mb-1">Environment variable that will be set:</p>
                <code className="text-white/60 text-xs font-mono break-all">SESSION_ID={sessionId.trim()}</code>
              </div>
            )}

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-all text-sm">
                ← Back
              </button>
              <button onClick={handleDeploy} className="btn-neon flex-1 py-3.5 rounded-xl text-white font-bold">
                ☁️ Deploy on FoxyCloud
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deploying */}
        {step === 3 && (
          <div className="glass neon-border card-glow rounded-2xl p-8 text-center animate-slide-up">
            <div className="text-5xl mb-4 animate-float" style={{ display: "inline-block" }}>🚀</div>
            <h3 className="text-white font-bold text-xl mb-2">Deploying {bot.name}...</h3>
            <p className="text-white/40 text-sm mb-8">Setting up your bot instance on FoxyCloud servers. This takes just a moment.</p>
            <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full btn-neon rounded-full animate-progress" />
            </div>
            <p className="text-white/25 text-xs mt-4">Configuring environment → Installing dependencies → Starting bot</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function Dashboard({ user, deployments, onManage }: { user: User; deployments: Deployment[]; onManage: () => void }) {
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10 animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-black mb-2"><span className="gradient-text">My Dashboard</span></h2>
        <p className="text-white/40">Manage your active bot deployments</p>
      </div>

      {/* User card */}
      <div className="glass neon-border card-glow rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg,rgba(128,0,255,.2),rgba(0,255,255,.1))", border: "1px solid rgba(128,0,255,.4)" }}>
            {user.role === "admin" ? "⚙" : "👤"}
          </div>
          <div>
            <div className="text-white font-semibold">{user.name}</div>
            <div className="text-white/40 text-sm">{user.email} {user.role === "admin" && <span className="text-purple-400 ml-1 text-xs">• Admin</span>}</div>
          </div>
        </div>
        <button onClick={onManage} className="btn-neon px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
          + Deploy New Bot
        </button>
      </div>

      {/* Deployments */}
      <h3 className="text-white font-bold text-lg mb-4 animate-slide-up delay-100">Active Deployments</h3>
      {deployments.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center animate-slide-up delay-200" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-white/30 text-sm">No deployments yet. Deploy your first bot!</p>
          <button onClick={onManage} className="btn-neon mt-5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm">Browse Bots →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((dep, i) => (
            <div key={dep.id} className="glass card-glow rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 animate-slide-up" style={{ animationDelay: `${0.08 * i}s`, opacity: 0, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{dep.botIcon || "🤖"}</div>
                <div>
                  <div className="text-white font-semibold">{dep.botName}</div>
                  <div className="text-white/30 text-xs mt-0.5">Deployed {formatDate(dep.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${dep.status === "running" ? "bg-green-400 animate-pulse" : dep.status === "deploying" ? "bg-yellow-400 animate-pulse" : "bg-white/20"}`} />
                  <span className={`text-xs font-medium capitalize ${dep.status === "running" ? "text-green-400" : dep.status === "deploying" ? "text-yellow-400" : "text-white/30"}`}>
                    {dep.status}
                  </span>
                </div>
                <div className="text-white/20 text-xs font-mono">{dep.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════ */
function AdminPanel({ bots, onUpdate }: { bots: Bot[]; onUpdate: (bots: Bot[]) => void }) {
  const [editing, setEditing] = useState<Bot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "🤖", pairLink: "", repoUrl: "" });
  const [saved, setSaved] = useState(false);

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
    let updated: Bot[];
    if (editing) {
      updated = bots.map((b) => b.id === editing.id ? { ...b, ...form } : b);
    } else {
      const newBot: Bot = { id: uid(), ...form, createdAt: Date.now() };
      updated = [...bots, newBot];
    }
    saveBots(updated);
    onUpdate(updated);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = bots.filter((b) => b.id !== id);
    saveBots(updated);
    onUpdate(updated);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black"><span className="gradient-text">Admin Panel</span></h2>
          <p className="text-white/40 text-sm mt-1">Manage bots, pair links, and repositories</p>
        </div>
        <button onClick={openNew} className="btn-neon px-5 py-2.5 rounded-xl text-white font-bold text-sm">
          + Add Bot
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl text-green-400 text-sm animate-slide-up" style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)" }}>
          ✅ Saved successfully
        </div>
      )}

      {/* Bot list */}
      <div className="space-y-4 mb-8">
        {bots.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-white/30" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
            No bots yet. Click "Add Bot" to create the first one.
          </div>
        )}
        {bots.map((bot, i) => (
          <div key={bot.id} className="glass card-glow rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${0.06 * i}s`, opacity: 0, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{bot.icon || "🤖"}</div>
                <div>
                  <div className="text-white font-bold">{bot.name}</div>
                  <div className="text-white/40 text-xs mt-0.5 max-w-md">{bot.description}</div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {bot.pairLink ? (
                      <a href={bot.pairLink} target="_blank" rel="noopener noreferrer" className="text-purple-400/70 text-xs hover:text-purple-400 transition-colors flex items-center gap-1">
                        📱 Pair link ↗
                      </a>
                    ) : (
                      <span className="text-yellow-400/50 text-xs">📱 No pair link set</span>
                    )}
                    {bot.repoUrl ? (
                      <a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors flex items-center gap-1">
                        📂 Repo ↗
                      </a>
                    ) : (
                      <span className="text-white/20 text-xs">📂 No repo</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(bot)} className="px-4 py-2 rounded-xl text-sm text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all">
                  Edit
                </button>
                <button onClick={() => handleDelete(bot.id)} className="px-4 py-2 rounded-xl text-sm text-red-400/60 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin credentials info */}
      <div className="glass rounded-2xl p-5 animate-slide-up delay-300" style={{ border: "1px solid rgba(128,0,255,0.15)" }}>
        <h3 className="text-white/60 text-sm font-semibold mb-2">⚙ Admin Info</h3>
        <p className="text-white/30 text-xs leading-relaxed">
          Admin email: <code className="text-purple-400/70 font-mono">{ADMIN_EMAIL}</code><br />
          To change the admin password, update <code className="text-purple-400/70 font-mono">ADMIN_PASSWORD</code> in the source code and redeploy.
        </p>
      </div>

      {/* Edit/Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg neon-border rounded-2xl p-7 glass animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>
            <h3 className="gradient-text font-black text-xl mb-6">{editing ? "Edit Bot" : "Add New Bot"}</h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="field-label">Icon</label>
                  <input className="input-neon w-full rounded-xl px-3 py-3 text-center text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🤖" />
                </div>
                <div className="flex-1">
                  <label className="field-label">Bot Name *</label>
                  <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Webfoxy" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea className="input-neon w-full rounded-xl px-4 py-3 text-sm resize-none h-20" placeholder="What can this bot do?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div>
                <label className="field-label">Pair Link URL <span className="text-white/30 font-normal normal-case tracking-normal ml-1">— where users scan to get their session ID</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://..." value={form.pairLink} onChange={(e) => setForm({ ...form, pairLink: e.target.value })} />
              </div>

              <div>
                <label className="field-label">Repository URL <span className="text-white/30 font-normal normal-case tracking-normal ml-1">— GitHub repo with the bot code</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://github.com/..." value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-white/50 border border-white/10 hover:border-white/30 transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn-neon flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed">
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

    // Admin check
    if (em === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
      const admin: User = { name: "Admin", email: ADMIN_EMAIL, role: "admin" };
      saveUser(admin);
      return onSuccess(admin);
    }

    if (mode === "register") {
      if (!name.trim() || !em || !pw) return setError("All fields are required.");
      if (pw.length < 6) return setError("Password must be at least 6 characters.");
      const stored = localStorage.getItem(`fc_acc_${em}`);
      if (stored) return setError("An account with that email already exists.");
      localStorage.setItem(`fc_acc_${em}`, JSON.stringify({ name: name.trim(), password: pw }));
      const user: User = { name: name.trim(), email: em, role: "user" };
      saveUser(user);
      onSuccess(user);
    } else {
      if (!em || !pw) return setError("Email and password are required.");
      const stored = localStorage.getItem(`fc_acc_${em}`);
      if (!stored) return setError("No account found. Please register first.");
      const acc = JSON.parse(stored);
      if (acc.password !== pw) return setError("Incorrect password.");
      const user: User = { name: acc.name, email: em, role: "user" };
      saveUser(user);
      onSuccess(user);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md neon-border rounded-2xl p-8 glass animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3 animate-float" style={{ display: "inline-block" }}>🦊</div>
          <h2 className="gradient-text font-black text-2xl">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-white/40 text-sm mt-1">{mode === "login" ? "Login to manage your bots" : "Join FoxyCloud today"}</p>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="field-label">Your Name</label>
              <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="field-label">Email</label>
            <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

        <button onClick={submit} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-6">
          {mode === "login" ? "Login →" : "Create Account →"}
        </button>

        <p className="text-center text-white/30 text-sm mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="text-purple-400 hover:text-purple-300 transition-colors">
            {mode === "login" ? "Register" : "Login"}
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
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [view, setView] = useState<View>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  useEffect(() => {
    const u = loadUser();
    setUser(u);
    setBots(loadBots());
    if (u) setDeployments(loadDeployments(u.email));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setShowAuth(false);
    setDeployments(loadDeployments(u.email));
    setView("bots");
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    setDeployments([]);
    setView("landing");
  };

  const handleDeploy = (bot: Bot) => {
    if (!user) { setShowAuth(true); return; }
    setSelectedBot(bot);
    setView("deploy");
  };

  const handleDeployDone = (dep: Deployment) => {
    if (!user) return;
    const updated = [dep, ...deployments];
    setDeployments(updated);
    saveDeployments(user.email, updated);
    setView("dashboard");
  };

  const handleBotsUpdate = (updated: Bot[]) => {
    setBots(updated);
  };

  const goView = (v: View) => {
    if ((v === "bots" || v === "dashboard" || v === "admin") && !user) {
      setShowAuth(true);
      return;
    }
    setView(v);
  };

  return (
    <div className="neon-bg min-h-screen relative overflow-x-hidden">
      <Particles />

      <Nav
        user={user}
        view={view}
        onView={goView}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {view === "landing" && (
        <Landing
          bots={bots}
          onStart={() => { if (user) setView("bots"); else setShowAuth(true); }}
          onViewBots={() => { if (user) setView("bots"); else setShowAuth(true); }}
        />
      )}
      {view === "bots" && user && <BotList bots={bots} onDeploy={handleDeploy} />}
      {view === "dashboard" && user && <Dashboard user={user} deployments={deployments} onManage={() => setView("bots")} />}
      {view === "deploy" && user && selectedBot && <DeployFlow bot={selectedBot} user={user} onDone={handleDeployDone} />}
      {view === "admin" && user?.role === "admin" && <AdminPanel bots={bots} onUpdate={handleBotsUpdate} />}

      {showAuth && <AuthModal onSuccess={handleLogin} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
