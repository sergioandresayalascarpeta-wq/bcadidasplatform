const AdidasLogo = () => (
  <div className="flex items-center gap-3">
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="7" height="22" rx="1" fill="white" />
      <rect x="10.5" y="0" width="7" height="28" rx="1" fill="white" />
      <rect x="21" y="6" width="7" height="22" rx="1" fill="white" />
    </svg>
    <span className="text-xl font-black tracking-tighter lowercase text-white" style={{ letterSpacing: "-0.04em" }}>
      adidas
    </span>
  </div>
);

const techStack = [
  "Databricks Lakehouse", "AWS (sa-east-1)", "Delta Lake", "Delta Live Tables",
  "MLflow", "Unity Catalog", "Feature Store", "AWS MSK (Kafka)",
  "AWS Kinesis", "AWS S3", "Fivetran", "LightGBM", "TFT / N-BEATS",
  "Prophet / ETS", "Terraform", "GitHub Actions",
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Left */}
          <div className="md:col-span-1">
            <AdidasLogo />
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Candidate Submission
              </div>
              <div className="text-sm font-black uppercase tracking-tight text-white">
                Director of Data Engineering
              </div>
              <div className="text-sm text-gray-400 mt-1">adidas Latin America</div>
            </div>
            <div className="mt-6 flex gap-1">
              <div className="w-1 h-8 bg-white" />
              <div className="w-1 h-8 bg-white" />
              <div className="w-1 h-8 bg-white" />
            </div>
          </div>

          {/* Middle */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Platform Summary
            </div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Databricks Lakehouse on AWS (sa-east-1)</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Medallion Architecture: Bronze / Silver / Gold</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Three-Module UX: MLOps Studio, Scenario Planner, Executive Dashboard</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Consumer Intelligence Layer: Google Trends, Social Listening, AI Chatbots</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Hybrid ML: Statistical + LightGBM + TFT + Ensemble</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>Full LAM coverage: 6+ countries, 4 channels in 12 months</span></li>
              <li className="flex items-start gap-2"><span className="text-white">—</span><span>KPIs: Opportunity Cost, Market Reaction Speed, Forecast-to-Plan Gap</span></li>
            </ul>
          </div>

          {/* Right */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Technology Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-bold border border-gray-700 px-2 py-1 text-gray-400 hover:border-white hover:text-white transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-gray-600">
            Confidential — Director of Data Engineering Technical Use Case Submission · March 2026
          </div>
          <div className="text-xs text-gray-700">
            adidas LAM Demand Forecasting Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
