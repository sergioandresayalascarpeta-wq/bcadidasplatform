---
marp: true
theme: default
paginate: true
header: 'adidas LAM | Demand Forecasting Platform'
footer: 'Confidential — March 2026'
style: |
  section {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  h1 {
    color: #000000;
  }
  h2 {
    color: #333333;
  }
  table {
    font-size: 0.75em;
  }
---

<!-- _header: '' -->
<!-- _footer: '' -->
<!-- _paginate: false -->

# Demand Forecasting Data Platform

## adidas Latin America

From reactive planning to proactive demand intelligence — across all channels, all markets

**March 2026**

---

# Agenda

1. The Challenge
2. The Vision — Three-Module Platform
3. Platform Architecture
4. Data Sources — Including Consumer Intelligence
5. Forecasting Model Strategy
6. Data Governance & Compliance
7. Compute & Cost
8. Execution Roadmap
9. Success Metrics
10. Team & Risks

---

# The Challenge

### Current State — The Real Business Cost

| Pain Point | Business Impact |
|-----------|--------|
| **Spreadsheet forecasting** — manual, analyst-dependent | WMAPE ~35–40% → **lost revenue + excess inventory** |
| **T+2 to T+5 latency** — no streaming, no early signals | **2–4 week reaction lag** when market shifts |
| **Fragmented data silos** — SAP, POS, eComm, Wholesale, Franchise | **No single view of demand** across channels or countries |
| **No ML infrastructure** — no feature store, no model registry | Cannot scale beyond manual trending |
| **Inconsistent product master** — different IDs per system | Cannot aggregate demand cross-channel |

### The Core Problem Is Not Just Accuracy

> The deeper cost is **speed**: by the time we detect a demand shift, plan a response, and execute — the window of opportunity has already closed.

---

# The Vision — What We Are Building

### A Platform with Three Distinct Experiences

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   MODULE 1          MODULE 2              MODULE 3                  │
│   MLOps Studio      Scenario Planner      Executive Dashboard       │
│                                                                     │
│   Data Scientists   Category Managers     CEO, CFO,                 │
│   ML Engineers      Product Owners        Country Leaders           │
│                     Market Analysts                                 │
│                     Marketing Managers                              │
│                                                                     │
│   — Model monitor   — Top-3 model view    — Forecast-to-Plan Gap    │
│   — Challenger Lab  — What-if simulator   — Revenue at Risk         │
│   — Who decides     — Scenario compare    — Market Reaction Speed   │
│     production?     — Portfolio impact    — Opportunity Cost KPIs   │
│     THEY DO.        They choose the       Live, every week.         │
│                     best forecast.                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Databricks Lakehouse | AWS (sa-east-1) | Medallion Architecture
```

---

# Platform Architecture — Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SOURCE SYSTEMS                               │
│  SAP ERP │ Retail POS │ eCommerce │ Wholesale │ Franchise │ External │
│                     + CONSUMER INTELLIGENCE                          │
│       Google Trends │ Social Listening │ AI Chatbot Query Signals    │
└────┬─────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
     │         │          │          │          │          │
     ▼         ▼          ▼          ▼          ▼          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     INGESTION LAYER                                  │
│         AWS MSK (Kafka)  │  AWS Kinesis  │  S3 + Lambda             │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
     ┌─────────────────────┼───────────────────────┐
     ▼                     ▼                       ▼
┌──────────┐      ┌──────────────┐      ┌────────────────────┐
│  BRONZE  │      │    SILVER    │      │        GOLD        │
│  Raw     │─DLT─▶│  Cleansed    │─DLT─▶│ Feature Store      │
│  Append  │      │  Conformed   │      │ Forecast Outputs   │
│  Only    │      │  Deduplicated│      │ Accuracy Metrics   │
└──────────┘      └──────────────┘      └────────┬───────────┘
                                                 │
              ┌──────────────────────────────────┤
              ▼                                  │
    ┌────────────────────┐                       │
    │    ML PLATFORM     │                       │
    │  Feature Store     │                       ▼
    │  MLflow Registry   │    ┌───────────────────────────────┐
    │  Model Serving     │───▶│  THREE-MODULE USER LAYER      │
    └────────────────────┘    │  MLOps Studio │ Scenario Planner│
                              │  Executive Dashboard          │
═══════════════════════════════│═══════════════════════════════│═══
      UNITY CATALOG: Lineage │ RBAC │ Audit │ Compliance
```

---

# Data Sources — The Consumer Intelligence Layer

| Source | Protocol | Frequency | Value |
|--------|----------|-----------|-------|
| SAP ERP (Orders, Inventory, Materials) | Fivetran (BAPI/RFC) | Daily | Transactional baseline |
| Retail POS Transactions | AWS MSK (Kafka) | 5-min streaming | Real-time demand |
| eCommerce Orders + Clickstream | MSK + Kinesis | 5-min streaming | Digital demand signals |
| Wholesale Order Books | SFTP / API | Daily | B2B visibility |
| Franchise Sell-In | API | Daily | Indirect demand proxy |
| Promo Calendars | Upload / API | Weekly | Uplift modeling |
| Weather + Macroeconomic | APIs | Daily | External context |
| **🆕 Google Trends** | **API** | **Daily** | **Search demand intent (2–8w lead)** |
| **🆕 Social Listening** | **API** | **Daily** | **Brand/category sentiment shifts** |
| **🆕 AI Chatbot Queries** | **API / NLP** | **Daily** | **Emerging consumer interest patterns** |

**Why Consumer Intelligence matters:** These signals surface demand shifts **2–8 weeks before they appear in sales data** — enabling proactive rather than reactive decisions, especially for NPI forecasting and trend-breaking events.

---

# Medallion Architecture

### Bronze (Raw)
- Append-only, schema-on-read
- Ingestion metadata: `_ingestion_timestamp`, `_source_file`, `_batch_id`
- 8 source domains including `bronze.consumer_intel.*` (search trends, sentiment, chatbot signals)
- **No transformations** — source of truth for replay

### Silver (Cleansed)
- **Unified Product Master** — SKU harmonization across all systems (EAN match → fuzzy match → manual mapping) → >95% automated match
- **Standardized Demand Signals** — unified units, currency normalization, channel tagging, deduplication
- **Consumer Intelligence (Normalized)** — weekly grain, country × category alignment, sentiment indexing

### Gold (Business-Ready)
- **Feature Store** — 20+ ML features including `consumer_signal_index`, `social_sentiment_score`, `search_trend_score`
- **Forecast Outputs** — point forecast + prediction intervals + **top-3 model candidates** per SKU × channel × country × week
- **Analytics Views** — **Forecast-to-Plan Gap** tracking, Z-ordered for Tableau / SAP IBP

---

# Module 1 — MLOps Studio (Data Scientists)

### Who: Data Scientists & ML Engineers
### What: Real-time experimentation + production governance

```
┌─────────────────────────────┐   ┌─────────────────────────────────┐
│   PRODUCTION MONITOR        │   │   CHALLENGER LAB                │
│                             │   │                                 │
│ • Live WMAPE by channel     │   │ • Register new model experiment  │
│ • PSI feature drift alerts  │   │ • Set A/B test parameters        │
│ • Accuracy degradation flags│   │ • Run time-boxed challenger      │
│ • Retraining trigger history│   │ • Compare vs. champion metrics  │
│ • Consumer signal freshness │   │ • ✅ Promote to production       │
│                             │   │ • ❌ Retire underperformer       │
└─────────────────────────────┘   └─────────────────────────────────┘
```

**Key design principle:** Data Scientists are the **sole arbiters** of which models enter and exit production. No model changes happen without their explicit promotion action through MLflow Model Registry. The platform removes bureaucracy — it gives them the tools to move fast and the governance to stay accountable.

**Exposed to Scenario Planner:** The top-3 performing production models (ranked by WMAPE on most recent evaluation period) per SKU × channel × country.

---

# Module 2 — Scenario Planner (Data Analysts & Business)

### Who: Category Managers, Product Owners, Marketing Managers, Analysts
### What: Business simulation without ML expertise required

**Step 1 — Pick your context:** Select SKU, channel, country, time horizon

**Step 2 — See the top-3 models** (as ranked by Data Scientists in MLOps Studio)
```
  Model A (Champion)  WMAPE: 14.2%  ████████████████░░░░  High confidence
  Model B (Challenger) WMAPE: 16.8%  █████████████░░░░░░░  Med confidence
  Model C (Statistical) WMAPE: 19.1% ████████████░░░░░░░░  Stable baseline
```

**Step 3 — Run what-if scenarios:**
- Promotional discount: +20% → How does demand shift?
- Competitor event: FIFA World Cup, Black Friday → Demand spike?
- Macro shock: Currency devaluation, recession signal → Demand drop?
- Supply constraint: Limited availability → Shift to alternatives?

**Step 4 — Select your forecast** for inventory planning → exported to SAP IBP

**Value:** Category Managers retain decision authority. The platform gives them model support, not a black box. Adoption friction is low because the tool enhances judgment rather than replacing it.

---

# Module 3 — Executive Dashboard (C-Level & Country Leaders)

### Who: CEO, CFO, Country GMs, Commercial Leaders
### What: Business KPI command center — updated weekly post forecast cycle

| KPI | What It Measures | Why It Matters |
|-----|-----------------|----------------|
| **Forecast-to-Plan Gap** | Delta between ML forecast and financial plan | Signals misalignment between data and commercial targets |
| **Revenue at Risk** | Projected stockout exposure by country/channel | Quantifies the cost of under-forecasting |
| **Inventory Opportunity Cost** | Overstock exposure from over-forecasting | Quantifies margin erosion from excess inventory |
| **Market Reaction Speed** | Days from demand signal detection to operational response | Measures the platform's strategic value: speed |
| **Analyst Automation Rate** | % of forecasting cycle now automated vs manual | Tracks operational efficiency gain |

### Design Principle
KPIs are expressed in **business terms** (revenue, cost, days) — not statistical metrics (WMAPE). WMAPE is a supporting technical indicator visible to Data Scientists and Analysts, not the headline number for executives.

---

# Forecasting Model Strategy

### Three-Tier Approach + Ensemble

| Tier | Models | Best For | Compute |
|------|--------|----------|---------|
| **Statistical** | Prophet, ETS | Wholesale (seasonal, interpretable), Franchise (limited data) | CPU, fast |
| **Machine Learning** | LightGBM, XGBoost | Retail (promo-driven), feature-rich demand | CPU, moderate |
| **Deep Learning** | TFT, N-BEATS | eCommerce (high-volume, complex temporal) | GPU, longer |

### Ensemble Layer
Weighted stacking combines all three tiers. Weights optimized per channel × country. A/B testing (champion/challenger) in MLOps Studio validates improvements before promotion.

### Consumer Signals as Leading Features
`consumer_signal_index` (search + social + chatbot) is included in all feature sets. For NPI forecasting specifically, these signals are the **primary driver** when transactional history is absent — enabling category-level priors to initialize cold-start forecasts.

---

# Data Governance & Compliance

### Unity Catalog — RBAC by Module

| Role | Module | Access |
|------|--------|--------|
| Data Engineers | — | Bronze/Silver R/W; Gold Read |
| **Data Scientists** | **MLOps Studio** | **Gold/ML R/W; model promote/retire rights** |
| **Category Mgrs / Analysts** | **Scenario Planner** | **Gold forecast top-3 view; what-if API** |
| **Country Leaders / C-Level** | **Executive Dashboard** | **Gold analytics; KPI views only** |
| Franchise Partners | Restricted | Filtered views — country/account scope only |

### LAM Regulatory Compliance

| Regulation | Key Implementation |
|-----------|-------------------|
| **Brazil — LGPD** | Column-level PII masking (dynamic views), data residency sa-east-1, consent tracking in Bronze |
| **Mexico — LFPDPPP** | Consent metadata propagation, deletion via Delta MERGE on data subject requests |
| **Argentina — Ley 25.326** | Delta tombstoning for deletion, cross-border transfer controls |
| **All markets** | KMS encryption at rest, TLS in transit, 90-day Unity Catalog audit logs |

---

# Compute Strategy & Cost

| Workload | Compute | Instance | Cost Lever |
|----------|---------|----------|-----------|
| ETL Pipelines (DLT) | Jobs + DLT | `i3.2xlarge` (4–16 workers) | 70% Spot |
| ML Training (Stat/ML) | Jobs, ML Runtime | `m5.4xlarge` (4–8 workers) | Spot, off-peak |
| ML Training (DL / GPU) | Jobs, GPU Runtime | `g5.xlarge` (2–4 workers) | Spot, high-impact SKUs only |
| Scenario Planner API | Model Serving Serverless | Managed | Scale-to-zero |
| Executive Dashboard | SQL Serverless Warehouse | Managed | Pay-per-query |

### Estimated Monthly Cost (Steady State)

| Component | Cost (USD/mo) |
|-----------|-----------|
| Databricks compute (all workloads) | $18,000 – $25,000 |
| AWS infrastructure (S3, MSK, Kinesis, Lambda) | $4,000 – $6,000 |
| **Total** | **$22,000 – $31,000** |

Phase 0–1: ~40% of steady state (~$9K–$12K/month)

---

# Execution Roadmap

```
 Month:  1    2    3    4    5    6    7    8    9   10   11   12
         ├────┴────┤
         Phase 0: Foundation
         AWS, Databricks, Unity Catalog, CI/CD

              ├─────────┴─────────┴────┤
              Phase 1: Core Data Platform
              Bronze/Silver/Gold, Unified Product Master
              Focus: Brazil + Mexico
                                       ★ Pipeline Live

                        ├─────────┴─────────┴────┤
                        Phase 2: ML Foundation + MLOps Studio
                        Feature Store, Prophet, LightGBM
                        MLflow Registry, MLOps Studio live
                                                  ★ ML Forecasts + DS Module Live

                                  ├─────────┴─────────┴────┤
                                  Phase 3: Scenario Planner + Advanced ML
                                  All channels, Consumer Intelligence signals
                                  DL (TFT), Ensemble, A/B Testing, NPI
                                                           ★ Scenario Planner Live

                                            ├─────────┴─────────┴────┤
                                            Phase 4: Executive Dashboard + Full LAM
                                            All countries, Top-Down reconciliation
                                            Continuous learning, Executive KPIs
                                                                     ★ Full LAM
```

**First business value:** Month 7 — ML forecasts live, Data Scientists have production control
**Full platform maturity:** Month 12 — All three modules, all countries, all channels

---

# Success Metrics

### Business KPIs (What C-Level Tracks)

| KPI | Baseline | 12-Month Target |
|-----|----------|----------------|
| **Inventory Opportunity Cost Reduction** | Baseline TBD | **10–15% reduction** (stockout + overstock) |
| **Market Reaction Speed** | 2–4 weeks (manual cycle) | **< 3 days** (signal-to-decision) |
| **Forecast-to-Plan Gap** | ~35–40% deviation | **< 15% deviation** |
| **Revenue at Risk (stockout exposure)** | Baseline TBD | **20% reduction** |
| **Analyst Automation Rate** | ~5% automated | **80%+ automated** |

### Technical KPIs (What Data Scientists Track)

| KPI | Baseline | 12-Month Target |
|-----|----------|----------------|
| Forecast accuracy (WMAPE) | ~35–40% | **< 20%** |
| SKU automated coverage | ~20% | **95%+** |
| Data latency | T+2 to T+5 | **< 10 min (streaming)** |
| Pipeline reliability | — | **99.5% SLA** |

---

# Team Structure

| Role | Count | Phase |
|------|-------|-------|
| Data Architect | 1 | 0 onwards |
| Platform / Cloud Engineer | 2 | 0–1 (then 1) |
| Data Engineer | 2–3 | 1 onwards |
| ML Engineer | 2–3 | 2 onwards |
| Data Scientist | 1 | 2 onwards |
| BI Developer | 1 | 2 onwards |
| Frontend Developer | 1 | 3–4 (Scenario Planner + Executive Dashboard) |
| **Total** | **10–12** | |

### Stakeholder Cadence

| Cadence | Audience | Format |
|---------|----------|--------|
| Weekly | Engineering | Stand-up + sprint review |
| Bi-weekly | Product + Commercial | Demo + accuracy vs. spreadsheet comparison |
| Monthly | C-Level | Executive Dashboard review + KPI tracking |
| Quarterly | LAM Leadership | Business impact ROI review + roadmap update |

---

# Risks & Mitigations

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|-----------|
| 1 | SAP connector complexity | Phase 1 delay (3–4w) | High | Fivetran pre-built connector; engage SAP Basis team Week 1 |
| 2 | Data quality gaps across countries | Reduced model accuracy | High | Start Brazil/Mexico (best data); DLT quality gates in Phase 1 |
| 3 | Demand planner adoption resistance | Low business impact | Medium | **Shadow mode (4 weeks parallel run)**; Scenario Planner designed for non-ML users |
| 4 | Compute cost overrun | Budget impact | Medium | 70% Spot instances; auto-scaling policies; scale-to-zero serving |
| 5 | Consumer intelligence API rate limits / gaps | Feature gaps | Medium | Multi-provider strategy; freshness monitoring in MLOps Studio; graceful degradation |
| 6 | ML model underperformance in low-data countries | Low ROI Phase 3–4 | Medium | Statistical baselines as fallback; category priors for cold start; country onboarding playbook |

---

<!-- _header: '' -->
<!-- _paginate: false -->

# Q&A

---

<!-- _header: 'BACKUP SLIDES' -->

# Backup: Why Databricks over Snowflake?

| Criterion | Databricks | Snowflake |
|-----------|-----------|-----------|
| ML/AI native | MLflow, Feature Store, Model Serving built-in | Limited — requires external tools (SageMaker, etc.) |
| Streaming | Spark Structured Streaming native | Snowpipe (batch micro-batch only) |
| Unified compute | ETL + ML + BI on one platform | Strong BI/SQL, weak ML |
| Open format | Delta Lake (open source, Parquet-based) | Proprietary format |
| GPU support | Native GPU clusters for DL training | Not available |
| Governance | Unity Catalog (comprehensive) | Horizon (newer, catching up) |

**For a demand forecasting platform with ML at the core, Databricks is the stronger fit.**

---

# Backup: Why Not SageMaker for ML?

- SageMaker adds a **second compute plane** alongside Databricks — increasing operational complexity and cost
- MLflow on Databricks provides **tighter integration** with the data platform (Feature Store → Training → Serving → MLOps Studio all in one)
- Batch scoring (primary serving pattern) is **natively supported** by Databricks Workflows — no SageMaker endpoints needed
- Our Scenario Planner API uses **Databricks Model Serving** — already in the same platform, no cross-service authentication complexity

---

# Backup: Cost Breakdown by Phase

| Phase | Duration | Monthly Cost | Total Cost |
|-------|----------|-------------|-----------|
| Phase 0 (Foundation) | 2 months | $5K – $8K | $10K – $16K |
| Phase 1 (Core Data) | 3.5 months | $9K – $12K | $32K – $42K |
| Phase 2 (ML + MLOps Studio) | 3.5 months | $18K – $24K | $63K – $84K |
| Phase 3 (Scenario Planner + Advanced) | 4 months | $22K – $28K | $88K – $112K |
| Phase 4 (Executive Dashboard + Full LAM) | 4 months | $25K – $31K | $100K – $124K |
| **Total Year 1** | **12 months** | — | **$293K – $378K** |

*Excludes team salaries. Includes Databricks + AWS infrastructure only.*

---

# Backup: Technology Comparison Matrix

| Capability | Our Choice | Alternative 1 | Alternative 2 |
|-----------|-----------|---------------|---------------|
| Data Platform | Databricks Lakehouse | Snowflake + dbt | BigQuery + Vertex AI |
| Storage | Delta Lake on S3 | Iceberg on S3 | BigQuery native |
| Orchestration | DLT + Workflows | Airflow (MWAA) | Cloud Composer |
| ML Framework | MLflow | SageMaker | Vertex AI |
| Feature Store | Databricks FS | Feast | Vertex Feature Store |
| Streaming | Structured Streaming | Flink (MSK) | Dataflow |
| Governance | Unity Catalog | Ranger + Atlas | Dataplex |
| Consumer Intelligence | Google Trends API + Social APIs | Third-party aggregators | Custom scrapers |

**Our stack minimizes integration surface area** — everything runs on Databricks with AWS as infrastructure.
