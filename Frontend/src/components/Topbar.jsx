import { ArrowRight, Bell, Menu, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="glass-panel mb-6 flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3 lg:hidden">
        <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 md:flex">
        <Search className="h-4 w-4 text-violet-300" />
        <span className="text-sm">Search analysis</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">Adrita</p>
            <p className="text-xs text-slate-400">Analyst</p>
          </div>
          <ArrowRight className="hidden h-4 w-4 text-violet-200 sm:block" />
        </div>
      </div>
    </header>
  );
}
