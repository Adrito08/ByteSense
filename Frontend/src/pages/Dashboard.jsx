import { ShieldCheck, UploadCloud } from "lucide-react";
import { useState } from "react";
import api from "../api/client";
import QuickAnalyze from "../components/QuickAnalyze";
import RecentScanCards from "../components/RecentScanCards";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";
import RecentActivity from "../components/RecentActivity";
import QuickLinks from "../components/QuickLinks";
import QuoteCard from "../components/QuoteCard";
import Topbar from "../components/Topbar";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div>
      <Topbar />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Scans today" value="128" detail="+18% vs yesterday" tone="violet" />
        <StatCard title="Likely fake" value="14" detail="11% flagged" tone="amber" />
        <StatCard title="Confidence" value="82%" detail="Average model score" tone="cyan" />
        <StatCard title="No-face" value="9" detail="Needs clearer input" tone="emerald" />
      </div>

      <div className="mb-6">
        <QuickAnalyze
          fileName={selectedFile ? selectedFile.name : ""}
          onBrowse={() => document.getElementById("dashboard-upload")?.click()}
        />
        <input
          id="dashboard-upload"
          type="file"
          className="hidden"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <TrendChart />
        <RecentActivity />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <RecentScanCards />

          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center gap-2 text-violet-200">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.2em]">Detection notes</p>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Use a front-facing, high-contrast subject for the best signal.</li>
              <li>• Video analysis is more stable when at least 3-5 frames include the same face.</li>
              <li>• Scores near the model threshold should be treated as inconclusive.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <QuickLinks />
          <QuoteCard />
        </div>
      </div>
    </div>
  );
}
