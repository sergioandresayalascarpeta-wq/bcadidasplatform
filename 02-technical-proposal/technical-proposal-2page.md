# Technical Proposal — adidas LAM Demand Forecasting Platform
**Director of Data Engineering — Use Case Submission | March 2026**

---

## 1. Architecture Decisions & Rationale

The proposed platform is a **Databricks Lakehouse on AWS (sa-east-1)** using the **Medallion Architecture (Bronze/Silver/Gold)** — the only non-negotiable constraints defined in the brief.

**Bronze** receives raw, append-only data from **8 source categories**: SAP ERP (via Fivetran for complex BAPI interfaces), Retail POS (Spark Structured Streaming over AWS MSK), eCommerce clickstream (Kinesis Data Streams), batch feeds for Wholesale, Franchise, and Promo Calendars — plus two strategic additions: (1) traditional external signals (weather, macro indicators) and (2) a **Consumer Intelligence Layer**: Google Trends, social listening platforms (brand and category-level sentiment), and AI chatbot query patterns. This last source captures latent demand shifts before they materialize in sales, enabling proactive rather than reactive forecasting — a key differentiator for NPI forecasting and trend-breaking events. The append-only pattern guarantees replay capability if any downstream layer fails.

**Silver** performs the hardest transformation: the **Unified Product Master**, harmonizing SKU identifiers across all systems (EAN/UPC exact match → fuzzy match on description + size → manual mapping fallback) targeting >95% automated match rate. Without this, cross-channel demand aggregation is impossible. Additional Silver outputs: standardized demand signals (currency normalization, channel attribution, deduplication), clean promo calendar, and normalized external + consumer intelligence signals.

**Gold** serves **three distinct user modules** (see Section 3): ML feature tables with 20+ engineered features including consumer signal indices; business-ready forecast outputs (SKU × channel × country × week with prediction intervals); and module-specific serving tables optimized for each persona's access pattern.

**Key trade-off decisions:** Delta Live Tables over Airflow (declarative quality gates, no self-managed infrastructure); batch-first scoring over real-time endpoints (demand forecasting is a weekly cycle — batch is 70% cheaper and equally sufficient); Fivetran over custom SAP connectors (reduces Phase 1 delivery risk by 4–6 weeks); hybrid model families (TFT deep learning for eCommerce, Prophet/ETS for Wholesale, ensemble stacking across channels); consumer intelligence signals treated as leading indicators with 2–8 week lead time advantage over transactional signals.

**Cost estimate:** $22K–$31K/month at steady state (Databricks + AWS). Phase 0–1 at ~40% of that.

---

## 2. Data Governance & Quality

**Unity Catalog** governs all assets with domain ownership (Demand Planning → forecast outputs, Commercial → promo/pricing, Supply Chain → IBP export views), Bronze/Silver/Gold cataloging under `lam_dev / lam_stg / lam_prd` catalogs, and end-to-end lineage from source ingestion to downstream BI/IBP exports.

**RBAC** is enforced at row and column level: demand planners see only their country/channel scope; franchise partners see filtered views restricted to their account; PII columns (customer and device IDs) are dynamically masked for LGPD (Brazil), LFPDPPP (Mexico), and Ley 25.326 (Argentina) compliance. All data remains in `sa-east-1` (São Paulo) as primary region.

**Data quality SLAs:** Bronze streaming < 10 min; Silver < 4 hours; Gold forecasts published every Monday by 06:00 UTC-3. **Forecast accuracy targets:** WMAPE < 20% overall at 12 months (channel-level: eComm ≤18%, Retail ≤20%, Wholesale ≤22%, Franchise ≤24%). Drift detection via Population Stability Index (PSI); automated retraining triggers on sustained MAPE degradation > 5pp over 4 weeks.

---

## 3. Strategic Vision — Platform Modules & KPIs

The platform is designed around **three differentiated user experiences**, each with its own module, access model, and value proposition:

**Module 1 — MLOps Studio** *(Data Scientists)*: A real-time experimentation environment split into two views: (a) *Production Monitor* — live performance dashboards for all active forecast models (WMAPE, PSI, drift alerts, prediction vs actuals by channel-country); and (b) *Challenger Lab* — an experiment management workspace where Data Scientists can register new models against production champions, run time-boxed A/B tests, and promote or retire models based on technical performance. Data Scientists are the arbiters of model quality — no model enters or exits production without their explicit promotion action through MLflow Model Registry.

**Module 2 — Scenario Planner** *(Data Analysts, Category Managers, Product Owners, Marketing Managers)*: A business simulation workspace that surfaces the **top-3 performing forecast models** (as ranked and exposed by the MLOps Studio) for any given SKU × channel × country combination. Users can configure market condition parameters (promotional discount %, competitor event, macro shock, seasonal multiplier) and compare how each model's forecast responds. Category Managers use this to select the forecast most aligned with their domain knowledge before committing to inventory decisions. The platform supports what-if analysis without requiring any ML expertise.

**Module 3 — Executive Dashboard** *(CEO, Country Leaders, CFO)*: A strategic command center tracking the **Forecast-to-Plan Gap** — the live delta between forecasted demand and the financial/operational plan — across geographies and channels. Updated post each weekly forecast cycle. KPIs are expressed in business terms (revenue at risk, opportunity cost exposure, inventory efficiency) rather than statistical metrics.

**Business KPIs (primary):**

| KPI | Baseline | 12-Month Target |
|-----|----------|----------------|
| Inventory Opportunity Cost Reduction | Baseline TBD | **10–15% reduction** (stockout + overstock cost) |
| Market Reaction Speed | 2–4 weeks (manual analysis cycle) | **< 3 days** (automated signal-to-decision) |
| Forecast-to-Plan Gap | ~35–40% deviation | **< 15% deviation** |
| Revenue at Risk (out-of-stock events) | Baseline TBD | **20% reduction** |
| Analyst Automation Rate | < 5% of forecast volume automated today | **80%+ automated** (planners focus on exceptions) |

**Technical KPIs (supporting):**

| KPI | Baseline | 12-Month Target |
|-----|----------|----------------|
| Forecast accuracy (WMAPE) | ~35–40% | **< 20%** |
| SKU automated coverage | ~20% | **95%+** |
| Data latency (pipeline) | T+2 to T+5 | **< 10 min (streaming)** |

**Phased roadmap:** Phase 0 (Months 1–2): Infrastructure & governance. Phase 1 (Months 2–5): Bronze-to-Gold pipeline for Brazil + Mexico. Phase 2 (Months 4–7): ML forecasts in production + MLOps Studio — **first business value**. Phase 3 (Months 6–10): All 4 channels + Scenario Planner module + consumer intelligence signals. Phase 4 (Months 9–12): Full LAM coverage + Executive Dashboard + continuous learning.

---

## 4. Stakeholder Management & Change Management

The platform spans four domains with different incentives: **Demand Planning** (accuracy + reduced manual cycles), **Commercial** (promo impact + channel mix visibility), **Supply Chain** (IBP integration, inventory optimization), and **IT/SAP** (access governance). Each domain gets a named data product owner with explicit accountability.

**Communication model:** Weekly engineering standups; bi-weekly demos for demand planners and commercial leads (showing accuracy vs. current spreadsheets); monthly Executive Dashboard review with C-Level; quarterly business impact review with ROI tracking.

**Change management:** A **4-week shadow mode** before platform cutover — ML forecasts run in parallel with existing spreadsheet processes, allowing planners to compare accuracy before committing. The Scenario Planner module is specifically designed to reduce adoption friction: users retain decision-making authority while gaining model support, rather than being replaced by a black-box system. Dedicated onboarding sessions per country during phased rollout.

---

## 5. Execution Practices

**CI/CD:** Databricks Asset Bundles for pipeline deployment; GitHub Actions for lint → unit test → integration test → deploy workflows; Terraform for infrastructure-as-code across dev/staging/prod. No manual deployments to production.

**Testing strategy:** Unit tests for transformation logic; data contract tests (schema + quality expectations via DLT) at pipeline boundaries; end-to-end integration tests with synthetic datasets in staging; model validation tests (MAPE on holdout set) before model registry promotion.

**Observability:** Databricks pipeline monitoring (job success/failure, SLA tracking); MAPE/WMAPE dashboards updated post each forecast cycle; consumer signal freshness monitoring (social listening APIs, Trends quotas); PagerDuty integration for critical failures (MTTD < 15 min, MTTR < 2 hours for Bronze/Silver/Gold pipeline incidents).

**Technical debt management:** Deprecation policy for Bronze schemas older than 3 months without active Silver consumers; quarterly architecture review; documentation as part of definition-of-done for all pipelines.

**Team:** 10–12 people at steady state. Ramp: Platform Engineer + Cloud Engineer + Data Architect (Phase 0), + 2 Data Engineers (Phase 1), + 2 ML Engineers + Data Scientist + BI Developer (Phase 2), + Frontend Developer for Scenario Planner + Executive Dashboard (Phase 3–4).
