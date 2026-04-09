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

interface DeployRecord {
  id: string;
  botId: string;
  botName: string;
  botIcon: string;
  repoUrl: string;
  createdAt: number;
  status: "cloning" | "installing" | "running" | "error" | "stopped";
  error?: string;
  logCount?: number;
}

type View = "landing" | "deploy" | "mybots" | "logs" | "admin";

/* ═══════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════ */
function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem("fc_user") || "null"); } catch { return null; }
}
function saveUser(u: User) { localStorage.setItem("fc_user", JSON.stringify(u)); }
function clearUser() { localStorage.removeItem("fc_user"); }

const DEFAULT_BOTS: Bot[] = [{
  id: "webfoxy", name: "Webfoxy",
  description: "The original Foxy Bot — 200+ WhatsApp commands, AI chat, games, stickers, media tools and more.",
  icon: "🦊", pairLink: "", repoUrl: "https://github.com/wolfix-bots/Webfoxy", createdAt: Date.now(),
}];
function loadBots(): Bot[] {
  try { const s = localStorage.getItem("fc_bots"); return s ? JSON.parse(s) : DEFAULT_BOTS; } catch { return DEFAULT_BOTS; }
}
function saveBots(b: Bot[]) { localStorage.setItem("fc_bots", JSON.stringify(b)); }

function loadMyRecords(email: string): DeployRecord[] {
  try { return JSON.parse(localStorage.getItem(`fc_recs_${email}`) || "[]"); } catch { return []; }
}
function saveMyRecords(email: string, recs: DeployRecord[]) {
  localStorage.setItem(`fc_recs_${email}`, JSON.stringify(recs));
}

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

/* ═══════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════ */
async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}
async function apiDelete(path: string) {
  await fetch(`${API}${path}`, { method: "DELETE" });
}

/* ═══════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════ */
function Particles() {
  const colors = ["#ff00ff","#00ffff","#ff6600","#00ff88","#8800ff","#ff00aa","#00aaff"];
  return (
    <>{Array.from({length:22},(_,i)=>(
      <div key={i} className="particle" style={{
        left:`${(i*4.6)%100}%`, width:`${(i%4)+1}px`, height:`${(i%4)+1}px`,
        background:colors[i%colors.length], boxShadow:`0 0 6px ${colors[i%colors.length]}`,
        animationDuration:`${(i%10)+12}s`, animationDelay:`${(i*0.7)%8}s`,
      }}/>
    ))}</>
  );
}

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
function Nav({ user, view, onView, onLogin, onLogout }: {
  user: User|null; view: View;
  onView:(v:View)=>void; onLogin:()=>void; onLogout:()=>void;
}) {
  const [open, setOpen] = useState(false);
  const links = user ? [
    { label: "My Bots", v: "mybots" as View },
    { label: "Deploy", v: "deploy" as View },
    ...(user.role==="admin" ? [{ label: "⚙ Admin", v: "admin" as View }] : []),
  ] : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="flex items-center justify-between px-5 py-4 max-w-6xl mx-auto">
        <button onClick={()=>onView("landing")} className="flex items-center gap-2">
          <span className="text-2xl animate-float" style={{display:"inline-block"}}>🦊</span>
          <span className="gradient-text font-black text-xl tracking-tight">FoxyCloud</span>
        </button>
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-1">
              {links.map(({label,v})=>(
                <button key={v} onClick={()=>onView(v)}
                  className={`nav-link ${v==="admin" ? (view===v?"!text-purple-400":"text-purple-400/50 hover:!text-purple-400") : (view===v?"!text-white":"")}`}>
                  {label}
                </button>
              ))}
              <div className="w-px h-4 bg-white/10 mx-2"/>
              <span className="text-white/30 text-xs hidden md:block mr-2">{user.name}</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:border-white/25 hover:text-white transition-all">Logout</button>
            </div>
            <button onClick={()=>setOpen(!open)} className="sm:hidden text-white/60 hover:text-white text-xl transition-colors">{open?"✕":"☰"}</button>
          </>
        ) : (
          <button onClick={onLogin} className="btn-neon px-5 py-2 rounded-lg text-white font-semibold text-sm">Get Started</button>
        )}
      </div>
      {user && open && (
        <div className="sm:hidden border-t border-white/5 px-5 py-3 space-y-1 animate-slide-up">
          {links.map(({label,v})=>(
            <button key={v} onClick={()=>{onView(v);setOpen(false);}}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${view===v?"text-white bg-white/5":"text-white/50 hover:text-white"}`}>
              {label}
            </button>
          ))}
          <button onClick={()=>{onLogout();setOpen(false);}} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400/60 hover:text-red-400 transition-all">Logout</button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   LANDING — rich multi-section
═══════════════════════════════════════════ */
function Landing({ bots, onStart }: { bots: Bot[]; onStart: () => void }) {
  const features = [
    { icon: "⚡", title: "Instant Setup", desc: "From zero to running bot in under 3 minutes. No server config, no CLI." },
    { icon: "🔒", title: "Your Session, Your Bot", desc: "We never read or store your session ID beyond what's needed to start the bot." },
    { icon: "📋", title: "Live Logs", desc: "Watch your bot start up in real time. Every log line streamed to your browser." },
    { icon: "🔄", title: "Auto Restart", desc: "If your bot crashes, FoxyCloud detects it and relaunches automatically." },
    { icon: "🌍", title: "Always Online", desc: "24/7 uptime on our infrastructure. No sleeping, no downtime windows." },
    { icon: "🧩", title: "Any Bot", desc: "Works with any Node.js WhatsApp bot that reads SESSION_ID from .env." },
  ];

  const steps = [
    { n: 1, icon: "📂", title: "Admin adds a bot", desc: "The admin registers a bot — giving it a name, GitHub repo link, and a pairing page URL." },
    { n: 2, icon: "📱", title: "You get a session ID", desc: "Open the pairing page, scan the QR code with your WhatsApp, and copy the session ID." },
    { n: 3, icon: "📋", title: "Paste & deploy", desc: "Paste your session ID into FoxyCloud. We clone the repo, write your .env, and run npm start." },
    { n: 4, icon: "🦊", title: "Bot goes live", desc: "Your bot is online within minutes. Monitor it from your dashboard anytime." },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <div className="animate-slide-up">
          <div className="relative inline-block mb-8">
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mx-auto animate-float"
              style={{background:"linear-gradient(135deg,rgba(128,0,255,.2),rgba(0,255,255,.1))",border:"1px solid rgba(128,0,255,.4)",boxShadow:"0 0 60px rgba(128,0,255,.3)"}}>🦊</div>
            <div className="absolute rounded-full animate-spin-slow"
              style={{width:140,height:140,top:-6,left:-6,border:"1px solid transparent",background:"linear-gradient(135deg,#ff00ff33,#00ffff33,#ff660033,#00ff8833) border-box",WebkitMask:"linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0)",WebkitMaskComposite:"destination-out",maskComposite:"exclude"}}/>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none">
            <span className="gradient-text">FoxyCloud</span>
          </h1>
          <p className="text-white/55 text-xl max-w-lg mx-auto mb-3 font-light">Your WhatsApp bot. Always online. Fully managed.</p>
          <p className="text-white/30 text-sm max-w-md mx-auto mb-10">
            We clone the bot's code, set your session, run <code className="text-purple-400/70 font-mono">npm install && npm start</code>, and keep it alive 24/7.
          </p>
          <button onClick={onStart} className="btn-neon px-10 py-4 rounded-xl text-white font-bold text-lg">
            🚀 Deploy Your Bot Free
          </button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-10 mt-20">
          {[["24/7","Uptime guaranteed"],["2 min","Average setup time"],["Free","To get started"],["Any bot","Works with any Node.js bot"]].map(([v,l])=>(
            <div key={l} className="text-center">
              <div className="gradient-text text-3xl font-black">{v}</div>
              <div className="text-white/30 text-xs mt-1 max-w-[100px]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Bot live in <span className="gradient-text">4 steps</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s,i)=>(
            <div key={s.n} className="glass card-glow neon-border rounded-2xl p-6 animate-slide-up" style={{animationDelay:`${0.1*i}s`,opacity:0}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="step-badge w-8 h-8 rounded-lg text-sm font-black flex items-center justify-center text-purple-300">{s.n}</span>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">{s.title}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Everything you need, <span className="gradient-text">nothing you don't</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f,i)=>(
            <div key={f.title} className="glass rounded-2xl p-6 hover:card-glow transition-all duration-300 animate-slide-up" style={{animationDelay:`${0.07*i}s`,opacity:0,border:"1px solid rgba(255,255,255,.06)"}}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Available bots ── */}
      {bots.length > 0 && (
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-3">Bot catalogue</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Pick your <span className="gradient-text">bot</span></h2>
            <p className="text-white/30 text-sm mt-3">The admin adds bots here. Any bot with a GitHub repo and npm start works.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bots.map((bot,i)=>(
              <div key={bot.id} className="glass card-glow neon-border rounded-2xl p-6 flex flex-col animate-slide-up" style={{animationDelay:`${0.1*i}s`,opacity:0}}>
                <div className="text-4xl mb-4">{bot.icon||"🤖"}</div>
                <h3 className="text-white font-bold text-lg mb-2">{bot.name}</h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1 mb-5">{bot.description}</p>
                <button onClick={onStart} className="btn-neon w-full py-2.5 rounded-xl text-white font-semibold text-sm">Deploy →</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-3">FAQ</p>
          <h2 className="text-3xl font-black text-white">Common <span className="gradient-text">questions</span></h2>
        </div>
        <div className="space-y-3">
          {[
            ["What is a session ID?", "A session ID is a string your WhatsApp bot generates when you pair it with your phone. It encodes your authentication so the bot can run without a QR code every time."],
            ["Is my session ID safe?", "Your session ID is written only to a .env file on our server and is never logged, shared, or visible to other users."],
            ["What happens if the server restarts?", "FoxyCloud will automatically restart your bot process. You don't need to do anything — it picks up your .env and runs npm start again."],
            ["Can I run more than one bot?", "Yes. Each deployment is independent. Deploy as many bots as you need from your dashboard."],
            ["What kind of bots are supported?", "Any Node.js WhatsApp bot that reads SESSION_ID from a .env file and starts with npm start. The admin adds the bot's GitHub repo."],
            ["How do I update my bot?", "Stop your current deployment, then redeploy — we always pull the latest code from the repo."],
          ].map(([q,a],i)=><FaqItem key={i} q={q} a={a}/>)}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto neon-border glass card-glow rounded-3xl p-10 text-center">
          <div className="text-5xl mb-4 animate-float" style={{display:"inline-block"}}>🦊</div>
          <h2 className="text-3xl font-black mb-3"><span className="gradient-text">Ready to deploy?</span></h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">Create your account, pick a bot, paste your session ID. Your bot will be live in minutes.</p>
          <button onClick={onStart} className="btn-neon px-10 py-4 rounded-xl text-white font-bold text-lg">Get Started Free →</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🦊</span>
          <span className="gradient-text font-bold">FoxyCloud</span>
        </div>
        <p className="text-white/20 text-xs">Powered by Webfoxy · Built by wolfix-bots</p>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden transition-all" style={{border:"1px solid rgba(255,255,255,.06)"}}>
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-white/80 text-sm font-medium">{q}</span>
        <span className={`text-white/30 text-lg transition-transform ${open?"rotate-45":""}`}>+</span>
      </button>
      {open && <div className="px-5 pb-4 text-white/40 text-xs leading-relaxed border-t border-white/5 pt-3">{a}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEPLOY PAGE (bot picker)
═══════════════════════════════════════════ */
function DeployPage({ bots, onSelect }: { bots: Bot[]; onSelect: (bot: Bot) => void }) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12 animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-black mb-2"><span className="gradient-text">Choose a Bot</span></h2>
        <p className="text-white/40 text-sm">Pick a bot from the list below and paste your session ID to deploy it on FoxyCloud.</p>
      </div>
      {bots.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <div className="text-5xl mb-4">🤖</div>
          <p className="text-sm">No bots have been added yet. The admin will add bots soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map((bot,i)=>(
            <div key={bot.id} className="glass card-glow neon-border rounded-2xl p-6 flex flex-col animate-slide-up" style={{animationDelay:`${0.08*i}s`,opacity:0}}>
              <div className="text-4xl mb-4">{bot.icon||"🤖"}</div>
              <h3 className="text-white font-bold text-lg mb-2">{bot.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed flex-1 mb-5">{bot.description}</p>
              {bot.repoUrl && (
                <a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 text-xs hover:text-white/50 transition-colors mb-4 flex items-center gap-1">
                  📂 View source
                </a>
              )}
              <button onClick={()=>onSelect(bot)} className="btn-neon w-full py-3 rounded-xl text-white font-semibold text-sm">
                🚀 Deploy This Bot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEPLOY FLOW MODAL (overlays DeployPage)
═══════════════════════════════════════════ */
function DeployModal({ bot, user, onDone, onClose }: {
  bot: Bot; user: User; onDone: (r: DeployRecord) => void; onClose: () => void;
}) {
  const [step, setStep] = useState<1|2|3>(1);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setError("");
    const sid = sessionId.trim();
    if (!sid) return setError("Please enter your session ID.");
    if (!bot.repoUrl) return setError("This bot has no repository configured. Contact the admin.");
    setDeploying(true);
    setStep(3);
    try {
      const res = await apiPost<{id:string;status:string}>("/bots/deploy", {
        sessionId: sid, repoUrl: bot.repoUrl,
        botId: bot.id, botName: bot.name, botIcon: bot.icon, userEmail: user.email,
      });
      const rec: DeployRecord = {
        id: res.id, botId: bot.id, botName: bot.name, botIcon: bot.icon,
        repoUrl: bot.repoUrl, status: "cloning", createdAt: Date.now(),
      };
      onDone(rec);
    } catch (err: unknown) {
      setError(`Deploy failed: ${err instanceof Error ? err.message : String(err)}`);
      setDeploying(false);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={()=>!deploying&&onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"/>
      <div className="relative w-full max-w-lg neon-border rounded-2xl p-7 glass animate-slide-up" onClick={e=>e.stopPropagation()}>
        {!deploying && <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">✕</button>}

        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{bot.icon||"🤖"}</span>
          <div>
            <h3 className="text-white font-black text-xl">Deploy {bot.name}</h3>
            <p className="text-white/35 text-xs">Hosted on FoxyCloud • zero maintenance</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-7">
          {[1,2,3].map(n=>(
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step>=n?"btn-neon text-white":"glass text-white/25 border border-white/10"}`}>{step>n?"✓":n}</div>
              {n<3&&<div className={`h-px w-6 sm:w-12 transition-all ${step>n?"bg-purple-500":"bg-white/10"}`}/>}
            </div>
          ))}
          <span className="ml-2 text-white/25 text-xs">{step===1?"Get session ID":step===2?"Enter & deploy":"Deploying..."}</span>
        </div>

        {/* Step 1: pair link */}
        {step===1 && (
          <div>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">
              You need a <strong className="text-white/80">session ID</strong> to connect your WhatsApp account. Open the pairing page, link your phone, and copy the session string you receive.
            </p>
            {bot.pairLink ? (
              <a href={bot.pairLink} target="_blank" rel="noopener noreferrer"
                className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm mb-4">
                📱 Open Pairing Page ↗
              </a>
            ) : (
              <div className="p-4 rounded-xl mb-4" style={{background:"rgba(255,160,0,.05)",border:"1px solid rgba(255,160,0,.2)"}}>
                <p className="text-yellow-400/70 text-sm">No pairing link set — ask the admin. You can still continue if you already have a session ID.</p>
              </div>
            )}
            <button onClick={()=>setStep(2)} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-3">I have my session ID →</button>
          </div>
        )}

        {/* Step 2: enter session ID */}
        {step===2 && (
          <div>
            <label className="field-label">Session ID</label>
            <textarea
              className="input-neon w-full rounded-xl px-4 py-3 text-sm font-mono resize-none h-28 mt-1"
              placeholder="Paste your session ID here..."
              value={sessionId}
              onChange={e=>setSessionId(e.target.value)}
            />
            {sessionId.trim() && (
              <div className="mt-3 p-3 rounded-xl" style={{background:"rgba(0,255,136,.04)",border:"1px solid rgba(0,255,136,.15)"}}>
                <p className="text-green-400/60 text-xs font-semibold mb-1">.env that will be written on our server:</p>
                <code className="text-white/45 text-xs font-mono">SESSION_ID={sessionId.trim()}</code>
              </div>
            )}
            {error&&<p className="text-red-400 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setStep(1)} className="px-4 py-3 rounded-xl text-white/35 border border-white/10 hover:border-white/25 transition-all text-sm">← Back</button>
              <button onClick={handleDeploy} disabled={deploying||!sessionId.trim()} className="btn-neon flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-30">
                ☁️ Deploy on FoxyCloud
              </button>
            </div>
          </div>
        )}

        {/* Step 3: deploying */}
        {step===3 && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4 animate-float" style={{display:"inline-block"}}>🚀</div>
            <h4 className="text-white font-bold text-lg mb-2">Deploying {bot.name}...</h4>
            <p className="text-white/35 text-sm mb-6">Cloning repo → Writing .env → npm install → npm start</p>
            <div className="relative w-full h-2 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,.05)"}}>
              <div className="h-full btn-neon rounded-full animate-progress"/>
            </div>
            <p className="text-white/20 text-xs mt-3">Your bot will appear in My Bots once it's running.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MY BOTS DASHBOARD
═══════════════════════════════════════════ */
function MyBots({ user, records, onUpdate, onViewLogs, onDeploy }: {
  user: User;
  records: DeployRecord[];
  onUpdate: (recs: DeployRecord[]) => void;
  onViewLogs: (id: string) => void;
  onDeploy: () => void;
}) {
  const [liveStatus, setLiveStatus] = useState<Record<string,DeployRecord>>({});

  const fetchStatus = async () => {
    try {
      const all = await apiGet<DeployRecord[]>(`/bots?userEmail=${encodeURIComponent(user.email)}`);
      const map: Record<string,DeployRecord> = {};
      for (const d of all) map[d.id] = d;
      setLiveStatus(map);
      // Sync stopped/error status back to records
      const updated = records.map(r => ({
        ...r,
        status: map[r.id]?.status ?? (r.status === "running" || r.status === "cloning" || r.status === "installing" ? "stopped" : r.status),
        error: map[r.id]?.error ?? r.error,
      }));
      onUpdate(updated);
    } catch {}
  };

  useEffect(() => { fetchStatus(); const t = setInterval(fetchStatus, 4000); return ()=>clearInterval(t); }, [records.length]);

  const stopBot = async (id: string) => {
    try { await apiDelete(`/bots/${id}`); } catch {}
    const updated = records.map(r => r.id===id ? {...r, status:"stopped" as const} : r);
    onUpdate(updated);
  };

  const removeRecord = (id: string) => {
    onUpdate(records.filter(r => r.id !== id));
  };

  const getStatus = (r: DeployRecord) => liveStatus[r.id]?.status ?? r.status;

  const statusStyle = (s: string) => ({
    cloning:    { dot: "bg-yellow-400 animate-pulse", text: "text-yellow-400", label: "Cloning…" },
    installing: { dot: "bg-yellow-400 animate-pulse", text: "text-yellow-400", label: "Installing…" },
    running:    { dot: "bg-green-400 animate-pulse",  text: "text-green-400",  label: "Running" },
    error:      { dot: "bg-red-400",                  text: "text-red-400",    label: "Error" },
    stopped:    { dot: "bg-white/20",                 text: "text-white/30",   label: "Stopped" },
  }[s] ?? { dot: "bg-white/20", text: "text-white/30", label: s });

  const fmt = (ts: number) => new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black"><span className="gradient-text">My Bots</span></h2>
          <p className="text-white/35 text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={onDeploy} className="btn-neon px-5 py-2.5 rounded-xl text-white font-semibold text-sm">+ Deploy New Bot</button>
      </div>

      {records.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-slide-up" style={{border:"1px solid rgba(255,255,255,.05)"}}>
          <div className="text-5xl mb-4">🤖</div>
          <p className="text-white/30 text-sm mb-6">You haven't deployed any bots yet.</p>
          <button onClick={onDeploy} className="btn-neon px-8 py-3 rounded-xl text-white font-semibold text-sm">Browse Bots →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r,i) => {
            const st = getStatus(r);
            const ss = statusStyle(st);
            return (
              <div key={r.id} className="glass card-glow rounded-2xl p-5 animate-slide-up" style={{animationDelay:`${0.06*i}s`,opacity:0,border:"1px solid rgba(255,255,255,.06)"}}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{r.botIcon||"🤖"}</span>
                    <div>
                      <div className="text-white font-semibold">{r.botName}</div>
                      <div className="text-white/25 text-xs mt-0.5">{fmt(r.createdAt)}</div>
                      {r.error && <div className="text-red-400/60 text-xs mt-1">⚠ {r.error.slice(0,70)}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${ss.dot}`}/>
                      <span className={`text-xs font-medium ${ss.text}`}>{ss.label}</span>
                    </div>
                    <button onClick={()=>onViewLogs(r.id)} className="px-3 py-1.5 rounded-lg text-xs text-white/45 border border-white/10 hover:border-white/25 hover:text-white transition-all">
                      📋 Logs
                    </button>
                    {(st==="running"||st==="installing"||st==="cloning") && (
                      <button onClick={()=>stopBot(r.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400/50 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">
                        ⏹ Stop
                      </button>
                    )}
                    {(st==="stopped"||st==="error") && (
                      <button onClick={()=>removeRecord(r.id)} className="px-3 py-1.5 rounded-lg text-xs text-white/25 border border-white/8 hover:border-white/20 hover:text-white/50 transition-all">
                        🗑 Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
  const [status, setStatus] = useState("connecting");
  const [live, setLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`${API}/bots/${depId}/logs?stream=true`);
    setLive(true);
    es.onmessage = (e) => {
      const d = JSON.parse(e.data) as {line?:string;status?:string;heartbeat?:boolean;done?:boolean};
      if (d.status) setStatus(d.status);
      if (d.line) setLogs(p=>[...p.slice(-499), d.line!]);
      if (d.done) { es.close(); setLive(false); }
    };
    es.onerror = () => { es.close(); setLive(false); setStatus("disconnected"); };
    return () => es.close();
  }, [depId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [logs]);

  const sc = { running:"text-green-400", error:"text-red-400", stopped:"text-white/30", disconnected:"text-white/30" }[status] || "text-yellow-400";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="animate-slide-up">
        <button onClick={onBack} className="text-white/35 text-sm hover:text-white/70 transition-colors mb-6 flex items-center gap-2">← My Bots</button>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">Live Logs</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${live?"bg-green-400 animate-pulse":"bg-white/20"}`}/>
              <span className={`text-xs ${sc}`}>{status}</span>
              <span className="text-white/20 text-xs font-mono">· {depId}</span>
            </div>
          </div>
          <span className="text-white/20 text-xs">{logs.length} lines</span>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{border:"1px solid rgba(128,0,255,.15)"}}>
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/40"/><div className="w-3 h-3 rounded-full bg-yellow-500/40"/><div className="w-3 h-3 rounded-full bg-green-500/40"/>
            <span className="ml-2 text-white/20 text-xs font-mono">foxycloud — bot output</span>
          </div>
          <div className="h-[420px] overflow-y-auto p-4 font-mono text-xs leading-relaxed" style={{background:"rgba(0,0,0,.55)"}}>
            {logs.length===0
              ? <div className="text-white/20 flex items-center gap-2"><span className="animate-pulse">▶</span> Waiting for output...</div>
              : logs.map((line,i)=>(
                  <div key={i} className={`whitespace-pre-wrap break-all ${line.includes("[err]")||line.includes("❌")?"text-red-400/80":line.includes("✅")||line.includes("🦊")?"text-green-400/80":line.includes("▶")||line.includes("📝")||line.includes("npm")?"text-yellow-400/60":"text-white/50"}`}>
                    {line}
                  </div>
                ))
            }
            <div ref={bottomRef}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════ */
function AdminPanel({ bots, onUpdate }: { bots: Bot[]; onUpdate: (b: Bot[]) => void }) {
  const [tab, setTab] = useState<"bots"|"deployments">("bots");
  const [editing, setEditing] = useState<Bot|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",description:"",icon:"🤖",pairLink:"",repoUrl:""});
  const [saved, setSaved] = useState(false);
  const [allDeps, setAllDeps] = useState<DeployRecord[]>([]);

  useEffect(() => {
    const fetch = () => apiGet<DeployRecord[]>("/bots").then(setAllDeps).catch(()=>{});
    fetch();
    const t = setInterval(fetch, 4000);
    return ()=>clearInterval(t);
  }, []);

  const openNew = () => { setForm({name:"",description:"",icon:"🤖",pairLink:"",repoUrl:""}); setEditing(null); setShowForm(true); };
  const openEdit = (bot: Bot) => { setForm({name:bot.name,description:bot.description,icon:bot.icon,pairLink:bot.pairLink,repoUrl:bot.repoUrl}); setEditing(bot); setShowForm(true); };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const updated = editing
      ? bots.map(b=>b.id===editing.id?{...b,...form}:b)
      : [...bots,{id:uid(),...form,createdAt:Date.now()}];
    saveBots(updated); onUpdate(updated); setShowForm(false);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  const handleDelete = (id: string) => { const u=bots.filter(b=>b.id!==id); saveBots(u); onUpdate(u); };
  const adminStop = async (id: string) => { try { await apiDelete(`/bots/${id}`); } catch {}; setAllDeps(p=>p.filter(d=>d.id!==id)); };

  const sdot = (s:string)=>({running:"bg-green-400",cloning:"bg-yellow-400",installing:"bg-yellow-400",error:"bg-red-400/70",stopped:"bg-white/20"}[s]||"bg-white/20");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black"><span className="gradient-text">Admin Panel</span></h2>
          <p className="text-white/35 text-sm mt-1">Manage bots and deployments across all users</p>
        </div>
        {tab==="bots" && <button onClick={openNew} className="btn-neon px-5 py-2.5 rounded-xl text-white font-bold text-sm">+ Add Bot</button>}
      </div>

      {saved && <div className="mb-5 p-3 rounded-xl text-green-400 text-sm" style={{background:"rgba(0,255,136,.04)",border:"1px solid rgba(0,255,136,.2)"}}>✅ Saved</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
        {(["bots","deployments"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab===t?"btn-neon text-white":"text-white/40 hover:text-white/70"}`}>
            {t==="bots"?"Bot Registry":`Live Deployments (${allDeps.length})`}
          </button>
        ))}
      </div>

      {/* Bot registry tab */}
      {tab==="bots" && (
        <div className="space-y-3">
          {bots.length===0 && <div className="glass rounded-2xl p-8 text-center text-white/25 text-sm" style={{border:"1px solid rgba(255,255,255,.04)"}}>No bots yet. Click "+ Add Bot".</div>}
          {bots.map((bot,i)=>(
            <div key={bot.id} className="glass card-glow rounded-2xl p-5 animate-slide-up" style={{animationDelay:`${0.06*i}s`,opacity:0,border:"1px solid rgba(255,255,255,.06)"}}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{bot.icon||"🤖"}</span>
                  <div>
                    <div className="text-white font-bold">{bot.name}</div>
                    <div className="text-white/30 text-xs mt-0.5 max-w-sm">{bot.description||"No description"}</div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {bot.pairLink?<a href={bot.pairLink} target="_blank" rel="noopener noreferrer" className="text-purple-400/60 text-xs hover:text-purple-400 transition-colors">📱 Pair link ↗</a>:<span className="text-yellow-400/40 text-xs">📱 No pair link</span>}
                      {bot.repoUrl?<a href={bot.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400/60 text-xs hover:text-blue-400 transition-colors">📂 Repo ↗</a>:<span className="text-white/20 text-xs">📂 No repo</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(bot)} className="px-4 py-2 rounded-xl text-sm text-white/45 border border-white/10 hover:border-white/25 hover:text-white transition-all">Edit</button>
                  <button onClick={()=>handleDelete(bot.id)} className="px-4 py-2 rounded-xl text-sm text-red-400/50 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deployments tab */}
      {tab==="deployments" && (
        <div className="space-y-3">
          {allDeps.length===0 && <div className="glass rounded-xl p-8 text-center text-white/25 text-sm" style={{border:"1px solid rgba(255,255,255,.04)"}}>No active deployments right now.</div>}
          {allDeps.map((dep,i)=>(
            <div key={dep.id} className="glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 animate-slide-up" style={{animationDelay:`${0.05*i}s`,opacity:0,border:"1px solid rgba(255,255,255,.05)"}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{dep.botIcon||"🤖"}</span>
                <div>
                  <div className="text-white text-sm font-medium">{dep.botName}</div>
                  <div className="text-white/25 text-xs font-mono mt-0.5">{dep.userEmail} · {dep.id}</div>
                  {dep.error&&<div className="text-red-400/60 text-xs mt-0.5">{dep.error.slice(0,60)}</div>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${sdot(dep.status)}`}/>
                  <span className="text-white/35 text-xs capitalize">{dep.status}</span>
                </div>
                {dep.status!=="stopped"&&dep.status!=="error"&&(
                  <button onClick={()=>adminStop(dep.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400/50 border border-red-400/10 hover:border-red-400/30 hover:text-red-400 transition-all">⏹ Force Stop</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credentials note */}
      <div className="glass rounded-2xl p-5 mt-8 animate-slide-up delay-400" style={{border:"1px solid rgba(128,0,255,.1)"}}>
        <p className="text-white/25 text-xs">Admin: <code className="text-purple-400/50 font-mono">{ADMIN_EMAIL}</code> · Password is set in source as <code className="text-purple-400/50 font-mono">ADMIN_PASSWORD</code></p>
      </div>

      {/* Bot form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={()=>setShowForm(false)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"/>
          <div className="relative w-full max-w-lg neon-border rounded-2xl p-7 glass animate-slide-up" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowForm(false)} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl">✕</button>
            <h3 className="gradient-text font-black text-xl mb-6">{editing?"Edit Bot":"Add New Bot"}</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="field-label">Icon</label>
                  <input className="input-neon w-full rounded-xl px-3 py-3 text-center text-xl" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="🤖"/>
                </div>
                <div className="flex-1">
                  <label className="field-label">Bot Name *</label>
                  <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Webfoxy" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea className="input-neon w-full rounded-xl px-4 py-3 text-sm resize-none h-20" placeholder="What does this bot do?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <div>
                <label className="field-label">Pair Link URL <span className="text-white/20 font-normal normal-case tracking-normal ml-1">— page where users get their session ID</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://..." value={form.pairLink} onChange={e=>setForm({...form,pairLink:e.target.value})}/>
              </div>
              <div>
                <label className="field-label">Repository URL <span className="text-white/20 font-normal normal-case tracking-normal ml-1">— GitHub repo to clone and run (npm start)</span></label>
                <input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="https://github.com/..." value={form.repoUrl} onChange={e=>setForm({...form,repoUrl:e.target.value})}/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="px-5 py-3 rounded-xl text-white/35 border border-white/10 hover:border-white/25 transition-all text-sm">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="btn-neon flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-30">{editing?"Save Changes":"Add Bot"} →</button>
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
function AuthModal({ onSuccess, onClose }: { onSuccess:(u:User)=>void; onClose:()=>void }) {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const em = email.trim().toLowerCase();
    const pw = password.trim();
    if (em===ADMIN_EMAIL && pw===ADMIN_PASSWORD) {
      const u: User = {name:"Admin",email:ADMIN_EMAIL,role:"admin"};
      saveUser(u); return onSuccess(u);
    }
    if (mode==="register") {
      if (!name.trim()||!em||!pw) return setError("All fields are required.");
      if (pw.length<6) return setError("Password must be at least 6 characters.");
      if (localStorage.getItem(`fc_acc_${em}`)) return setError("Account already exists — login instead.");
      localStorage.setItem(`fc_acc_${em}`,JSON.stringify({name:name.trim(),password:pw}));
      const u: User = {name:name.trim(),email:em,role:"user"};
      saveUser(u); return onSuccess(u);
    } else {
      if (!em||!pw) return setError("Email and password are required.");
      const stored = localStorage.getItem(`fc_acc_${em}`);
      if (!stored) return setError("No account found. Register first.");
      const acc = JSON.parse(stored);
      if (acc.password!==pw) return setError("Incorrect password.");
      const u: User = {name:acc.name,email:em,role:"user"};
      saveUser(u); return onSuccess(u);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"/>
      <div className="relative w-full max-w-md neon-border rounded-2xl p-8 glass animate-slide-up" onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl">✕</button>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 animate-float" style={{display:"inline-block"}}>🦊</div>
          <h2 className="gradient-text font-black text-2xl">{mode==="login"?"Welcome Back":"Join FoxyCloud"}</h2>
          <p className="text-white/35 text-sm mt-1">{mode==="login"?"Manage your running bots":"Create your free account"}</p>
        </div>
        <div className="space-y-4">
          {mode==="register"&&<div><label className="field-label">Your Name</label><input className="input-neon w-full rounded-xl px-4 py-3 text-sm" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div><label className="field-label">Email</label><input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div><label className="field-label">Password</label><input className="input-neon w-full rounded-xl px-4 py-3 text-sm" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        </div>
        {error&&<p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
        <button onClick={submit} className="btn-neon w-full py-3.5 rounded-xl text-white font-bold mt-6">{mode==="login"?"Login →":"Create Account →"}</button>
        <p className="text-center text-white/25 text-sm mt-4">
          {mode==="login"?"No account? ":"Have an account? "}
          <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} className="text-purple-400 hover:text-purple-300 transition-colors">
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
  const [user, setUser] = useState<User|null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [records, setRecords] = useState<DeployRecord[]>([]);
  const [view, setView] = useState<View>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot|null>(null);
  const [logDepId, setLogDepId] = useState<string|null>(null);

  useEffect(() => {
    const u = loadUser();
    setUser(u);
    setBots(loadBots());
    if (u) setRecords(loadMyRecords(u.email));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setRecords(loadMyRecords(u.email));
    setShowAuth(false);
    setView(u.role==="admin" ? "admin" : "mybots");
  };

  const handleLogout = () => { clearUser(); setUser(null); setRecords([]); setView("landing"); };

  const handleDeployDone = (rec: DeployRecord) => {
    if (!user) return;
    const updated = [rec, ...records];
    setRecords(updated);
    saveMyRecords(user.email, updated);
    setSelectedBot(null);
    setLogDepId(rec.id);
    setView("logs");
  };

  const handleRecordsUpdate = (recs: DeployRecord[]) => {
    setRecords(recs);
    if (user) saveMyRecords(user.email, recs);
  };

  const goView = (v: View) => {
    if (!user && v!=="landing") { setShowAuth(true); return; }
    if (v==="admin" && user?.role!=="admin") return;
    setView(v);
  };

  return (
    <div className="neon-bg min-h-screen relative overflow-x-hidden">
      <Particles/>
      <Nav user={user} view={view} onView={goView} onLogin={()=>setShowAuth(true)} onLogout={handleLogout}/>

      {view==="landing" && <Landing bots={bots} onStart={()=>{ if(user) setView("deploy"); else setShowAuth(true); }}/>}
      {view==="deploy" && user && <DeployPage bots={bots} onSelect={bot=>{setSelectedBot(bot);}}/>}
      {view==="mybots" && user && <MyBots user={user} records={records} onUpdate={handleRecordsUpdate} onViewLogs={id=>{setLogDepId(id);setView("logs");}} onDeploy={()=>setView("deploy")}/>}
      {view==="logs" && logDepId && <LogsViewer depId={logDepId} onBack={()=>setView("mybots")}/>}
      {view==="admin" && user?.role==="admin" && <AdminPanel bots={bots} onUpdate={u=>{setBots(u);}}/>}

      {selectedBot && user && (
        <DeployModal bot={selectedBot} user={user} onDone={handleDeployDone} onClose={()=>setSelectedBot(null)}/>
      )}
      {showAuth && <AuthModal onSuccess={handleLogin} onClose={()=>setShowAuth(false)}/>}
    </div>
  );
}
