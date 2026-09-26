import { ArrowUpRight, ShieldAlert } from "lucide-react";

export default function StatCard({ title, value, detail, tone = "violet" }) {
  const tones = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-200 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-200 border-amber-500/20",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone]}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-300">{title}</span>
        <ShieldAlert className="h-4 w-4 text-violet-200" />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300" />
      </div>
    </div>
  );
}
