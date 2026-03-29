"use client";
import { useState } from "react";

const modules = [
  {
    id: "mlops",
    number: "01",
    title: "MLOps Studio",
    audience: "Data Scientists & ML Engineers",
    tagline: "They hold the keys to production.",
    icon: "⚗️",
    color: "bg-white",
    description:
      "A real-time experimentation environment where Data Scientists govern the entire ML lifecycle. They decide which models enter production and which are retired — no bureaucracy, full accountability.",
    submodules: [
      {
        name: "Production Monitor",
        icon: "📡",
        items: [
          "Live WMAPE, PSI, and drift alerts per channel × country",
          "Auto-retrain trigger history and SLA tracking",
          "Consumer Intelligence signal freshness monitor",
          "Model version lineage and performance timeline",
        ],
      },
      {
        name: "Challenger Lab",
        icon: "🔬",
        items: [
          "Register new model experiments against production champions",
          "Set A/B test parameters and time-boxed challenger windows",
          "Compare challenger vs champion on holdout evaluation sets",
          "✅ Promote to production or ❌ retire via MLflow Registry",
        ],
      },
    ],
    keyPrinciple:
      "Top-3 production models are exposed to the Scenario Planner — ranked by WMAPE on the most recent evaluation period.",
  },
  {
    id: "scenario",
    number: "02",
    title: "Scenario Planner",
    audience: "Category Managers, Product Owners, Marketing, Analysts",
    tagline: "Business simulation without ML expertise.",
    icon: "🎯",
    color: "bg-white",
    description:
      "A business simulation workspace that surfaces the top-3 forecast models and lets users configure market conditions to see how demand responds. Users retain full decision authority — the platform enhances judgment, not replaces it.",
    submodules: [
      {
        name: "Top-3 Model View",
        icon: "🏆",
        items: [
          "See 3 best performing models for any SKU × channel × country",
          "Compare prediction intervals and confidence scores",
          "Model context: trained on, last updated, WMAPE",
          "No ML expertise required — plain language explanations",
        ],
      },
      {
        name: "What-If Simulator",
        icon: "🔄",
        items: [
          "Adjust: promotional discount %, competitor event, macro shock",
          "Seasonal multiplier, supply constraint, pricing change",
          "Side-by-side: how each of the 3 models responds to your scenario",
          "Select best forecast → export to SAP IBP inventory planning",
        ],
      },
    ],
    keyPrinciple:
      "4-week shadow mode before cutover: ML forecasts run alongside spreadsheets so Category Managers can compare accuracy directly before committing.",
  },
  {
    id: "executive",
    number: "03",
    title: "Executive Dashboard",
    audience: "CEO, CFO, Country GMs, Commercial Leaders",
    tagline: "Business KPIs. No statistics. Every week.",
    icon: "📈",
    color: "bg-white",
    description:
      "A strategic command center tracking the Forecast-to-Plan Gap and business opportunity cost — updated weekly post each forecast cycle. KPIs are expressed in revenue and cost terms, not WMAPE.",
    submodules: [
      {
        name: "Forecast-to-Plan Tracker",
        icon: "📊",
        items: [
          "Live delta: ML forecast vs financial/operational plan",
          "By country, channel, category — drill-down available",
          "Gap trend over time: is alignment improving or widening?",
          "Alert when gap exceeds ±15% threshold",
        ],
      },
      {
        name: "Business KPI Command Center",
        icon: "💼",
        items: [
          "Revenue at Risk: projected stockout exposure by country",
          "Inventory Opportunity Cost: overstock margin erosion",
          "Market Reaction Speed: signal-to-decision days",
          "Analyst Automation Rate: % of cycle now automated",
        ],
      },
    ],
    keyPrinciple:
      "KPIs are in business language only — WMAPE never appears on this screen. Executives track outcomes, Data Scientists track model performance.",
  },
];

export default function PlatformModules() {
  const [active, setActive] = useState(0);
  const mod = modules[active];

  return (
    <section id="vision" className="bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Platform Vision
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Three
            <br />
            Modules.
            <br />
            <span className="text-gray-500">One Platform.</span>
          </h2>
          <p className="text-gray-400 max-w-md text-base leading-relaxed">
            Each user type gets a purpose-built experience. Data Scientists govern models. Business users simulate scenarios. Executives track outcomes.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-col sm:flex-row gap-px bg-gray-800 mb-0">
          {modules.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={`flex-1 px-6 py-5 text-left transition-all ${
                active === i
                  ? "bg-white text-black"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-1">
                {m.number}
              </div>
              <div className="text-sm font-black uppercase tracking-tight">{m.title}</div>
              <div className={`text-xs mt-1 ${active === i ? "text-gray-600" : "text-gray-600"}`}>
                {m.audience.split(",")[0].trim()}
                {m.audience.includes(",") ? " + more" : ""}
              </div>
            </button>
          ))}
        </div>

        {/* Active module content */}
        <div className="bg-white text-black p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            {/* Left */}
            <div className="md:w-2/5">
              <div className="text-5xl mb-4">{mod.icon}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Module {mod.number}
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">
                {mod.title}
              </h3>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                {mod.audience}
              </p>
              <div className="text-lg font-black italic mb-6">
                &ldquo;{mod.tagline}&rdquo;
              </div>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                {mod.description}
              </p>
              <div className="bg-black text-white p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Key Design Principle
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {mod.keyPrinciple}
                </p>
              </div>
            </div>

            {/* Right: Sub-modules */}
            <div className="md:w-3/5 flex flex-col gap-6">
              {mod.submodules.map((sub, si) => (
                <div key={si} className="border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{sub.icon}</span>
                    <h4 className="text-base font-black uppercase tracking-tight">
                      {sub.name}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {sub.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="text-black font-bold mt-0.5 flex-shrink-0">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
