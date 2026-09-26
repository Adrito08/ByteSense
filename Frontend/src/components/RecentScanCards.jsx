import { ArrowUpRight } from "lucide-react";

const scans = [
  { label: "deepfake_01", risk: "High risk", score: 0.87 },
  { label: "portrait_12", risk: "Low risk", score: 0.24 },
  { label: "clip_004", risk: "Uncertain", score: 0.51 },
];

export default function RecentScanCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {scans.map(({ label, risk, score }) => (
        <div key={label} className="glass-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
            <ArrowUpRight className="h-4 w-4 text-violet-300" />
          </div>

          <p className="text-2xl font-bold text-white">{score.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-300">{risk}</p>
        </div>
      ))}
    </div>
  );
}
