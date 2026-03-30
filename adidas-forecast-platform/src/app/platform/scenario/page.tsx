"use client";
import { useState, useMemo } from "react";
import PlatformNav from "../components/PlatformNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForecastModel {
  id: number;
  rank: number;
  name: string;
  wmape: number;
  ci: string;
  lastUpdated: string;
  color: string;
  lineClass: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const models: ForecastModel[] = [
  { id: 0, rank: 1, name: "Ensemble XGBoost + LGB", wmape: 17.2, ci: "±8.1%", lastUpdated: "2d ago", color: "#10b981", lineClass: "bg-emerald-500" },
  { id: 1, rank: 2, name: "LightGBM Gradient Boost", wmape: 18.6, ci: "±9.3%", lastUpdated: "5d ago", color: "#3b82f6", lineClass: "bg-blue-500" },
  { id: 2, rank: 3, name: "Prophet-SARIMA Hybrid", wmape: 21.3, ci: "±11.4%", lastUpdated: "8d ago", color: "#a855f7", lineClass: "bg-purple-500" },
];

// Base weekly forecasts (units) — 8 weeks
const baseForecasts = [
  [1240, 1320, 1180, 1450, 1390, 1520, 1480, 1650],
  [1210, 1290, 1210, 1480, 1340, 1490, 1510, 1610],
  [1190, 1350, 1150, 1510, 1420, 1560, 1440, 1700],
];

const weeks = ["W14", "W15", "W16", "W17", "W18", "W19", "W20", "W21"];

// ─── Multi-line SVG Chart ─────────────────────────────────────────────────────

function ForecastChart({
  series,
  colors,
  selectedIdx,
  labels,
}: {
  series: number[][];
  colors: string[];
  selectedIdx: number;
  labels: string[];
}) {
  const W = 520;
  const H = 180;
  const PAD_L = 48;
  const PAD_R = 16;
  const PAD_T = 12;
  const PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = series.flat();
  const max = Math.max(...allVals) * 1.05;
  const min = Math.min(...allVals) * 0.95;
  const range = max - min;

  const toX = (i: number) => PAD_L + (i / (labels.length - 1)) * chartW;
  const toY = (v: number) => PAD_T + chartH - ((v - min) / range) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD_T + t * chartH;
        const val = Math.round(max - t * range);
        return (
          <g key={t}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1f2937" strokeWidth="1" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fill="#4b5563" fontSize="9">
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            </text>
          </g>
        );
      })}
      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fill="#4b5563" fontSize="9">
          {l}
        </text>
      ))}
      {/* Lines — unselected first (dimmed), then selected on top */}
      {series
        .map((_, i) => i)
        .filter((i) => i !== selectedIdx)
        .map((i) => {
          const pts = series[i].map((d, j) => `${toX(j)},${toY(d)}`).join(" ");
          return (
            <polyline
              key={i}
              points={pts}
              fill="none"
              stroke={colors[i]}
              strokeWidth="1.5"
              opacity={0.25}
              strokeDasharray="4 3"
            />
          );
        })}
      {/* Selected model line + area */}
      {(() => {
        const d = series[selectedIdx];
        const pts = d.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        const area = `${toX(0)},${PAD_T + chartH} ${pts} ${toX(d.length - 1)},${PAD_T + chartH}`;
        return (
          <g>
            <polygon points={area} fill={colors[selectedIdx]} opacity={0.08} />
            <polyline points={pts} fill="none" stroke={colors[selectedIdx]} strokeWidth="2.5" strokeLinejoin="round" />
            {d.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill={colors[selectedIdx]} />
            ))}
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Slider control ───────────────────────────────────────────────────────────

function ScenarioSlider({
  label,
  sub,
  min,
  max,
  value,
  unit,
  onChange,
  color,
}: {
  label: string;
  sub: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  color: string;
}) {
  const isNeutral = value === 0 || value === 1.0;
  const display = unit === "×" ? value.toFixed(2) : value > 0 ? `+${value}` : `${value}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wide">{label}</div>
          <div className="text-xs text-gray-600">{sub}</div>
        </div>
        <span
          className={`text-sm font-black tabular-nums ${isNeutral ? "text-gray-500" : color}`}
        >
          {display}{unit !== "×" && unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={unit === "×" ? 0.05 : 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-white"
      />
      <div className="flex justify-between text-xs text-gray-700 mt-0.5">
        <span>{min}{unit !== "×" && unit}</span>
        <span>0{unit !== "×" && unit}</span>
        <span>+{max}{unit !== "×" && unit}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScenarioPlanner() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [competitorEvent, setCompetitorEvent] = useState(0);
  const [seasonalIndex, setSeasonalIndex] = useState(1.0);
  const [macroShock, setMacroShock] = useState(0);
  const [locked, setLocked] = useState(false);
  const [locking, setLocking] = useState(false);
  const [activeCountry, setActiveCountry] = useState("BR");
  const [activeSku, setActiveSku] = useState("Ultra Boost 22 – Black – 42");

  const countries = ["BR", "MX", "AR", "CO", "CL", "PE"];
  const skus = [
    "Ultra Boost 22 – Black – 42",
    "Ultraboost Light – White – 40",
    "Adizero SL – Coral – 39",
    "Grand Court 2.0 – Navy – 43",
  ];

  // Scenario multiplier logic (each model reacts slightly differently)
  const scenarioFactor = useMemo(() => {
    const promo = 1 + (promoDiscount / 100) * 0.45;
    const competitor = 1 - (competitorEvent / 100) * 0.30;
    const seasonal = seasonalIndex;
    const macro = 1 + (macroShock / 100) * 0.60;
    const base = promo * competitor * seasonal * macro;
    // Per-model sensitivity variation
    return [base * 1.00, base * 1.04, base * 0.97];
  }, [promoDiscount, competitorEvent, seasonalIndex, macroShock]);

  const adjustedForecasts = useMemo(
    () => baseForecasts.map((series, mi) => series.map((v) => Math.round(v * scenarioFactor[mi]))),
    [scenarioFactor]
  );

  const isScenarioActive =
    promoDiscount !== 0 || competitorEvent !== 0 || seasonalIndex !== 1.0 || macroShock !== 0;

  const handleLock = () => {
    setLocking(true);
    setTimeout(() => {
      setLocking(false);
      setLocked(true);
    }, 800);
  };

  const selectedForecast = adjustedForecasts[selectedModel];
  const totalUnits = selectedForecast.reduce((a, b) => a + b, 0);
  const baseTotal = baseForecasts[selectedModel].reduce((a, b) => a + b, 0);
  const deltaTotal = totalUnits - baseTotal;
  const deltaPct = ((deltaTotal / baseTotal) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PlatformNav />

      <div className="pt-14">
        {/* Page header */}
        <div className="bg-black border-b border-gray-800 px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Module 02 — Scenario Planner
                </span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                What-If Forecast Simulator
              </h1>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={activeSku}
                onChange={(e) => { setActiveSku(e.target.value); setLocked(false); }}
                className="bg-gray-900 border border-gray-700 text-white text-xs px-3 py-2 uppercase tracking-wider cursor-pointer"
              >
                {skus.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-px">
                {countries.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setActiveCountry(c); setLocked(false); }}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      activeCountry === c ? "bg-white text-black" : "bg-gray-900 text-gray-500 hover:text-white border border-gray-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left panel: Models + Scenario ── */}
            <div className="flex flex-col gap-5">

              {/* Top-3 model cards */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Top-3 Certified Models
                </div>
                <div className="flex flex-col gap-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setLocked(false); }}
                      className={`text-left p-4 border transition-all ${
                        selectedModel === m.id
                          ? "border-white bg-gray-800"
                          : "border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className="text-xs font-black uppercase tracking-wide">
                            Rank #{m.rank}
                          </span>
                        </div>
                        {selectedModel === m.id && (
                          <span className="text-xs text-emerald-400 font-bold">● Active</span>
                        )}
                      </div>
                      <div className="text-sm font-bold leading-tight mb-2">{m.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">WMAPE</div>
                          <div className="font-black text-emerald-400">{m.wmape}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">95% CI</div>
                          <div className="font-bold">{m.ci}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Updated</div>
                          <div className="font-bold">{m.lastUpdated}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario levers */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Scenario Levers
                  </div>
                  {isScenarioActive && (
                    <button
                      onClick={() => {
                        setPromoDiscount(0);
                        setCompetitorEvent(0);
                        setSeasonalIndex(1.0);
                        setMacroShock(0);
                        setLocked(false);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-wider"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-5">
                  <ScenarioSlider
                    label="Promo Discount"
                    sub="Elasticity effect on demand"
                    min={-20}
                    max={50}
                    value={promoDiscount}
                    unit="%"
                    onChange={(v) => { setPromoDiscount(v); setLocked(false); }}
                    color="text-emerald-400"
                  />
                  <ScenarioSlider
                    label="Competitor Event"
                    sub="Positive = competitor promo"
                    min={-30}
                    max={30}
                    value={competitorEvent}
                    unit="%"
                    onChange={(v) => { setCompetitorEvent(v); setLocked(false); }}
                    color="text-amber-400"
                  />
                  <ScenarioSlider
                    label="Seasonal Index"
                    sub="Demand multiplier"
                    min={0.5}
                    max={1.5}
                    value={seasonalIndex}
                    unit="×"
                    onChange={(v) => { setSeasonalIndex(v); setLocked(false); }}
                    color="text-blue-400"
                  />
                  <ScenarioSlider
                    label="Macro Shock"
                    sub="Brazil GDP / consumer index"
                    min={-20}
                    max={20}
                    value={macroShock}
                    unit="%"
                    onChange={(v) => { setMacroShock(v); setLocked(false); }}
                    color="text-red-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Right panel: Chart + summary ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Scenario badge */}
              {isScenarioActive && (
                <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 flex items-center gap-3">
                  <span className="text-amber-400 text-sm">◆</span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Custom scenario active — forecast adjusted for selected conditions
                  </span>
                </div>
              )}

              {/* Forecast chart */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide">
                      8-Week Demand Forecast
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeSku} · {activeCountry} · eCommerce
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {models.map((m) => (
                      <div key={m.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span
                          className="inline-block w-3 h-0.5"
                          style={{
                            backgroundColor: m.color,
                            opacity: selectedModel === m.id ? 1 : 0.3,
                          }}
                        />
                        <span style={{ opacity: selectedModel === m.id ? 1 : 0.4 }}>M{m.rank}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ForecastChart
                  series={adjustedForecasts}
                  colors={models.map((m) => m.color)}
                  selectedIdx={selectedModel}
                  labels={weeks}
                />
              </div>

              {/* 8-week summary table */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Weekly Breakdown — {models[selectedModel].name}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="py-2 text-left text-gray-600 uppercase tracking-wider">Week</th>
                        {weeks.map((w) => (
                          <th key={w} className="py-2 text-right text-gray-600 uppercase tracking-wider">{w}</th>
                        ))}
                        <th className="py-2 text-right text-gray-600 uppercase tracking-wider">8W Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800/50">
                        <td className="py-2 text-gray-500">Baseline</td>
                        {baseForecasts[selectedModel].map((v, i) => (
                          <td key={i} className="py-2 text-right text-gray-500">{v.toLocaleString()}</td>
                        ))}
                        <td className="py-2 text-right text-gray-500 font-bold">{baseTotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold">Scenario</td>
                        {adjustedForecasts[selectedModel].map((v, i) => (
                          <td key={i} className="py-2 text-right font-bold">{v.toLocaleString()}</td>
                        ))}
                        <td className="py-2 text-right font-black">{totalUnits.toLocaleString()}</td>
                      </tr>
                      {isScenarioActive && (
                        <tr className="text-xs">
                          <td className="py-1 text-gray-600">Delta</td>
                          {adjustedForecasts[selectedModel].map((v, i) => {
                            const d = v - baseForecasts[selectedModel][i];
                            return (
                              <td key={i} className={`py-1 text-right ${d >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {d >= 0 ? "+" : ""}{d}
                              </td>
                            );
                          })}
                          <td className={`py-1 text-right font-bold ${deltaTotal >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {deltaTotal >= 0 ? "+" : ""}{deltaTotal.toLocaleString()} ({deltaPct >= "0" ? "+" : ""}{deltaPct}%)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lock forecast */}
              <div className="bg-gray-900 border border-gray-800 p-5">
                {locked ? (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-emerald-400 uppercase tracking-wide mb-0.5">
                        Forecast Locked
                      </div>
                      <div className="text-xs text-gray-500">
                        {models[selectedModel].name} · {activeSku} · {activeCountry} · {totalUnits.toLocaleString()} units over 8 weeks
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Ready to export to SAP IBP · Logged in Forecast Registry
                      </div>
                    </div>
                    <button
                      onClick={() => setLocked(false)}
                      className="text-xs text-gray-700 hover:text-gray-400 uppercase tracking-wider"
                    >
                      Revise
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold mb-0.5">Ready to commit?</div>
                      <div className="text-xs text-gray-500">
                        Locking commits this forecast for W14–W21 planning cycle
                      </div>
                    </div>
                    <button
                      onClick={handleLock}
                      disabled={locking}
                      className={`flex-shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                        locking
                          ? "bg-gray-700 text-gray-500 cursor-wait"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {locking ? "Locking…" : "Lock Forecast →"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
