import { UploadCloud } from "lucide-react";

export default function QuickAnalyze({ onBrowse, fileName }) {
  return (
    <div className="glass-panel flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Quick analyze</p>
        <h3 className="mt-1 text-xl font-semibold text-white">Upload a media file</h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
          {fileName || "No file selected"}
        </div>
        <button
          type="button"
          onClick={onBrowse}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:opacity-95"
        >
          <UploadCloud className="h-4 w-4" />
          Browse
        </button>
      </div>
    </div>
  );
}
