import { Quote } from "lucide-react";

export default function QuoteCard() {
  return (
    <div className="glass-panel flex h-full flex-col justify-between p-5">
      <div className="mb-4 flex items-center gap-2 text-violet-200">
        <Quote className="h-4 w-4" />
        <p className="text-xs uppercase tracking-[0.2em]">Insight</p>
      </div>

      <blockquote className="text-lg leading-relaxed text-slate-100">
        “A high-confidence score is only as useful as the face crop and the frame quality behind it.”
      </blockquote>

      <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">
        ByteSense guidance
      </div>
    </div>
  );
}
