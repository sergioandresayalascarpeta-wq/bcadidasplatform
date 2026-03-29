const sources = [
  { name: "SAP ERP", type: "Batch", protocol: "Fivetran (BAPI/RFC)", frequency: "Daily T+1", volume: "~7M rows/day", highlight: false },
  { name: "Retail POS", type: "Streaming", protocol: "AWS MSK (Kafka)", frequency: "5-min micro-batch", volume: "~50M events/day", highlight: false },
  { name: "eCommerce Orders", type: "Streaming", protocol: "AWS MSK (Kafka)", frequency: "5-min micro-batch", volume: "~2M rows/day", highlight: false },
  { name: "eCommerce Clickstream", type: "Streaming", protocol: "AWS Kinesis", frequency: "5-min micro-batch", volume: "~200M events/day", highlight: false },
  { name: "Wholesale Order Books", type: "Batch", protocol: "SFTP / API", frequency: "Daily", volume: "~500K rows/day", highlight: false },
  { name: "Franchise Sell-In", type: "Batch", protocol: "API", frequency: "Daily", volume: "~1M rows/day", highlight: false },
  { name: "Promo Calendars", type: "Batch", protocol: "Upload / API", frequency: "Weekly", volume: "~10K rows/week", highlight: false },
  { name: "Weather + Macroeconomic", type: "Batch", protocol: "3rd-party APIs", frequency: "Daily", volume: "~75K rows/day", highlight: false },
  { name: "Google Trends ✦", type: "Consumer Intel", protocol: "Google Trends API", frequency: "Daily", volume: "Search intent by keyword × country", highlight: true },
  { name: "Social Listening ✦", type: "Consumer Intel", protocol: "Brandwatch / Sprinklr API", frequency: "Daily", volume: "Brand/category sentiment scores", highlight: true },
  { name: "AI Chatbot Signals ✦", type: "Consumer Intel", protocol: "NLP Query API", frequency: "Daily", volume: "Emerging consumer query patterns", highlight: true },
];

export default function DataSources() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Data Sources
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            11 Sources.
            <br />
            <span className="text-gray-400">3 Are New.</span>
          </h2>
          <div className="max-w-md">
            <div className="bg-black text-white p-4 mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1">
                ✦ Consumer Intelligence Layer — New Addition
              </div>
              <p className="text-sm text-gray-300">
                Google Trends, Social Listening, and AI Chatbot query signals surface demand shifts <strong className="text-white">2–8 weeks before they appear in sales data</strong>. Critical for NPI forecasting and trend-breaking events.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Source</th>
                <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Type</th>
                <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Protocol</th>
                <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Frequency</th>
                <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Volume / Value</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-200 ${
                    s.highlight
                      ? "bg-black text-white"
                      : i % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }`}
                >
                  <td className={`p-4 font-bold text-xs uppercase tracking-wide ${s.highlight ? "text-yellow-400" : ""}`}>
                    {s.name}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 font-bold uppercase tracking-wide ${
                        s.highlight
                          ? "bg-yellow-400 text-black"
                          : s.type === "Streaming"
                          ? "bg-gray-200 text-black"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.type}
                    </span>
                  </td>
                  <td className={`p-4 text-xs ${s.highlight ? "text-gray-400" : "text-gray-600"}`}>{s.protocol}</td>
                  <td className={`p-4 text-xs font-medium ${s.highlight ? "text-gray-300" : ""}`}>{s.frequency}</td>
                  <td className={`p-4 text-xs ${s.highlight ? "text-gray-400" : "text-gray-500"}`}>{s.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
          {[
            { label: "Streaming-first", desc: "POS and eCommerce ingested via Kafka/Kinesis — < 10 min to Bronze. Reactive planning eliminated.", icon: "⚡" },
            { label: "Batch where sufficient", desc: "SAP ERP, Wholesale, Franchise use daily batch — 70% cheaper and equally effective for weekly forecasting cycles.", icon: "📦" },
            { label: "Consumer signals as leading indicators", desc: "Search trends, social sentiment, and AI chatbot queries are integrated as features in the Feature Store — not just context.", icon: "✦" },
          ].map((card) => (
            <div key={card.label} className="bg-white p-6">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="font-black text-sm uppercase tracking-tight mb-2">{card.label}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
