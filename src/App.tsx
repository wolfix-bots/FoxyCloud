import { useState, useEffect, useRef, useCallback } from "react";

const REPO = "https://github.com/wolfix-bots/Webfoxy";
const RENDER_DEPLOY = "https://render.com/deploy?repo=https://github.com/wolfix-bots/Webfoxy";

/* ═══════════════════════════════════════════
   PARTICLES BACKGROUND
═══════════════════════════════════════════ */
function Particles() {
  const colors = ["#ff00ff", "#00ffff", "#ff6600", "#00ff88", "#8800ff", "#ff00aa", "#00aaff"];
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 1}px`,
    height: `${Math.random() * 4 + 1}px`,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: `${Math.random() * 15 + 10}s`,
    delay: `${Math.random() * 10}s`,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   AUTH STORE (localStorage)
═══════════════════════════════════════════ */
interface User { name: string; email: string; sessionId?: string }

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem("fc_user") || "null"); } catch { return null; }
}
function saveUser(u: User) { localStorage.setItem("fc_user", JSON.stringify(u)); }
function clearUser() { localStorage.removeItem("fc_user"); }

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
function Nav({ user, onLogin, onLogout }: { user: User | null; onLogin: () => void; onLogout: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-float" style={{ display: "inline-block" }}>🦊</span>
        <span className="gradient-text font-bold text-xl tracking-tight">FoxyCloud</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-white/60 text-sm hidden sm:block">Hey, {user.name.split(" ")[0]} 👋</span>
            <button
              onClick={onLogout}
              className="px-4 py-1.5 rounded-lg text-sm text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="btn-neon px-5 py-2 rounded-lg text-white font-semibold text-sm"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   LANDING HERO
═══════════════════════════════════════════ */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center relative">
      <div className="animate-slide-up">
        <div className="relative inline-block mb-8">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto animate-float"
            style={{
              background: "linear-gradient(135deg, rgba(128,0,255,0.2), rgba(0,255,255,0.1))",
              border: "1px solid rgba(128,0,255,0.4)",
              boxShadow: "0 0 60px rgba(128,0,255,0.3), 0 0 120px rgba(0,255,255,0.1)",
            }}
          >
            🦊
          </div>
          {/* Orbiting ring */}
          <div
            className="absolute inset-0 m-auto rounded-full animate-spin-slow"
            style={{
              width: "140px",
              height: "140px",
              top: "-6px",
              left: "-6px",
              border: "1px solid transparent",
              background: "linear-gradient(135deg, #ff00ff33, #00ffff33, #ff660033, #00ff8833) border-box",
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "destination-out",
              maskComposite: "exclude",
            }}
          />
        </div>

        <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none tracking-tight">
          <span className="gradient-text">FoxyCloud</span>
        </h1>
        <p className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto mb-3 font-light">
          Deploy your WhatsApp bot in seconds.
        </p>
        <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
          Paste your session ID, we handle the rest. No servers, no config files, no headaches.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="btn-neon px-8 py-3.5 rounded-xl text-white font-bold text-lg w-full sm:w-auto"
          >
            🚀 Launch Your Bot
          </button>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-xl text-white/70 font-semibold text-base border border-white/10 hover:border-white/30 hover:text-white transition-all w-full sm:w-auto text-center"
          >
            View Source ↗
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
        {[
          { icon: "⚡", title: "Instant Deploy", desc: "One click to get your bot running. No technical knowledge required." },
          { icon: "🔒", title: "Secure Sessions", desc: "Your session ID is private. We store it locally, never on our servers." },
          { icon: "🦊", title: "Foxy Bot Powered", desc: "Built on the Webfoxy platform — packed with 200+ WhatsApp commands." },
        ].map((f, i) => (
          <div
            key={f.title}
            className="glass card-glow rounded-2xl p-6 text-left neon-border animate-slide-up"
            style={{ animationDelay: `${0.1 * (i + 1)}s`, opacity: 0 }}
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {[["200+", "Commands"], ["Active", "Development"], ["Free", "Forever"]].map(([v, l]) => (
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
    if (mode === "register") {
      if (!name.trim() || !email.trim() || !password.trim()) return setError("All fields are required");
      if (password.length < 6) return setError("Password must be at least 6 characters");
      const user: User = { name: name.trim(), email: email.trim().toLowerCase() };
      saveUser(user);
      onSuccess(user);
    } else {
      if (!email.trim() || !password.trim()) return setError("Email and password are required");
      const stored = loadUser();
      if (!stored || stored.email !== email.trim().toLowerCase()) return setError("No account found. Please register first.");
      onSuccess(stored);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md neon-border rounded-2xl p-8 glass animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3 animate-float" style={{ display: "inline-block" }}>🦊</div>
          <h2 className="gradient-text font-black text-2xl">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {mode === "login" ? "Login to manage your bot" : "Join FoxyCloud today"}
          </p>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Your Name</label>
              <input
                className="input-neon w-full rounded-xl px-4 py-3 text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
            <input
              className="input-neon w-full rounded-xl px-4 py-3 text-sm"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1.5">Password</label>
            <input
              className="input-neon w-full rounded-xl px-4 py-3 text-sm"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}

        <button onClick={submit} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-6">
          {mode === "login" ? "Login →" : "Create Account →"}
        </button>

        <p className="text-center text-white/30 text-sm mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function Dashboard({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [sessionId, setSessionId] = useState(user.sessionId || "");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);

  const steps = [
    {
      n: 1, icon: "📱", title: "Get Your Session ID",
      desc: "Run Foxy Bot locally (or on Replit) and copy the session ID from the bot's pairing menu. It starts with FOXY-BOT: ...",
    },
    {
      n: 2, icon: "📋", title: "Paste Session ID Below",
      desc: "Enter your session ID in the field below and click Save. This is used to authenticate your bot on the cloud server.",
    },
    {
      n: 3, icon: "☁️", title: "Deploy to Render",
      desc: "Click 'Deploy to Render' — it opens Render's deploy page for the Webfoxy repo. Set SESSION_ID as an environment variable.",
    },
    {
      n: 4, icon: "🦊", title: "Bot is Live!",
      desc: "After Render finishes building (2-5 min), your bot will be online 24/7. No maintenance needed.",
    },
  ];

  const saveSession = () => {
    const updated = { ...user, sessionId: sessionId.trim() };
    saveUser(updated);
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">
          <span className="gradient-text">Your Bot Dashboard</span>
        </h2>
        <p className="text-white/40">Deploy and manage your Foxy Bot instance</p>
      </div>

      {/* Status card */}
      <div className="glass neon-border card-glow rounded-2xl p-6 mb-8 animate-slide-up delay-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg, rgba(128,0,255,0.2), rgba(0,255,255,0.1))", border: "1px solid rgba(128,0,255,0.4)" }}
            >
              🦊
            </div>
            <div>
              <div className="text-white font-semibold">{user.name}</div>
              <div className="text-white/40 text-sm">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user.sessionId ? "bg-green-400 animate-pulse-glow" : "bg-white/20"}`} />
            <span className={`text-sm font-medium ${user.sessionId ? "text-green-400" : "text-white/30"}`}>
              {user.sessionId ? "Session Configured" : "No Session Yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Session ID Input */}
      <div className="glass neon-border card-glow rounded-2xl p-6 mb-8 animate-slide-up delay-200">
        <h3 className="text-white font-bold text-lg mb-1">Session ID</h3>
        <p className="text-white/40 text-sm mb-5">
          Your WhatsApp session credential. Keep this private — it authenticates your bot account.
        </p>

        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <input
            className="input-neon flex-1 min-w-0 rounded-xl px-4 py-3 text-sm font-mono"
            placeholder="FOXY-BOT:xxxxxxxxxxxxxxxx..."
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
          <button
            onClick={copySessionId}
            className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-all text-sm whitespace-nowrap"
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>

        <button
          onClick={saveSession}
          disabled={!sessionId.trim()}
          className="btn-neon mt-4 px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saved ? "✅ Saved!" : "💾 Save Session ID"}
        </button>
      </div>

      {/* Deploy button */}
      <div className="glass neon-border card-glow rounded-2xl p-6 mb-8 animate-slide-up delay-300">
        <h3 className="text-white font-bold text-lg mb-1">Deploy Your Bot</h3>
        <p className="text-white/40 text-sm mb-5">
          Click the button below to deploy Webfoxy on Render (free tier available). After deploying, add your Session ID as the <span className="text-purple-400 font-mono">SESSION_ID</span> environment variable.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href={RENDER_DEPLOY}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon px-6 py-3 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2"
          >
            ☁️ Deploy to Render
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-white/60 font-semibold text-sm border border-white/10 hover:border-white/30 hover:text-white transition-all inline-flex items-center gap-2"
          >
            📂 View Repository
          </a>
        </div>

        {user.sessionId && (
          <div className="mt-5 p-4 rounded-xl" style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)" }}>
            <p className="text-green-400 text-sm font-semibold mb-2">✅ Your environment variable:</p>
            <code className="text-white/80 text-xs font-mono break-all">
              SESSION_ID = {user.sessionId}
            </code>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="animate-slide-up delay-400">
        <h3 className="text-white font-bold text-lg mb-5">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s) => (
            <div
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`rounded-2xl p-5 cursor-pointer transition-all ${step === s.n ? "neon-border glass card-glow" : "glass border border-white/5"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center step-badge"
                  style={{ color: step === s.n ? "#c084fc" : "rgba(255,255,255,0.3)" }}
                >
                  {s.n}
                </span>
                <span className="text-xl">{s.icon}</span>
                <span className={`font-semibold text-sm ${step === s.n ? "text-white" : "text-white/50"}`}>{s.title}</span>
              </div>
              {step === s.n && <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { setUser(loadUser()); }, []);

  const handleLogin = (u: User) => { setUser(u); setShowAuth(false); };
  const handleLogout = () => { clearUser(); setUser(null); };
  const handleUpdate = (u: User) => { setUser(u); saveUser(u); };

  return (
    <div className="neon-bg min-h-screen relative overflow-x-hidden">
      <Particles />

      <Nav
        user={user}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {user ? (
        <Dashboard user={user} onUpdate={handleUpdate} />
      ) : (
        <Landing onStart={() => setShowAuth(true)} />
      )}

      {showAuth && (
        <AuthModal onSuccess={handleLogin} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
