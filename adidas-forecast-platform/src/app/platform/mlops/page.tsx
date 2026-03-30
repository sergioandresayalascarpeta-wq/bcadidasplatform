"use client";
import { useState, useEffect } from "react";
import PlatformNav from "../components/PlatformNav";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModelStatus = "CHAMPION" | "SHADOW" | "RETIRING";
type ExpStatus = "WINNING" | "RUNNING" | "CONCLUDED" | "RETIRED";

interface ProductionModel {
  id: string;
  name: string;
  version: string;
  wmape: number;
  psi: number;
  drift: "stable" | "warning" | "alert";
  status: ModelStatus;
  retrained: string;
  coverage: number;
}

interface Experiment {
  id: string;
  name: string;
  started: string;
  days: number;
  wmape: number;
  delta: number;
  status: ExpStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const initialModels: ProductionModel[] = [
  { id: "m1", name: "Ensemble XGBoost + LGB", version: "v4.2", wmape: 17.2, psi: 0.08, drift: "stable", status: "CHAMPION", retrained: "2d ago", coverage: 94 },
  { id: "m2", name: "LightGBM Gradient Boost", version: "v3.1", wmape: 18.6, psi: 0.06, drift: "stable", status: "SHADOW", retrained: "5d ago", coverage: 91 },
  { id: "m3", name: "Prophet-SARIMA Hybrid", version: "v2.4", wmape: 21.3, psi: 0.11, drift: "warning", status: "SHADOW", retrained: "8d ago", coverage: 88 },
  { id: "m4", name: "CatBoost Sequential", version: "v1.7", wmape: 24.8, psi: 0.15, drift: "alert", status: "RETIRING", retrained: "15d ago", coverage: 79 },
];

const initialExperiments: Experiment[] = [
  { id: "EXP-044", name: "NeuralProphet v2.1", started: "8d ago", days: 8, wmape: 16.1, delta: -1.1, status: "WINNING" },
  { id: "EXP-043", name: "Temporal Fusion Transformer", started: "4d ago", days: 4, wmape: 17.8, delta: 0.6, status: "RUNNING" },
  { id: "EXP-041", name: "LSTM w/ Attention Embeddings", started: "21d ago", days: 21, wmape: 22.3, delta: 5.1, status: "CONCLUDED" },
];

// 12-week WMAPE trend for champion (improving)
const championTrend = [22.1, 21.3, 20.8, 19.6, 19.1, 18.4, 18.9, 18.1, 17.6, 17.4, 17.2, 17.0];
const industryAvg   = [25.0, 24.5, 24.1, 23.8, 23.4, 23.2, 23.0, 22.8, 22.6, 22.4, 22.1, 21.9];

// ─── Small helpers ────────────────────────────────────────────────────────────

const statusColors: Record<ModelStatus, string> = {
  CHAMPION: "bg-green-500/10 text-green-400 border border-green-500/20",
  SHADOW: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  RETIRING: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const driftColors: Record<string, string> = {
  stable: "text-green-400",
  warning: "text-amber-400",
  alert: "text-red-400",
};

const driftIcons: Record<string, string> = {
  stable: "●",
  warning: "◆",
  alert: "▲",
};

const expStatusColors: Record<ExpStatus, string> = {
  WINNING: "bg-green-500/10 text-green-400 border border-green-500/20",
  RUNNING: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  CONCLUDED: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  RETIRED: "bg-red-500/10 text-red-400 border border-red-500/20",
};

// ─── SVG Sparkline ────────────────────────────────────────────────────────────

function Sparkline({
  data,
  data2,
  color = "#3b82f6",
  color2 = "#374151",
  h = 80,
}: {
  data: number[];
  data2?: number[];
  color?: string;
  color2?: string;
  h?: number;
}) {
  const W = 480;
  const PAD = 8;
  const allVals = data2 ? [...data, ...data2] : data;
  const max = Math.max(...allVals);
  const min = Math.min(...allVals);
  const range = max - min || 1;

  const toX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => h - PAD - ((v - min) / range) * (h - PAD * 2);

  const line1 = data.map((d, i) => `${toX(i)},${toY(d)}`).join(" ");
  const area1 = `${toX(0)},${h} ${line1} ${toX(data.length - 1)},${h}`;

  const line2 = data2?.map((d, i) => `${toX(i)},${toY(d)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD}
          y1={PAD + t * (h - PAD * 2)}
          x2={W - PAD}
          y2={PAD + t * (h - PAD * 2)}
          stroke="#1f2937"
          strokeWidth="1"
        />
      ))}
      {/* Area fill */}
      <polygon points={area1} fill={color} opacity={0.08} />
      {/* Industry avg line */}
      {line2 && (
        <polyline
          points={line2}
          fill="none"
          stroke={color2}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}
      {/* Main line */}
      <polyline points={line1} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1])}
        r={3}
        fill={color}
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MLOpsStudio() {
  const [tab, setTab] = useState<"monitor" | "challenger">("monitor");
  const [models, setModels] = useState<ProductionModel[]>(initialModels);
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [selectedModel, setSelectedModel] = useState<string>("m1");
  const [toast, setToast] = useState<string | null>(null);
  const [liveWmape, setLiveWmape] = useState(17.2);

  // Simulate live WMAPE fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveWmape((prev) => {
        const delta = (Math.random() - 0.5) * 0.3;
        return Math.max(15.0, Math.min(19.0, parseFloat((prev + delta).toFixed(1))));
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handlePromote = (expId: string) => {
    const exp = experiments.find((e) => e.id === expId);
    if (!exp) return;
    // Demote current champion to shadow
    setModels((prev) =>
      prev.map((m) =>
        m.status === "CHAMPION"
          ? { ...m, status: "SHADOW" }
          : m
      )
    );
    // Add new champion
    const newChamp: ProductionModel = {
      id: expId,
      name: exp.name,
      version: "v1.0",
      wmape: exp.wmape,
      psi: 0.05,
      drift: "stable",
      status: "CHAMPION",
      retrained: "just now",
      coverage: 92,
    };
    setModels((prev) => [newChamp, ...prev]);
    setExperiments((prev) => prev.filter((e) => e.id !== expId));
    showToast(`✓ ${exp.name} promoted to CHAMPION and registered in MLflow`);
  };

  const handleRetire = (expId: string) => {
    const exp = experiments.find((e) => e.id === expId);
    if (!exp) return;
    setExperiments((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: "RETIRED" as ExpStatus } : e))
    );
    showToast(`${exp.name} retired — experiment archived in MLflow`);
  };

  const champion = models.find((m) => m.status === "CHAMPION");
  const selectedMod = models.find((m) => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PlatformNav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-5 py-3 shadow-xl max-w-sm">
          {toast}
        </div>
      )}

      <div className="pt-14">
        {/* Page header */}
        <div className="bg-black border-b border-gray-800 px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Module 01 — MLOps Studio
                </span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Production Model Governance
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Brazil · eCommerce · Running Footwear — W13 2026
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Live WMAPE</div>
                <div className="text-2xl font-black text-blue-400">
                  {liveWmape.toFixed(1)}%
                  <span className="text-xs text-gray-600 ml-1 font-normal">Champion</span>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-800" />
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Models in prod</div>
                <div className="text-2xl font-black">{models.length}</div>
              </div>
              <div className="w-px h-10 bg-gray-800" />
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">Active experiments</div>
                <div className="text-2xl font-black">
                  {experiments.filter((e) => e.status === "RUNNING" || e.status === "WINNING").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black border-b border-gray-800 px-6">
          <div className="max-w-7xl mx-auto flex gap-px">
            {(["monitor", "challenger"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  tab === t
                    ? "bg-white text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {t === "monitor" ? "📡 Production Monitor" : "🔬 Challenger Lab"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {tab === "monitor" ? (
            <div className="flex flex-col gap-8">
              {/* Performance trend chart */}
              <div className="bg-gray-900 border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide">Champion WMAPE — 12-Week Trend</h2>
                    <p className="text-xs text-gray-500 mt-0.5">vs. LAM industry benchmark</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-0.5 bg-blue-500" />
                      Champion
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-0.5 bg-gray-600 border-dashed border-t border-gray-600" />
                      Industry avg
                    </div>
                  </div>
                </div>
                <Sparkline data={championTrend} data2={industryAvg} color="#3b82f6" color2="#4b5563" h={100} />
                <div className="flex justify-between text-xs text-gray-700 mt-1 px-1">
                  <span>W02</span>
                  <span>W05</span>
                  <span>W08</span>
                  <span>W11</span>
                  <span>W13</span>
                </div>
              </div>

              {/* Models table */}
              <div className="bg-gray-900 border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wide">Production Models</h2>
                  <span className="text-xs text-gray-600">Click row for detail</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        {["Model", "Version", "WMAPE", "PSI", "Drift", "Coverage", "Retrained", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                            selectedModel === m.id ? "bg-gray-800" : "hover:bg-gray-800/50"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium">{m.name}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{m.version}</td>
                          <td className="px-4 py-3">
                            <span className={m.wmape <= 18 ? "text-green-400 font-bold" : m.wmape <= 22 ? "text-amber-400" : "text-red-400"}>
                              {m.wmape.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{m.psi.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`${driftColors[m.drift]} text-xs font-bold`}>
                              {driftIcons[m.drift]} {m.drift}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{m.coverage}% SKUs</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{m.retrained}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded ${statusColors[m.status]}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected model detail */}
              {selectedMod && (
                <div className="bg-gray-900 border border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wide mb-1">Model Detail</h2>
                      <div className="text-xl font-black">{selectedMod.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{selectedMod.version}</div>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[selectedMod.status]}`}>
                      {selectedMod.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "WMAPE", value: `${selectedMod.wmape.toFixed(1)}%`, sub: "Evaluation set" },
                      { label: "PSI Score", value: selectedMod.psi.toFixed(2), sub: "Population Stability" },
                      { label: "SKU Coverage", value: `${selectedMod.coverage}%`, sub: "of portfolio" },
                      { label: "Last Retrained", value: selectedMod.retrained, sub: "Auto-trigger" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-800 p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className="text-xl font-black mb-0.5">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Challenger Lab */
            <div className="flex flex-col gap-6">
              {/* Banner */}
              <div className="bg-blue-500/5 border border-blue-500/20 p-5 flex items-start gap-4">
                <span className="text-blue-400 text-lg flex-shrink-0 mt-0.5">🔬</span>
                <div>
                  <div className="text-sm font-bold text-blue-300 mb-1">Challenger Lab — Active Window</div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Experiments run as shadows against the current Champion on held-out evaluation data.
                    A challenger must beat the Champion on WMAPE for ≥7 consecutive days to be eligible for promotion.
                    Promotion and retirement are permanent actions logged to MLflow Model Registry.
                  </p>
                </div>
              </div>

              {/* Current champion reference */}
              {champion && (
                <div className="bg-gray-900 border border-green-500/20 p-5">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Champion to beat</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg">{champion.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{champion.version} · retrained {champion.retrained}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-400">{liveWmape.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Live WMAPE</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Experiment cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiments.map((exp) => {
                  const isBetter = exp.delta < 0;
                  const isActionable = exp.status === "WINNING";
                  const isActive = exp.status === "RUNNING" || exp.status === "WINNING";

                  return (
                    <div
                      key={exp.id}
                      className={`bg-gray-900 border p-6 flex flex-col gap-4 ${
                        exp.status === "WINNING"
                          ? "border-green-500/30"
                          : exp.status === "RETIRED"
                          ? "border-gray-800 opacity-50"
                          : "border-gray-800"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-gray-600 font-mono mb-0.5">{exp.id}</div>
                          <div className="font-bold text-sm leading-tight">{exp.name}</div>
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded ${expStatusColors[exp.status]}`}>
                          {exp.status}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-800 p-2.5 text-center">
                          <div className="text-xs text-gray-600 mb-0.5">WMAPE</div>
                          <div className={`text-sm font-black ${isBetter ? "text-green-400" : "text-red-400"}`}>
                            {exp.wmape.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-gray-800 p-2.5 text-center">
                          <div className="text-xs text-gray-600 mb-0.5">vs Champ</div>
                          <div className={`text-sm font-black ${isBetter ? "text-green-400" : "text-red-400"}`}>
                            {isBetter ? "" : "+"}{exp.delta.toFixed(1)}pp
                          </div>
                        </div>
                        <div className="bg-gray-800 p-2.5 text-center">
                          <div className="text-xs text-gray-600 mb-0.5">Days</div>
                          <div className="text-sm font-black">{exp.days}</div>
                        </div>
                      </div>

                      {/* Progress bar (days toward 7-day threshold) */}
                      {isActive && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Evaluation window</span>
                            <span>{Math.min(exp.days, 14)}/14 days</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded">
                            <div
                              className={`h-1.5 rounded transition-all ${isBetter ? "bg-green-500" : "bg-amber-500"}`}
                              style={{ width: `${Math.min((exp.days / 14) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {isActive && (
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => handlePromote(exp.id)}
                            disabled={!isActionable}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                              isActionable
                                ? "bg-green-600 hover:bg-green-500 text-white"
                                : "bg-gray-800 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            ✓ Promote
                          </button>
                          <button
                            onClick={() => handleRetire(exp.id)}
                            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                          >
                            × Retire
                          </button>
                        </div>
                      )}
                      {exp.status === "CONCLUDED" && (
                        <div className="text-xs text-gray-600 text-center py-1">
                          Experiment concluded — underperformed champion
                        </div>
                      )}
                      {exp.status === "RETIRED" && (
                        <div className="text-xs text-gray-600 text-center py-1">
                          Archived in MLflow Registry
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state for new experiment CTA */}
              <div className="border border-dashed border-gray-800 p-8 text-center">
                <div className="text-gray-700 text-2xl mb-2">+</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">
                  Register new experiment via MLflow SDK or CLI
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
