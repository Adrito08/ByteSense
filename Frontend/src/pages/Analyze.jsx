import { useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Image as ImageIcon, Loader2, ShieldAlert, UploadCloud } from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";

const verdictClasses = {
  likely_fake: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  inconclusive: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  likely_real: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  no_face: "border-slate-500/40 bg-slate-500/10 text-slate-200",
};

export default function Analyze() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelection = (file) => {
    setSelectedFile(file);
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please choose an image or video to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await api.analyzeFile(selectedFile, 20);
      setResult(payload);
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = selectedFile && selectedFile.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : null;

  return (
    <div>
      <Topbar />

      <div className="glass-panel p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Media analysis</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Analyze an upload</h2>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-violet-500/40"
          >
            <UploadCloud className="h-4 w-4" />
            Choose file
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => handleFileSelection(event.target.files?.[0] || null)}
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-4">
            {selectedFile ? (
              <div className="space-y-3">
                {previewUrl ? (
                  <img src={previewUrl} alt={selectedFile.name} className="h-64 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-900/60 text-slate-300">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-violet-300" />
                      <p className="mt-2 text-sm">{selectedFile.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  <span>{selectedFile.name}</span>
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/40 text-center">
                <UploadCloud className="h-10 w-10 text-violet-300" />
                <p className="mt-3 text-lg font-medium text-white">No file selected</p>
                <p className="mt-1 text-sm text-slate-400">Upload an image or video to evaluate.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Run deepfake scan"}
            </button>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Verdict</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{result.verdict}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${verdictClasses[result.verdict] || verdictClasses.no_face}`}>
                    {result.verdict}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Overall score</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{result.score ?? "n/a"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flagged share</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{result.flagged_share ?? "n/a"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notes</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                    {(result.notes && result.notes.length ? result.notes : ["No notes available."]).map((note) => (
                      <li key={note} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {result && result.frames && result.frames.length > 0 && (
        <div className="glass-panel mt-6 p-5">
          <div className="mb-4 flex items-center gap-2 text-violet-200">
            <ArrowLeft className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.2em]">Face thumbnails</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.frames.map((frame) => (
              <div key={`${frame.index}-${frame.time ?? "still"}`} className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <img src={frame.face} alt={`Frame ${frame.index}`} className="h-32 w-full rounded-lg object-cover" />
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Frame {frame.index}</span>
                  <span>{frame.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
