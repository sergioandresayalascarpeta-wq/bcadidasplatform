export default function Hero() {
  return (
    <section className="bg-black text-white min-h-screen flex flex-col justify-center pt-16">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Tag */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
            <div className="w-1 h-4 bg-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Director of Data Engineering — Technical Use Case
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
          Demand
          <br />
          Forecasting
          <br />
          <span className="text-gray-400">Platform</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mb-12">
          A unified ML-driven demand intelligence platform for adidas Latin America — built on Databricks Lakehouse, designed for the people who use it.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800 border border-gray-800 mb-12">
          {[
            { value: "12", unit: "months", label: "to full LAM coverage" },
            { value: "6+", unit: "countries", label: "Brazil, Mexico & more" },
            { value: "4", unit: "channels", label: "eComm, Retail, Wholesale, Franchise" },
            { value: "3", unit: "modules", label: "MLOps · Scenario · Executive" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black p-6 md:p-8">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl md:text-5xl font-black">{stat.value}</span>
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">{stat.unit}</span>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/platform"
            className="inline-block bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
          >
            Launch Platform →
          </a>
          <a
            href="#vision"
            className="inline-block border border-gray-600 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:border-white transition-colors"
          >
            Explore Proposal
          </a>
        </div>
      </div>

      {/* Bottom stripe decoration */}
      <div className="h-px bg-gray-800" />
    </section>
  );
}
