import { Clock3, ShieldAlert } from "lucide-react";

const activity = [
  { name: "Face scan", time: "2 min ago", status: "likely_real" },
  { name: "Frame review", time: "14 min ago", status: "inconclusive" },
  { name: "Video audit", time: "36 min ago", status: "likely_fake" },
];

const badgeStyles = {
  likely_real: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  inconclusive: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  likely_fake: "border-rose-500/40 bg-rose-500/10 text-rose-200",
};

export default function RecentActivity() {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Recent activity</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Latest checks</h3>
        </div>
        <ShieldAlert className="h-5 w-5 text-violet-300" />
      </div>

      <div className="space-y-3">
        {activity.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-200">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${badgeStyles[item.status]}`}>
              {item.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
