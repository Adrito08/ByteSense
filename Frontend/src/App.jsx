import { Outlet, NavLink } from "react-router-dom";
import { Activity, BarChart3, FileSearch, ShieldCheck, Sparkles } from "lucide-react";

const navigation = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/analyze", label: "Analyze", icon: FileSearch },
  { to: "/reports", label: "Reports", icon: Activity },
  { to: "/settings", label: "Settings", icon: ShieldCheck },
];

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="glass-panel hidden w-72 shrink-0 p-5 lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">ByteSense</p>
              <h1 className="text-lg font-semibold">Detection Suite</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border border-violet-500/40 bg-violet-500/10 text-white"
                      : "text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-200">Status</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="status-dot bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="text-sm text-emerald-300">Model online</span>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
