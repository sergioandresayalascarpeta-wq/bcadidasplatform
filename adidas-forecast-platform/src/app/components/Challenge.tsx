const painPoints = [
  {
    icon: "📊",
    title: "Spreadsheet Forecasting",
    stat: "~35–40% WMAPE",
    desc: "Manual, analyst-dependent forecasting with no ML infrastructure. Accuracy varies widely across markets and channels.",
    impact: "Lost revenue + excess inventory",
  },
  {
    icon: "⏳",
    title: "T+2 to T+5 Data Latency",
    stat: "2–4 week reaction lag",
    desc: "Batch pipelines with no streaming. By the time a demand shift is detected, the opportunity window has already closed.",
    impact: "Reactive, not proactive decisions",
  },
  {
    icon: "🗂️",
    title: "Fragmented Data Silos",
    stat: "5+ disconnected systems",
    desc: "SAP ERP, Retail POS, eCommerce, Wholesale, and Franchise data live in separate systems with no unified view.",
    impact: "No single source of demand truth",
  },
  {
    icon: "🔤",
    title: "Inconsistent Product Master",
    stat: "4 different ID formats",
    desc: "The same product has different identifiers across SAP, POS, eCommerce, and Wholesale. Cross-channel aggregation is impossible.",
    impact: "Cannot measure true demand",
  },
  {
    icon: "🧱",
    title: "No ML Infrastructure",
    stat: "Zero model coverage",
    desc: "No feature store, no model registry, no automated training or serving. Impossible to scale beyond spreadsheet trending.",
    impact: "Cannot compete at LAM scale",
  },
];

export default function Challenge() {
  return (
    <section id="challenge" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Current State
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            The
            <br />
            Challenge
          </h2>
          <p className="text-gray-600 max-w-md text-base leading-relaxed">
            adidas LAM's demand forecasting capability is constrained by fragmented data, manual processes, and zero ML infrastructure — at a scale that demands something fundamentally different.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
          {painPoints.map((p, i) => (
            <div
              key={i}
              className="bg-white p-8 hover:bg-gray-50 transition-colors group"
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Pain Point {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {p.title}
              </h3>
              <div className="text-sm font-bold text-gray-800 mb-3 bg-gray-100 inline-block px-2 py-1">
                {p.stat}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{p.desc}</p>
              <div className="border-t border-gray-100 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  → {p.impact}
                </span>
              </div>
            </div>
          ))}

          {/* Summary card */}
          <div className="bg-black text-white p-8">
            <div className="text-3xl mb-4">💡</div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Core Insight
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">
              Speed Is the Real Problem
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              The deeper cost isn't just forecast inaccuracy — it's the <strong className="text-white">2–4 week lag</strong> between a market shift and an operational response. Every week of delay is revenue lost and inventory wasted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
