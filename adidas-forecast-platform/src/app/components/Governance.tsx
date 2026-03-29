const countries = [
  {
    flag: "🇧🇷",
    country: "Brazil",
    law: "LGPD",
    items: ["Column-level PII masking via dynamic views", "Data residency enforced: sa-east-1 only", "Consent tracking in Bronze layer", "Right to erasure via Delta tombstoning"],
  },
  {
    flag: "🇲🇽",
    country: "Mexico",
    law: "LFPDPPP",
    items: ["Consent metadata propagation through all layers", "Data subject access request workflow", "Deletion via Delta MERGE on request", "Cross-border transfer restrictions"],
  },
  {
    flag: "🇦🇷",
    country: "Argentina",
    law: "Ley 25.326",
    items: ["Data subject rights: access, correction, deletion", "Cross-border transfer controls for global sync", "Delta tombstoning for deletion compliance", "90-day audit trail in Unity Catalog"],
  },
];

const rbacRoles = [
  { role: "Data Engineers", scope: "Own Bronze + Silver", access: "R/W: bronze_*, silver_* · Read: gold_*", module: "—" },
  { role: "Data Scientists", scope: "MLOps Studio", access: "R/W: gold_*, ml_* · Model promote/retire rights", module: "MLOps Studio" },
  { role: "Category Managers / Analysts", scope: "Scenario Planner", access: "Read: gold_forecast top-3 · What-if API", module: "Scenario Planner" },
  { role: "C-Level / Country Leaders", scope: "Executive Dashboard", access: "Read: gold_analytics · KPI views only", module: "Executive Dashboard" },
  { role: "Franchise Partners", scope: "Restricted", access: "Filtered views · Country/account scope only", module: "—" },
];

export default function Governance() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
            <div className="w-1 h-4 bg-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Data Governance & Compliance
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            Unity Catalog.
            <br />
            <span className="text-gray-400">One Governance</span>
            <br />
            <span className="text-gray-400">Spine.</span>
          </h2>
          <p className="text-gray-600 max-w-md text-sm leading-relaxed">
            Domain ownership, end-to-end lineage, role-based access by module, and regulatory compliance for Brazil, Mexico, and Argentina — all enforced through Unity Catalog.
          </p>
        </div>

        {/* Unity Catalog overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-gray-200 mb-8">
          {[
            { label: "Catalog Hierarchy", desc: "dev / staging / prod catalogs with isolated schemas per environment", icon: "📂" },
            { label: "End-to-End Lineage", desc: "Source → Bronze → Silver → Gold → Module Layer → SAP IBP / BI", icon: "🔗" },
            { label: "RBAC by Module", desc: "Access tied to user type and platform module — not just team or role", icon: "🔐" },
            { label: "Audit Trail", desc: "90-day query and access logs via Unity Catalog system tables", icon: "📋" },
          ].map((item) => (
            <div key={item.label} className="bg-white p-6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="font-black text-sm uppercase tracking-tight mb-2">{item.label}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* RBAC table */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Role-Based Access Control — Aligned to Platform Modules
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Scope</th>
                  <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Data Access</th>
                  <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Module</th>
                </tr>
              </thead>
              <tbody>
                {rbacRoles.map((r, i) => (
                  <tr key={r.role} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-4 font-bold text-xs uppercase tracking-tight">{r.role}</td>
                    <td className="p-4 text-xs text-gray-500">{r.scope}</td>
                    <td className="p-4 text-xs text-gray-600 font-mono">{r.access}</td>
                    <td className="p-4">
                      {r.module !== "—" ? (
                        <span className="text-xs font-bold bg-black text-white px-2 py-1 uppercase tracking-wide">
                          {r.module}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            LAM Regulatory Compliance
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
            {countries.map((c) => (
              <div key={c.country} className="bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <div className="font-black text-sm uppercase tracking-tight">{c.country}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.law}</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {c.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-black mt-0.5 flex-shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="bg-black text-white p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between mt-px">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">All Markets</div>
              <div className="text-sm font-black uppercase tracking-tight">KMS Encryption at Rest · TLS in Transit · CloudTrail Audit</div>
            </div>
            <div className="text-xs text-gray-500">Data residency: sa-east-1 (São Paulo) as primary region for all LAM data</div>
          </div>
        </div>
      </div>
    </section>
  );
}
