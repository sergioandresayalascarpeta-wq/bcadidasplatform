const businessKPIs = [
  {
    kpi: "Inventory Opportunity Cost Reduction",
    baseline: "Baseline TBD",
    target: "10–15% reduction",
    how: "Stockout + overstock cost combined",
    icon: "💰",
  },
  {
    kpi: "Market Reaction Speed",
    baseline: "2–4 weeks (manual cycle)",
    target: "< 3 days",
    how: "Signal-to-decision days",
    icon: "⚡",
  },
  {
    kpi: "Forecast-to-Plan Gap",
    baseline: "~35–40% deviation",
    target: "< 15% deviation",
    how: "ML forecast vs financial plan delta",
    icon: "📐",
  },
  {
    kpi: "Revenue at Risk (stockouts)",
    baseline: "Baseline TBD",
    target: "20% reduction",
    how: "Projected out-of-stock revenue exposure",
    icon: "📉",
  },
  {
    kpi: "Analyst Automation Rate",
    baseline: "~5% automated",
    target: "80%+ automated",
    how: "% of forecasting cycle automated vs manual",
    icon: "🤖",
  },
];

const technicalKPIs = [
  { kpi: "Forecast Accuracy (WMAPE)", baseline: "~35–40%", target: "< 20% overall", detail: "eComm ≤18% · Retail ≤20% · Wholesale ≤22% · Franchise ≤24%" },
  { kpi: "SKU Automated Coverage", baseline: "~20% (manual)", target: "95%+", detail: "Automated forecast coverage across all SKUs" },
  { kpi: "Data Latency — Streaming", baseline: "T+2 to T+5", target: "< 10 min to Bronze", detail: "POS and eCommerce real-time ingestion" },
  { kpi: "Pipeline Reliability SLA", baseline: "Unknown", target: "99.5%", detail: "Workflow success rate with MTTD < 15 min" },
  { kpi: "Forecast Bias", baseline: "Unknown", target: "< ±5%", detail: "Systematic over/under-forecast detection" },
  { kpi: "NPI Accuracy (first 8 weeks)", baseline: "N/A", target: "MAPE < 30%", detail: "Cold-start with category priors + consumer signals" },
];

export default function KPIs() {
  return (
    <section id="kpis" className="bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Success Metrics
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Two Layers
            <br />
            of KPIs.
          </h2>
          <p className="text-gray-400 max-w-md text-sm leading-relaxed">
            Business KPIs measure what matters to the organization: revenue, cost, and speed. Technical KPIs measure what Data Scientists need to optimize. They speak to different audiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800">
          {/* Business KPIs */}
          <div className="bg-gray-900 p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              Business KPIs — What the Executive Dashboard tracks
            </div>
            <div className="space-y-px bg-gray-800">
              {businessKPIs.map((k) => (
                <div key={k.kpi} className="bg-gray-900 p-5 hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">{k.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm uppercase tracking-tight mb-2">{k.kpi}</div>
                      <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600 uppercase tracking-wide">From:</span>
                          <span className="text-gray-400 font-mono">{k.baseline}</span>
                        </div>
                        <span className="hidden sm:block text-gray-700">→</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600 uppercase tracking-wide">To:</span>
                          <span className="text-white font-bold">{k.target}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{k.how}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical KPIs */}
          <div className="bg-gray-900 p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              Technical KPIs — What the MLOps Studio tracks
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-gray-500">KPI</th>
                  <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Baseline</th>
                  <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Target</th>
                </tr>
              </thead>
              <tbody>
                {technicalKPIs.map((k) => (
                  <tr key={k.kpi} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="text-xs font-black uppercase tracking-tight text-white">{k.kpi}</div>
                      <div className="text-xs text-gray-600 mt-1">{k.detail}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs text-gray-500 font-mono">{k.baseline}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-white font-bold">{k.target}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 bg-gray-800 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                WMAPE Targets by Channel
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { ch: "eCommerce", val: "≤ 18%" },
                  { ch: "Retail", val: "≤ 20%" },
                  { ch: "Wholesale", val: "≤ 22%" },
                  { ch: "Franchise", val: "≤ 24%" },
                ].map((ch) => (
                  <div key={ch.ch} className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="text-xs text-gray-400">{ch.ch}</span>
                    <span className="text-xs font-bold text-white">{ch.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mt-px bg-gray-900 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Infrastructure Cost</div>
              <div className="text-3xl font-black mb-1">$22–31K</div>
              <div className="text-gray-500 text-sm">per month at steady state</div>
              <div className="text-xs text-gray-600 mt-2">Databricks + AWS · Excl. team salaries</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Phase 0–1 Cost</div>
              <div className="text-3xl font-black mb-1">~$9–12K</div>
              <div className="text-gray-500 text-sm">per month ramp period</div>
              <div className="text-xs text-gray-600 mt-2">~40% of steady state</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Year 1 Total</div>
              <div className="text-3xl font-black mb-1">~$293–378K</div>
              <div className="text-gray-500 text-sm">infrastructure only</div>
              <div className="text-xs text-gray-600 mt-2">Across all 5 phases</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Cost Lever</div>
              <div className="text-3xl font-black mb-1">70%</div>
              <div className="text-gray-500 text-sm">Spot instance savings</div>
              <div className="text-xs text-gray-600 mt-2">ETL + training on Spot · scale-to-zero serving</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
