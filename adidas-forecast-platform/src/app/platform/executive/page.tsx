"use client";
import { useState } from "react";
import PlatformNav from "../components/PlatformNav";

// ─── Data ─────────────────────────────────────────────────────────────────────

const countries = [
  { code: "BR", name: "Brazil",    gap: +8.2,  revenueRisk: 2.4, invCost: 1.8, signalDays: 4.2, automation: 82, trend: "up" },
  { code: "MX", name: "Mexico",    gap: -4.1,  revenueRisk: 1.1, invCost: 0.6, signalDays: 5.8, automation: 71, trend: "down" },
  { code: "AR", name: "Argentina", gap: +12.5, revenueRisk: 3.2, invCost: 2.1, signalDays: 3.9, automation: 75, trend: "up" },
  { code: "CO", name: "Colombia",  gap: -7.8,  revenueRisk: 0.8, invCost: 0.4, signalDays: 6.1, automation: 68, trend: "down" },
  { code: "CL", name: "Chile",     gap: +3.4,  revenueRisk: 0.5, invCost: 0.3, signalDays: 4.8, automation: 79, trend: "stable" },
  { code: "PE", name: "Peru",      gap: -1.2,  revenueRisk: 0.2, invCost: 0.1, signalDays: 5.2, automation: 73, trend: "stable" },
];

// 12-week gap trend for selected country (LAM aggregate shown with "ALL")
const gapTrends: Record<string, number[]> = {
  ALL: [14.2, 13.1, 12.8, 11.4, 10.9, 9.6,  9.1, 9.8, 8.9, 8.5, 8.2, 7.8],
  BR:  [18.1, 16.9, 15.8, 14.2, 13.1, 11.8, 11.1, 11.9, 10.4, 9.6, 8.2, 7.9],
  MX:  [-6.2, -5.8, -5.1, -5.9, -4.8, -4.2, -5.1, -4.4, -4.8, -4.3, -4.1, -3.8],
  AR:  [19.2, 18.4, 17.1, 16.8, 15.4, 14.8, 14.1, 15.2, 14.1, 13.4, 12.5, 11.9],
  CO:  [-9.1, -8.8, -8.2, -7.9, -8.4, -7.6, -8.1, -7.8, -8.2, -7.9, -7.8, -7.4],
  CL:  [5.2, 4.8, 4.2, 4.9, 3.8, 3.6, 4.1, 3.9, 3.4, 3.8, 3.4, 3.1],
  PE:  [-2.1, -1.8, -2.2, -1.9, -1.6, -2.0, -1.4, -1.8, -1.5, -1.3, -1.2, -1.0],
};

const weekLabels = ["W02", "W03", "W04", "W05", "W06", "W07", "W08", "W09", "W10", "W11", "W12", "W13"];

// ─── SVG Gap Trend Chart ──────────────────────────────────────────────────────

function GapTrendChart({ data, label }: { data: number[]; label: string }) {
  const W = 520;
  const H = 140;
  const PAD_L = 40;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const absMax = Math.max(...data.map(Math.abs)) * 1.1;
  const zeroY = PAD_T + chartH / 2;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => zeroY - (v / absMax) * (chartH / 2);

  const pts = data.map((d, i) => `${toX(i)},${toY(d)}`).join(" ");
  const lastVal = data[data.length - 1];
  const improving = Math.abs(lastVal) < Math.abs(data[0]);
  const lineColor = improving ? "#10b981" : "#f59e0b";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* ±15% threshold bands */}
      <rect
        x={PAD_L}
        y={toY(15)}
        width={chartW}
        height={toY(-15) - toY(15)}
        fill="#10b981"
        opacity={0.04}
      />
      {/* Zero line */}
      <line x1={PAD_L} y1={zeroY} x2={W - PAD_R} y2={zeroY} stroke="#374151" strokeWidth="1" />
      {/* ±15 threshold lines */}
      <line x1={PAD_L} y1={toY(15)} x2={W - PAD_R} y2={toY(15)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1={PAD_L} y1={toY(-15)} x2={W - PAD_R} y2={toY(-15)} stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x={W - PAD_R + 2} y={toY(15) + 3} fill="#374151" fontSize="7">+15%</text>
      <text x={W - PAD_R + 2} y={toY(-15) + 3} fill="#374151" fontSize="7">-15%</text>
      {/* Y axis labels */}
      <text x={PAD_L - 4} y={toY(0) + 3} textAnchor="end" fill="#4b5563" fontSize="8">0%</text>
      {/* Area fill */}
      <polygon
        points={`${toX(0)},${zeroY} ${pts} ${toX(data.length - 1)},${zeroY}`}
        fill={lineColor}
        opacity={0.1}
      />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d)} r={i === data.length - 1 ? 3.5 : 2} fill={lineColor} />
      ))}
      {/* X labels */}
      {weekLabels.map((w, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fill="#374151" fontSize="8">
          {i % 3 === 0 || i === weekLabels.length - 1 ? w : ""}
        </text>
      ))}
    </svg>
  );
}

// ─── Horizontal gap bar chart by country ─────────────────────────────────────

function CountryGapChart({ data }: { data: typeof countries }) {
  const sorted = [...data].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.gap)));

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((c) => {
        const isOver = c.gap > 0;
        const pct = (Math.abs(c.gap) / maxAbs) * 100;
        const exceedsThreshold = Math.abs(c.gap) > 15;
        return (
          <div key={c.code} className="flex items-center gap-3 text-xs">
            <span className="w-6 text-gray-500 font-bold flex-shrink-0">{c.code}</span>
            <div className="flex-1 flex items-center h-5">
              <div className="w-1/2 flex justify-end">
                {!isOver && (
                  <div
                    className="h-full bg-amber-500/70"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
              <div className="w-px h-full bg-gray-700 flex-shrink-0" />
              <div className="w-1/2">
                {isOver && (
                  <div
                    className={`h-full ${exceedsThreshold ? "bg-red-500/80" : "bg-emerald-500/60"}`}
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
            </div>
            <span className={`w-12 text-right font-black flex-shrink-0 ${
              exceedsThreshold ? "text-red-400" : isOver ? "text-emerald-400" : "text-amber-400"
            }`}>
              {c.gap > 0 ? "+" : ""}{c.gap}%
            </span>
          </div>
        );
      })}
      <div className="flex items-center mt-1 text-xs text-gray-700">
        <div className="w-6" />
        <div className="flex-1 flex">
          <div className="w-1/2 text-right pr-1">Under-forecast →</div>
          <div className="w-px" />
          <div className="w-1/2 pl-1">← Over-forecast</div>
        </div>
        <div className="w-12" />
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  sub,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  sub: string;
  trend: "up" | "down" | "stable";
  color: string;
}) {
  const trendIcon = { up: "↑", down: "↓", stable: "→" }[trend];
  const trendColor = { up: "text-red-400", down: "text-red-400", stable: "text-gray-500" }[trend];

  return (
    <div className="bg-gray-900 border border-gray-800 p-5">
      <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className={`text-3xl font-black ${color}`}>{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${trendColor}`}>{trendIcon}</span>
        <span className="text-xs text-gray-600">{sub}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const [activeCountry, setActiveCountry] = useState("ALL");
  const [alertDismissed, setAlertDismissed] = useState(false);

  const selectedData =
    activeCountry === "ALL"
      ? null
      : countries.find((c) => c.code === activeCountry) ?? null;

  const trendData = gapTrends[activeCountry] ?? gapTrends["ALL"];

  // Aggregate KPIs
  const totalRevenueRisk = countries.reduce((a, c) => a + c.revenueRisk, 0).toFixed(1);
  const totalInvCost = countries.reduce((a, c) => a + c.invCost, 0).toFixed(1);
  const avgSignal = (countries.reduce((a, c) => a + c.signalDays, 0) / countries.length).toFixed(1);
  const avgAutomation = Math.round(countries.reduce((a, c) => a + c.automation, 0) / countries.length);

  const alertCountries = countries.filter((c) => Math.abs(c.gap) > 15);
  const currentGap = selectedData ? selectedData.gap : trendData[trendData.length - 1];
  const gapImproving = Math.abs(trendData[trendData.length - 1]) < Math.abs(trendData[0]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PlatformNav />

      <div className="pt-14">
        {/* Header */}
        <div className="bg-black border-b border-gray-800 px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Module 03 — Executive Dashboard
                </span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Forecast-to-Plan Command Center
              </h1>
              <p className="text-gray-500 text-sm mt-1">LAM · All channels · W13 2026 · Weekly cycle</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-500 uppercase tracking-wider">Last updated: Sun 29-Mar-26 06:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Alert banner */}
        {!alertDismissed && alertCountries.length > 0 && (
          <div className="bg-red-500/5 border-b border-red-500/20 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-bold text-sm flex-shrink-0">▲ Alert</span>
                <span className="text-xs text-gray-300">
                  {alertCountries.map((c) => c.name).join(", ")} — gap exceeds ±15% threshold.
                  Immediate commercial review recommended.
                </span>
              </div>
              <button
                onClick={() => setAlertDismissed(true)}
                className="text-xs text-gray-600 hover:text-gray-400 flex-shrink-0 uppercase tracking-wider"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Revenue at Risk"
              value={`$${totalRevenueRisk}`}
              unit="M"
              sub="Stockout exposure vs plan"
              trend="down"
              color="text-red-400"
            />
            <KpiCard
              label="Inventory Opp. Cost"
              value={`$${totalInvCost}`}
              unit="M"
              sub="Overstock margin erosion"
              trend="down"
              color="text-amber-400"
            />
            <KpiCard
              label="Signal-to-Decision"
              value={avgSignal}
              unit="days avg"
              sub="Market signal → planning action"
              trend="stable"
              color="text-blue-400"
            />
            <KpiCard
              label="Analyst Automation"
              value={`${avgAutomation}%`}
              unit=""
              sub="Forecast cycles fully automated"
              trend="up"
              color="text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Country breakdown ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Country selector */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Country View
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {["ALL", ...countries.map((c) => c.code)].map((code) => {
                    const country = countries.find((c) => c.code === code);
                    const hasAlert = country && Math.abs(country.gap) > 15;
                    return (
                      <button
                        key={code}
                        onClick={() => setActiveCountry(code)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
                          activeCountry === code
                            ? "bg-white text-black"
                            : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {code}
                        {hasAlert && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Forecast vs Plan gap bar */}
                <CountryGapChart data={countries} />
              </div>

              {/* Selected country detail */}
              {selectedData ? (
                <div className="bg-gray-900 border border-gray-800 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                    {selectedData.name} Detail
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "F→P Gap", value: `${selectedData.gap > 0 ? "+" : ""}${selectedData.gap}%`, color: Math.abs(selectedData.gap) > 15 ? "text-red-400" : "text-amber-400" },
                      { label: "Rev at Risk", value: `$${selectedData.revenueRisk}M`, color: "text-red-400" },
                      { label: "Inv. Cost", value: `$${selectedData.invCost}M`, color: "text-amber-400" },
                      { label: "Signal Days", value: `${selectedData.signalDays}d`, color: "text-blue-400" },
                      { label: "Automation", value: `${selectedData.automation}%`, color: "text-emerald-400" },
                      { label: "Trend", value: selectedData.trend === "up" ? "Widening" : selectedData.trend === "down" ? "Narrowing" : "Stable", color: selectedData.trend === "down" ? "text-emerald-400" : "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-800 p-3">
                        <div className="text-xs text-gray-600 mb-0.5">{s.label}</div>
                        <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                    LAM Aggregate
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Avg Abs Gap", value: `${(countries.reduce((a,c) => a + Math.abs(c.gap), 0) / countries.length).toFixed(1)}%`, color: "text-amber-400" },
                      { label: "Countries in Alert", value: `${alertCountries.length} / 6`, color: alertCountries.length > 0 ? "text-red-400" : "text-emerald-400" },
                      { label: "Total Rev Risk", value: `$${totalRevenueRisk}M`, color: "text-red-400" },
                      { label: "Total Inv Cost", value: `$${totalInvCost}M`, color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-800 p-3">
                        <div className="text-xs text-gray-600 mb-0.5">{s.label}</div>
                        <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Trend chart + weekly table ── */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              {/* Gap trend over 12 weeks */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide">
                      Forecast-to-Plan Gap — 12-Week Trend
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeCountry === "ALL" ? "LAM Aggregate" : countries.find((c) => c.code === activeCountry)?.name} · shaded band = acceptable ±15% window
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${gapImproving ? "text-emerald-400" : "text-amber-400"}`}>
                    {gapImproving ? "↓ Improving" : "↑ Widening"}
                  </div>
                </div>
                <GapTrendChart data={trendData} label={activeCountry} />
                <div className="flex justify-between text-xs text-gray-700 mt-1 px-1">
                  <span>W02</span>
                  <span>W05</span>
                  <span>W08</span>
                  <span>W11</span>
                  <span className="text-gray-500 font-bold">W13 (now)</span>
                </div>
              </div>

              {/* Country scorecard table */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  LAM Country Scorecard — W13 2026
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        {["Country", "F→P Gap", "Rev at Risk", "Inv Cost", "Signal Days", "Automation", "Status"].map((h) => (
                          <th key={h} className="py-2 px-2 text-gray-600 uppercase tracking-wider font-bold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {countries.map((c) => {
                        const exceeds = Math.abs(c.gap) > 15;
                        const isActive = activeCountry === c.code;
                        return (
                          <tr
                            key={c.code}
                            onClick={() => setActiveCountry(c.code)}
                            className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                              isActive ? "bg-gray-800" : "hover:bg-gray-800/40"
                            }`}
                          >
                            <td className="py-2.5 px-2 font-bold">{c.name}</td>
                            <td className="py-2.5 px-2">
                              <span className={`font-black ${exceeds ? "text-red-400" : c.gap > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                                {c.gap > 0 ? "+" : ""}{c.gap}%
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-red-400 font-bold">${c.revenueRisk}M</td>
                            <td className="py-2.5 px-2 text-amber-400 font-bold">${c.invCost}M</td>
                            <td className="py-2.5 px-2 text-blue-400">{c.signalDays}d</td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-gray-800">
                                  <div className="h-1 bg-emerald-500" style={{ width: `${c.automation}%` }} />
                                </div>
                                <span className="text-gray-400">{c.automation}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              {exceeds ? (
                                <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase rounded">
                                  Alert
                                </span>
                              ) : Math.abs(c.gap) > 8 ? (
                                <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase rounded">
                                  Watch
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase rounded">
                                  On Track
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer note */}
              <div className="border border-gray-800 p-4 flex items-start gap-3">
                <span className="text-amber-500 flex-shrink-0 mt-0.5">ℹ</span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-500">WMAPE never appears on this screen.</strong>{" "}
                  Executives track business outcomes — revenue risk, inventory cost, and gap to plan.
                  Technical model performance is governed in the MLOps Studio by the Data Science team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
