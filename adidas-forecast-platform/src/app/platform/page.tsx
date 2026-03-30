"use client";
import Link from "next/link";
import { useState } from "react";

const AdidasMark = () => (
  <div className="flex items-center gap-3">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="0" y="6" width="7" height="22" rx="1" fill="white" />
      <rect x="10.5" y="0" width="7" height="28" rx="1" fill="white" />
      <rect x="21" y="6" width="7" height="22" rx="1" fill="white" />
    </svg>
    <span
      className="text-2xl font-black tracking-tighter lowercase text-white"
      style={{ letterSpacing: "-0.04em" }}
    >
      adidas
    </span>
  </div>
);

const roles = [
  {
    href: "/platform/mlops",
    number: "01",
    title: "MLOps Studio",
    role: "Data Scientist",
    tagline: "Govern the models. Own production.",
    description:
      "Monitor production model performance in real time, run challenger experiments, and decide which algorithms earn their place in the forecast stack.",
    features: [
      "Live WMAPE & PSI monitoring",
      "A/B challenger experiments",
      "Promote / retire via MLflow Registry",
      "Drift detection & auto-retrain triggers",
    ],
    accent: "#3b82f6",
    dotClass: "bg-blue-500",
    borderClass: "hover:border-blue-500",
    tagClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    btnClass: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  {
    href: "/platform/scenario",
    number: "02",
    title: "Scenario Planner",
    role: "Data Analyst / Category Manager",
    tagline: "Simulate. Compare. Decide.",
    description:
      "Access the top-3 certified forecast models and adjust market conditions — promotions, competitor events, macro shocks — to see how demand responds.",
    features: [
      "Top-3 model comparison",
      "What-if scenario sliders",
      "Confidence interval visualization",
      "Export locked forecast to SAP IBP",
    ],
    accent: "#10b981",
    dotClass: "bg-emerald-500",
    borderClass: "hover:border-emerald-500",
    tagClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  {
    href: "/platform/executive",
    number: "03",
    title: "Executive Dashboard",
    role: "CEO / Country GM / C-Level",
    tagline: "Outcomes. No statistics.",
    description:
      "Track the Forecast-to-Plan gap in pure business terms. Revenue at risk, inventory opportunity cost, and market reaction speed — weekly, by country.",
    features: [
      "Forecast vs Plan gap tracking",
      "Revenue at risk by country",
      "±15% threshold alerts",
      "Business KPI command center",
    ],
    accent: "#f59e0b",
    dotClass: "bg-amber-500",
    borderClass: "hover:border-amber-500",
    tagClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
  },
];

export default function PlatformLanding() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-gray-900 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <AdidasMark />
        <Link
          href="/"
          className="text-xs text-gray-600 hover:text-gray-300 uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          ← Back to proposal
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white" />
              <div className="w-1 h-4 bg-white" />
              <div className="w-1 h-4 bg-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Demand Forecasting Platform — LAM
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            Select
            <br />
            Your
            <br />
            <span className="text-gray-600">Module</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Three purpose-built experiences for three distinct roles. Each module is
            designed around what you actually need to do — not what someone else thinks you need.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800">
          {roles.map((role, i) => (
            <Link
              key={role.href}
              href={role.href}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group bg-gray-950 border border-transparent ${role.borderClass} flex flex-col p-8 transition-all duration-200`}
            >
              {/* Number + dot */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">
                  {role.number}
                </span>
                <span className={`w-2 h-2 rounded-full ${role.dotClass}`} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black uppercase tracking-tight mb-1 group-hover:text-white transition-colors">
                {role.title}
              </h2>

              {/* Role badge */}
              <div className={`inline-flex self-start px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide mb-5 ${role.tagClass}`}>
                {role.role}
              </div>

              {/* Tagline */}
              <p className="text-base font-bold italic text-gray-300 mb-4">
                &ldquo;{role.tagline}&rdquo;
              </p>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                {role.description}
              </p>

              {/* Features list */}
              <ul className="space-y-2 mb-8">
                {role.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: role.accent }}>
                      ▸
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div
                className={`${role.btnClass} text-center py-3 text-xs font-bold uppercase tracking-widest transition-all`}
              >
                Enter Module →
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 border-t border-gray-900 pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <p className="text-xs text-gray-600 max-w-lg leading-relaxed">
            This is a live simulation of the platform described in the technical proposal.
            Data is illustrative of the adidas LAM forecasting context.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">Simulation active</span>
          </div>
        </div>
      </div>
    </main>
  );
}
