import ArchitectureDiagramModal from "./ArchitectureDiagramModal";

const layers = [
  {
    name: "Source Systems",
    bg: "bg-gray-100",
    border: "border-gray-300",
    items: [
      { label: "SAP ERP", sub: "Orders · Inventory · Master" },
      { label: "Retail POS", sub: "Transactions · Streaming" },
      { label: "eCommerce", sub: "Clickstream · Kinesis" },
      { label: "Wholesale", sub: "Order Books · Batch" },
      { label: "Franchise", sub: "Sell-In · API" },
      { label: "Promo Calendar", sub: "Campaigns · Weekly" },
      { label: "External Signals", sub: "Weather · Macro" },
      { label: "Consumer Intel ✦", sub: "Google Trends · Social · AI Chatbots", highlight: true },
    ],
  },
  {
    name: "Ingestion Layer",
    bg: "bg-gray-200",
    border: "border-gray-400",
    items: [
      { label: "AWS MSK (Kafka)", sub: "Streaming POS + eComm" },
      { label: "AWS Kinesis", sub: "Clickstream" },
      { label: "S3 + Lambda", sub: "Batch + Event Triggers" },
    ],
  },
];

const medallionLayers = [
  {
    name: "BRONZE",
    color: "bg-amber-950",
    text: "text-amber-100",
    badge: "bg-amber-900",
    desc: "Raw, Append-Only",
    items: ["sap_erp.*", "pos.*", "ecomm.*", "wholesale.*", "franchise.*", "promo.*", "external.*", "consumer_intel.* ✦"],
  },
  {
    name: "SILVER",
    color: "bg-gray-500",
    text: "text-white",
    badge: "bg-gray-600",
    desc: "Cleansed, Conformed",
    items: ["Unified Product Master", "Standardized Demand Signals", "Promo Calendar Clean", "Consumer Intel Normalized ✦"],
  },
  {
    name: "GOLD",
    color: "bg-yellow-500",
    text: "text-black",
    badge: "bg-yellow-600",
    desc: "Business-Ready + ML Features",
    items: ["Feature Store (20+ features)", "Forecast Outputs", "Accuracy Metrics", "Demand Analytics Views"],
  },
];

const userModules = [
  { label: "MLOps Studio", sub: "Data Scientists", icon: "⚗️", bg: "bg-black", text: "text-white" },
  { label: "Scenario Planner", sub: "Business Analysts", icon: "🎯", bg: "bg-black", text: "text-white" },
  { label: "Executive Dashboard", sub: "C-Level & GMs", icon: "📈", bg: "bg-black", text: "text-white" },
];

export default function Architecture() {
  return (
    <section id="architecture" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Platform Architecture
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Databricks
            <br />
            Lakehouse
            <br />
            <span className="text-gray-400">on AWS</span>
          </h2>
          <p className="text-gray-600 max-w-sm text-sm leading-relaxed">
            Medallion Architecture (Bronze / Silver / Gold) on AWS sa-east-1 (São Paulo). Delta Live Tables for transformations. Unity Catalog for governance.
          </p>
        </div>

        {/* Consumer Intel callout */}
        <div className="bg-black text-white p-4 flex items-center gap-4 mb-8 border-l-4 border-yellow-400">
          <span className="text-2xl">✦</span>
          <div>
            <span className="font-black text-sm uppercase tracking-wide">Consumer Intelligence Layer</span>
            <span className="text-gray-400 text-sm ml-3">— Google Trends, Social Listening, AI Chatbot Signals</span>
            <span className="text-yellow-400 text-sm ml-3 font-bold">2–8 week lead time advantage over transactional data</span>
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Source Systems</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-gray-200 mb-2">
            {layers[0].items.map((item, i) => (
              <div
                key={i}
                className={`p-4 text-center ${item.highlight ? "bg-black text-white" : "bg-white"}`}
              >
                <div className={`text-xs font-bold uppercase leading-tight ${item.highlight ? "text-white" : "text-black"}`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-1 leading-tight ${item.highlight ? "text-gray-400" : "text-gray-500"}`}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3 text-gray-400 text-2xl">↓</div>

        {/* Ingestion */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Ingestion Layer (AWS)</div>
          <div className="grid grid-cols-3 gap-px bg-gray-200 mb-2">
            {layers[1].items.map((item, i) => (
              <div key={i} className="bg-gray-100 p-4 text-center">
                <div className="text-xs font-black uppercase text-black">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3 text-gray-400 text-2xl">↓</div>

        {/* Medallion */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Databricks Lakehouse — Medallion Architecture</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 mb-2">
            {medallionLayers.map((layer, i) => (
              <div key={i} className={`${layer.color} p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-lg font-black tracking-tighter ${layer.text}`}>
                    {layer.name}
                  </span>
                  <span className={`${layer.badge} ${layer.text} text-xs px-2 py-1 font-bold`}>
                    {layer.desc}
                  </span>
                </div>
                <ul className="space-y-1">
                  {layer.items.map((item, ii) => (
                    <li key={ii} className={`text-xs ${layer.text} opacity-80 flex items-start gap-1`}>
                      <span className="mt-0.5">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* DLT label */}
        <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
          Delta Live Tables (DLT) — declarative pipeline execution with quality gates
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3 text-gray-400 text-2xl">↓</div>

        {/* ML Platform */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">ML Platform (Databricks)</div>
          <div className="grid grid-cols-5 gap-px bg-gray-200 mb-2">
            {[
              { label: "Feature Store", sub: "Unity Catalog" },
              { label: "Training Orchestration", sub: "Databricks Workflows" },
              { label: "MLflow Registry", sub: "Staging → Production" },
              { label: "Batch Scoring", sub: "→ Gold Tables" },
              { label: "On-Demand Serving", sub: "→ Scenario Planner API" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 text-white p-4 text-center">
                <div className="text-xs font-black uppercase text-white leading-tight">{item.label}</div>
                <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3 text-gray-400 text-2xl">↓</div>

        {/* Three Modules */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Three-Module User Layer
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
            {userModules.map((m, i) => (
              <div key={i} className={`${m.bg} ${m.text} p-6 flex items-center gap-4`}>
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <div className="font-black text-sm uppercase tracking-tight">{m.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Governance spine */}
        <div className="mt-6 border border-gray-200 p-4 flex flex-wrap gap-6 items-center">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Governance Spine:</span>
          {["Unity Catalog", "End-to-End Lineage", "RBAC by Module", "Audit Logs (90d)", "LAM Compliance (LGPD · LFPDPPP · Ley 25.326)"].map((g) => (
            <span key={g} className="text-xs font-bold text-black uppercase tracking-wide">
              {g}
            </span>
          ))}
        </div>

        {/* Architecture diagrams — modal with 3 tabs */}
        <ArchitectureDiagramModal />
      </div>
    </section>
  );
}
