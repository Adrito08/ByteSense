import { ExternalLink, LockKeyhole, Sparkles } from "lucide-react";

const links = [
  { label: "Model metadata", href: "#" },
  { label: "Face detection", href: "#" },
  { label: "API docs", href: "#" },
];

export default function QuickLinks() {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4 flex items-center gap-2 text-violet-200">
        <Sparkles className="h-4 w-4" />
        <p className="text-xs uppercase tracking-[0.2em]">Quick links</p>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10"
          >
            <span>{link.label}</span>
            <div className="flex items-center gap-2 text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" />
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
