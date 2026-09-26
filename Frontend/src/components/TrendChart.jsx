import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { day: "Mon", score: 46 },
  { day: "Tue", score: 52 },
  { day: "Wed", score: 58 },
  { day: "Thu", score: 49 },
  { day: "Fri", score: 63 },
  { day: "Sat", score: 67 },
  { day: "Sun", score: 59 },
];

export default function TrendChart() {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Signal trend</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Risk score average</h3>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
          +12.4%
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 12 }} domain={[30, 80]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#120d1d",
                border: "1px solid rgba(139,92,246,0.35)",
                borderRadius: 12,
              }}
            />
            <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#riskFill)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
