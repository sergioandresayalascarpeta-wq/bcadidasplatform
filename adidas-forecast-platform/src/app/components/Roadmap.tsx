const phases = [
  {
    number: "0",
    name: "Foundation",
    timeline: "Months 1–2",
    milestone: "Infrastructure Live",
    milestoneMonth: "M2",
    color: "bg-gray-100",
    textColor: "text-black",
    items: [
      "AWS VPC (sa-east-1) + KMS + IAM",
      "Databricks Workspace (Dev/Staging/Prod)",
      "Unity Catalog + RBAC configuration",
      "CI/CD: Asset Bundles + GitHub Actions",
    ],
    team: "1 Platform Eng + 1 Cloud Eng + 1 Data Architect",
  },
  {
    number: "1",
    name: "Core Data Platform",
    timeline: "Months 2–5",
    milestone: "Bronze-to-Gold Live",
    milestoneMonth: "M5",
    color: "bg-gray-200",
    textColor: "text-black",
    items: [
      "Bronze: SAP ERP (Fivetran), POS (MSK), eComm (MSK)",
      "Silver: Unified Product Master (>95% auto-match)",
      "Silver: Standardized Demand Signals",
      "Gold: Base aggregations + BI views",
      "Focus: Brazil + Mexico",
    ],
    team: "+ 2 Data Engineers",
  },
  {
    number: "2",
    name: "ML Foundation + MLOps Studio",
    timeline: "Months 5–9",
    milestone: "ML Forecasts in Production",
    milestoneMonth: "M8",
    color: "bg-gray-800",
    textColor: "text-white",
    items: [
      "Feature Store setup (20+ features)",
      "Statistical models: Prophet, ETS",
      "ML models: LightGBM, XGBoost",
      "MLflow Model Registry + promotion pipeline",
      "MLOps Studio (Module 1) live",
    ],
    team: "+ 2 ML Engineers + 1 Data Scientist",
  },
  {
    number: "3",
    name: "Scenario Planner + Advanced ML",
    timeline: "Months 7–11",
    milestone: "All 4 Channels Forecasting",
    milestoneMonth: "M11",
    color: "bg-gray-900",
    textColor: "text-white",
    items: [
      "Consumer Intelligence Layer (Trends + Social + AI)",
      "Deep Learning: TFT, N-BEATS",
      "Ensemble Stacking Layer",
      "A/B Testing Framework (Champion/Challenger)",
      "Scenario Planner (Module 2) live",
    ],
    team: "+ 1 Frontend Developer",
  },
  {
    number: "4",
    name: "Executive Dashboard + Full LAM",
    timeline: "Months 10–12",
    milestone: "Full LAM Coverage",
    milestoneMonth: "M12",
    color: "bg-black",
    textColor: "text-white",
    items: [
      "Country rollout: Argentina, Colombia, Chile, Peru",
      "Executive Dashboard (Module 3) live",
      "Top-Down / Bottom-Up reconciliation",
      "Continuous learning pipeline",
      "SAP IBP integration finalized",
    ],
    team: "+ BI Developer",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Execution Roadmap
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            12 Months.
            <br />
            <span className="text-gray-400">5 Phases.</span>
          </h2>
          <div className="max-w-md text-sm text-gray-600 leading-relaxed">
            <p><strong className="text-black">Month 8:</strong> First business value — ML forecasts live for Brazil + Mexico, Data Scientists have full production control.</p>
            <p className="mt-1"><strong className="text-black">Month 12:</strong> All three modules operational across all LAM countries and channels.</p>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="hidden md:flex mb-6 relative">
          <div className="w-full h-2 bg-gray-200 relative">
            {[
              { label: "M2", pos: "0%" },
              { label: "M5", pos: "25%" },
              { label: "M8", pos: "58%" },
              { label: "M11", pos: "75%" },
              { label: "M12", pos: "91.67%" },
            ].map((m) => (
              <div
                key={m.label}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: m.pos }}
              >
                <div className="w-4 h-4 bg-black rounded-full -mt-1" />
                <div className="text-xs font-bold text-black mt-2 -translate-x-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-gray-300">
          {phases.map((phase) => (
            <div key={phase.number} className={`${phase.color} ${phase.textColor} p-6`}>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${phase.textColor === "text-white" ? "text-gray-500" : "text-gray-400"}`}>
                Phase {phase.number}
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight leading-tight mb-1">
                {phase.name}
              </h3>
              <div className={`text-xs font-mono mb-4 ${phase.textColor === "text-white" ? "text-gray-400" : "text-gray-500"}`}>
                {phase.timeline}
              </div>
              <ul className="space-y-2 mb-6">
                {phase.items.map((item, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 ${phase.textColor === "text-white" ? "text-gray-400" : "text-gray-600"}`}>
                    <span className={`mt-0.5 flex-shrink-0 ${phase.textColor === "text-white" ? "text-gray-500" : "text-gray-400"}`}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className={`border-t pt-4 ${phase.textColor === "text-white" ? "border-gray-700" : "border-gray-300"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${phase.textColor === "text-white" ? "text-gray-500" : "text-gray-400"}`}>
                  ★ Milestone
                </div>
                <div className={`text-xs font-black ${phase.textColor === "text-white" ? "text-white" : "text-black"}`}>
                  {phase.milestone}
                </div>
                <div className={`text-xs mt-2 ${phase.textColor === "text-white" ? "text-gray-600" : "text-gray-400"}`}>
                  Team: {phase.team}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key risks */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
          {[
            { risk: "SAP Connector Complexity", mitigation: "Fivetran pre-built connector. SAP Basis engaged Week 1.", prob: "High" },
            { risk: "Demand Planner Adoption", mitigation: "4-week shadow mode. Scenario Planner designed for non-ML users.", prob: "Medium" },
            { risk: "Consumer API Rate Limits", mitigation: "Multi-provider strategy. Freshness monitoring. Graceful feature degradation.", prob: "Medium" },
          ].map((r) => (
            <div key={r.risk} className="bg-white p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="text-sm font-black uppercase tracking-tight">{r.risk}</div>
                <span className={`text-xs font-bold px-2 py-0.5 flex-shrink-0 ${r.prob === "High" ? "bg-black text-white" : "bg-gray-200 text-black"}`}>
                  {r.prob}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
