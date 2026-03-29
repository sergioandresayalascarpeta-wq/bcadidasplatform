const tiers = [
  {
    tier: "01",
    name: "Statistical",
    models: "Prophet, ETS",
    bestFor: "Wholesale · Franchise",
    why: "Seasonal patterns, interpretable baselines, works well with limited data. Franchise forecasting relies heavily on these given sparse sell-out history.",
    compute: "CPU · Fast training",
    features: ["Strong seasonality capture", "Interpretable for planners", "Graceful degradation in low-data scenarios", "Category-level priors for cold start"],
  },
  {
    tier: "02",
    name: "Machine Learning",
    models: "LightGBM, XGBoost",
    bestFor: "Retail · Cross-channel",
    why: "Excels with rich feature sets — promotions, price elasticity, foot traffic, consumer signals. Best performer when feature engineering is thorough.",
    compute: "CPU · Moderate training",
    features: ["Handles 20+ feature interactions", "Promotional uplift modeling", "Consumer signal integration", "Channel cannibalization features"],
  },
  {
    tier: "03",
    name: "Deep Learning",
    models: "TFT, N-BEATS",
    bestFor: "eCommerce · High-volume",
    why: "Temporal Fusion Transformer excels with long historical sequences and multiple covariates. Best for eCommerce where clickstream creates rich temporal context.",
    compute: "GPU · Longer training",
    features: ["Complex temporal patterns", "Attention mechanisms for event capture", "Multi-horizon probabilistic forecasting", "Optimal for eComm scale"],
  },
];

export default function ModelStrategy() {
  return (
    <section className="bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Forecasting Model Strategy
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Three Tiers.
            <br />
            <span className="text-gray-500">One Ensemble.</span>
          </h2>
          <p className="text-gray-400 max-w-md text-sm leading-relaxed">
            No single model dominates all channels. eCommerce benefits from deep learning; Wholesale from statistical methods; Retail from ML. A weighted ensemble stacks all three outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800 mb-8">
          {tiers.map((t) => (
            <div key={t.tier} className="bg-gray-900 p-8">
              <div className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-4">
                Tier {t.tier}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">{t.name}</h3>
              <div className="text-sm text-gray-400 font-mono mb-2">{t.models}</div>
              <div className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-wide inline-block mb-4">
                {t.bestFor}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{t.why}</p>
              <div className="border-t border-gray-800 pt-4 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Key capabilities
                </div>
                <ul className="space-y-2">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-white mt-0.5">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-gray-600 font-mono border border-gray-800 px-3 py-1 inline-block">
                {t.compute}
              </div>
            </div>
          ))}
        </div>

        {/* Ensemble */}
        <div className="bg-white text-black p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Ensemble Layer
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">
                Weighted Stacking — The Final Output
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Ensemble weights are optimized per channel × country combination. A/B testing in the MLOps Studio challenger lab validates new weighting schemes before promotion. The top-3 ensemble candidates are exposed to the Scenario Planner.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Champion/Challenger A/B", "Per channel-country weights", "Weekly reoptimization", "NPI cold-start with category priors"].map((tag) => (
                  <span key={tag} className="text-xs font-bold uppercase border border-gray-300 px-3 py-1 tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-black text-white p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Consumer Intelligence as Features
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Across all three tiers, consumer signal indices are available as features in the Feature Store:
              </p>
              <ul className="space-y-2">
                {[
                  "consumer_signal_index — composite weekly score",
                  "search_trend_score — Google Trends normalized",
                  "social_sentiment_score — brand/category sentiment",
                  "ai_query_trend — emerging interest patterns",
                ].map((f) => (
                  <li key={f} className="text-xs text-yellow-400 font-mono flex items-start gap-2">
                    <span>✦</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
