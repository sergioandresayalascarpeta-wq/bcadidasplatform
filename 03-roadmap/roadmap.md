# Execution Roadmap — adidas LAM Demand Forecasting Platform

## Timeline Overview

```mermaid
gantt
    title adidas LAM Demand Forecasting Platform
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y
    todayMarker off

    section Phase 0 · Foundation
    AWS Infrastructure & Networking         :p0a, 2026-05-04, 4w
    Databricks Workspace Setup (Terraform)  :p0b, after p0a, 2w
    Unity Catalog & Governance Config       :p0c, after p0b, 2w
    CI/CD Pipeline (Asset Bundles + GH Actions) :p0d, 2026-05-04, 6w

    section Phase 1 · Core Data Platform
    Bronze: SAP ERP Ingestion (Fivetran)    :p1a, after p0c, 4w
    Bronze: POS Streaming (MSK)             :p1b, after p0c, 6w
    Bronze: eComm Orders (MSK)              :p1c, after p0c, 5w
    Silver: Unified Product Master          :p1d, after p1a, 4w
    Silver: Standardized Demand Signals     :p1e, after p1b, 4w
    Silver: Promo Calendar Clean            :p1f, after p1a, 2w
    Gold: Base Aggregations & BI Views      :p1g, after p1d, 3w
    Data Quality Framework (DLT Expectations) :p1h, after p1d, 3w
    Milestone: Bronze-to-Gold Pipeline Live :milestone, m1, after p1g, 0d

    section Phase 2 · ML Foundation
    Feature Store Setup                     :p2a, after p1g, 3w
    Statistical Baseline Models (Prophet/ETS) :p2b, after p2a, 4w
    ML Models (LightGBM/XGBoost)            :p2c, after p2b, 4w
    Model Registry & Promotion Pipeline     :p2d, after p2b, 3w
    Forecast Output Gold Tables             :p2e, after p2c, 2w
    BI Dashboard Integration (Tableau)      :p2f, after p2e, 3w
    MLOps Studio Module (Production Monitor + Challenger Lab) :p2h, after p2f, 3w
    SAP IBP Integration (Forecast Export)   :p2g, after p2e, 4w
    Milestone: MLOps Studio Live            :milestone, m2b, after p2h, 0d
    Milestone: ML Forecasts in Production   :milestone, m2, after p2f, 0d

    section Phase 3 · Advanced Capabilities
    Bronze: eComm Clickstream (Kinesis)     :p3a, after p2c, 4w
    Bronze: Wholesale & Franchise Feeds     :p3b, after p2c, 3w
    Silver: External Signals (Weather/Macro) :p3c, after p3a, 3w
    Deep Learning Models (TFT/N-BEATS)      :p3d, after p3c, 6w
    Ensemble Stacking Layer                 :p3e, after p3d, 4w
    A/B Testing Framework (Champion/Challenger) :p3f, after p3e, 3w
    Cross-Channel Cannibalization Features  :p3g, after p3e, 3w
    Bronze: Consumer Intelligence (Trends + Social + AI)  :p3i, after p3c, 4w
    Silver: Consumer Intel Normalized + Feature Engineering :p3j, after p3i, 3w
    Scenario Planner Module (What-If Simulation)          :p3k, after p3j, 4w
    NPI Forecasting Module (Cold Start)     :p3h, after p3e, 4w
    Milestone: Scenario Planner Live        :milestone, m3b, after p3k, 0d
    Milestone: All 4 Channels Forecasting   :milestone, m3, after p3f, 0d

    section Phase 4 · Scale & Optimize
    Country Rollout: Argentina & Colombia   :p4a, after p3e, 6w
    Country Rollout: Chile & Peru           :p4b, after p4a, 4w
    Real-Time Scoring Endpoints (What-If)   :p4c, after p3f, 4w
    Self-Service Forecasting Portal         :p4d, after p4a, 6w
    Continuous Learning Pipeline            :p4e, after p4c, 4w
    Top-Down / Bottom-Up Reconciliation     :p4f, after p4d, 4w
    Executive Dashboard Module (KPI Command Center)       :p4g, after p4d, 4w
    Milestone: Executive Dashboard Live     :milestone, m4b, after p4g, 0d
    Milestone: Full LAM Coverage            :milestone, m4, after p4f, 0d
```

---

## Phase Details

### Phase 0 — Foundation (Weeks 1-8)

**Objective:** Stand up the production-ready infrastructure and governance foundation.

| Workstream | Scope | Owner |
|-----------|-------|-------|
| AWS Infrastructure | VPC (sa-east-1), S3 buckets (4), KMS CMK, NAT Gateways, VPC endpoints, MSK cluster (3 brokers), IAM roles | Cloud/Platform Engineer |
| Databricks Setup | Workspace provisioning via Terraform (dev/staging/prod), cluster policies, instance profiles, PrivateLink configuration | Platform Engineer |
| Unity Catalog | Metastore creation, catalog hierarchy (dev/staging/prod), schema definitions per domain, RBAC roles, audit logging enabled | Data Architect |
| CI/CD | Databricks Asset Bundles for pipeline deployment, GitHub Actions workflows (lint → test → deploy), Terraform CI for infra changes | Platform Engineer |

**Exit Criteria:**
- [ ] Databricks workspace operational in all 3 environments
- [ ] CI/CD deploying notebooks/pipelines to dev on PR merge
- [ ] Unity Catalog metastore with Bronze/Silver/Gold schemas defined
- [ ] MSK cluster accepting test messages
- [ ] S3 buckets with encryption and lifecycle policies active

**Team:** 1 Platform Engineer, 1 Cloud Engineer, 1 Data Architect (part-time)

**Risks & Mitigations:**
| Risk | Impact | Mitigation |
|------|--------|-----------|
| AWS account provisioning delays | 2-3 week slip | Start procurement in parallel with planning; use sandbox account for dev |
| PrivateLink configuration complexity | 1 week slip | Engage Databricks solutions architect for guidance |

---

### Phase 1 — Core Data Platform (Weeks 5-18)

**Objective:** Deliver Bronze-to-Gold pipeline for primary data sources. First value: unified product master and standardized demand signals for Brazil and Mexico.

| Workstream | Scope | Dependencies |
|-----------|-------|-------------|
| Bronze: SAP ERP | Fivetran connector for sales orders, inventory snapshots, material master. CDC-based incremental loads. Partition by `ingestion_date`, `country_code` | Phase 0 complete; SAP access credentials |
| Bronze: POS | Spark Structured Streaming from MSK. 5-minute micro-batch. Dead-letter handling for malformed records. Start with Brazil retail stores | Phase 0 (MSK operational) |
| Bronze: eComm Orders | Spark Structured Streaming from MSK (separate topic). Order lifecycle events (created, paid, shipped, returned) | Phase 0 (MSK operational) |
| Silver: Product Master | Entity resolution across SAP material #, POS item codes, eComm product IDs. EAN/UPC matching → fuzzy match → manual mapping. SCD Type 2 | Bronze SAP + POS operational |
| Silver: Demand Signals | Currency normalization, unit standardization, channel tagging, dedup, late-arrival reconciliation (7-day MERGE window) | Bronze all sources operational |
| Gold: Base Aggregations | Daily/weekly/monthly demand by SKU × channel × country. Z-ordered on `(country_code, channel, category_l1)` for BI performance | Silver tables operational |
| Data Quality | DLT Expectations: null checks (critical fields), referential integrity (product master FK), range validation (units > 0), freshness checks | Silver pipeline operational |

**Exit Criteria:**
- [ ] Daily Bronze → Silver → Gold pipeline running for SAP + POS + eComm orders
- [ ] Unified product master with >95% match rate (Brazil + Mexico)
- [ ] Data quality dashboards operational with pass/fail visibility
- [ ] End-to-end lineage visible in Unity Catalog
- [ ] Bronze data freshness: < 10 min (streaming), < 1 hour (batch)

**Focus Countries:** Brazil, Mexico (highest volume, most data sources available)

**Team:** 2 Data Engineers, 1 Data Architect

**Risks & Mitigations:**
| Risk | Impact | Mitigation |
|------|--------|-----------|
| SAP BAPI connector complexity | 3-4 week slip | Use Fivetran SAP module; engage SAP Basis team early |
| POS data heterogeneity across store systems | 2-week slip | Start with single POS system (Brazil flagship), templatize for others |
| Product master match rate < 95% | Reduced forecast quality | Build manual mapping UI for Product Data team; track match rate as KPI |

---

### Phase 2 — ML Foundation (Weeks 14-28)

**Objective:** Deliver automated ML-driven demand forecasts for Brazil eCommerce and Retail channels. First quantifiable business value: forecast accuracy improvement over spreadsheet baseline.

| Workstream | Scope | Dependencies |
|-----------|-------|-------------|
| Feature Store | Databricks Feature Store tables in Unity Catalog. 20+ features: lags (1-52w), rolling stats, promo indicators, seasonality, price features | Gold aggregations available |
| Statistical Models | Prophet per SKU-channel (high-volume SKUs), ETS for low-volume/intermittent. Weekly retrain. Serve as accuracy baseline | Feature Store operational |
| ML Models | LightGBM with engineered features. Hyperparameter tuning via Hyperopt. Cross-validation: expanding window (not random split — time series!) | Feature Store + baseline established |
| Model Registry | MLflow experiment tracking, model versioning, staging → production promotion workflow. Automated weekly retrain pipeline via Databricks Workflows | Models trained |
| Forecast Outputs | `gold.forecast.outputs_v1`: point forecast + 80% prediction interval by SKU × channel × country × week. 26-week horizon | Models in registry |
| BI Integration | Tableau dashboards: forecast vs. actuals, accuracy by channel/country/category, drill-down to SKU. Connected via Databricks SQL Serverless | Gold forecast tables populated |
| SAP IBP Export | Automated weekly export of forecasts to SAP IBP format (CSV/API). Reconciliation report for supply chain planners | Forecast outputs stable |
| MLOps Studio | Production Monitor view (WMAPE, drift, retraining history) + Challenger Lab (A/B test registration, model promotion/retirement via MLflow Registry). Data Scientists are sole arbiters of model promotion | Forecast Outputs + BI Integration |

**Exit Criteria:**
- [ ] Automated weekly forecasts for Brazil eCommerce + Retail channels
- [ ] MAPE < 20% at SKU-week level (measured on 8-week holdout)
- [ ] WMAPE < 15% at category-week level
- [ ] Dashboards live with forecast accuracy tracking
- [ ] SAP IBP receiving weekly forecast feed

**Team:** 2 ML Engineers, 1 Data Scientist, 1 BI Developer

**Risks & Mitigations:**
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Insufficient historical data for ML (< 2 years) | Model underperformance | Use statistical models (Prophet) as fallback; cold-start heuristics for new SKUs (category-level priors) |
| Feature store compute cost overrun | Budget impact | Materialize features incrementally (not full recompute); partition by forecast_week |
| Demand planner resistance to ML forecasts | Low adoption | Run ML forecasts in shadow mode for 4 weeks alongside spreadsheet; show accuracy comparison |

---

### Phase 3 — Advanced Capabilities (Weeks 24-40)

**Objective:** Extend to all 4 channels, introduce deep learning and ensemble models, add external signals. Deliver cross-channel cannibalization and NPI forecasting.

| Workstream | Scope | Dependencies |
|-----------|-------|-------------|
| Bronze: Clickstream | Kinesis Data Streams for eCommerce clickstream (page views, search queries, add-to-cart). ~200M events/day. Feed conversion funnel features | Phase 0 infra (Kinesis) |
| Bronze: Wholesale + Franchise | SFTP/API ingestion for wholesale order books, sell-through, franchise sell-in. Daily batch | Phase 0 infra |
| External Signals | Weather API (OpenWeatherMap), macroeconomic (central banks, IMF), Google Trends. Daily ingestion to Bronze, weekly aggregation to Silver | Bronze external operational |
| Deep Learning | Temporal Fusion Transformer (TFT) for eCommerce (feature-rich, high-volume). N-BEATS for interpretable channel-level forecasts. GPU training on `g5.xlarge` Spot | Feature Store + external signals |
| Ensemble Layer | Weighted stacking: combine Statistical + ML + DL outputs. Weights optimized per channel-country on holdout set. Automatic weight rebalancing monthly | All model families trained |
| A/B Testing | Champion/challenger framework: deploy new models to 20% of SKU-country combinations, compare WMAPE over 4-week evaluation window. Automated promotion if challenger wins | Ensemble operational |
| Cross-Channel Features | Channel mix share, cross-channel correlation, promo spillover indicators. Enable cannibalization effect modeling | All 4 channels in Silver |
| Consumer Intelligence Ingestion | Bronze: Google Trends API (daily, by category x country), Social Listening API (Brandwatch/Sprinklr), AI chatbot query signals. Silver: weekly grain normalization, sentiment indexing, consumer signal index feature. Adds 2–8 week demand lead time for NPI and trend-break detection | External Signals operational |
| Scenario Planner Module | What-if simulation UI: top-3 model view ranked by Data Scientists, scenario parameters (promo %, competitor event, macro shock, seasonal multiplier), forecast selection → SAP IBP export | Consumer Intelligence + On-Demand API |
| NPI Forecasting | Cold-start module for new products (<12 weeks history). Category-level priors + attribute similarity (color, gender, price point). Transfer learning from analogous products | Feature Store + product attributes |

**Exit Criteria:**
- [ ] All 4 channels (eComm, Retail, Wholesale, Franchise) forecasting for Brazil + Mexico
- [ ] Ensemble outperforms best individual model by ≥2pp WMAPE
- [ ] A/B framework operational with at least one completed experiment
- [ ] NPI forecast accuracy within 30% MAPE for first 8 weeks post-launch
- [ ] External signals contributing measurable accuracy improvement (≥1pp)

**Team:** 3 ML Engineers, 2 Data Engineers, 1 Data Scientist

---

### Phase 4 — Scale & Optimize (Weeks 36-52)

**Objective:** Roll out to all LAM countries, enable self-service for demand planners, implement continuous learning, and deliver top-down/bottom-up forecast reconciliation.

| Workstream | Scope | Dependencies |
|-----------|-------|-------------|
| Country Rollout | Argentina, Colombia (Weeks 36-42), Chile, Peru (Weeks 42-46). Use country onboarding playbook templatized from Phase 1 | Phase 1 templates validated |
| Real-Time Scoring | Databricks Model Serving endpoints for what-if scenarios (e.g., "what happens if we run a 20% promo in Colombia for 2 weeks?") | Ensemble model in registry |
| Self-Service Portal | Streamlit or Databricks Apps. Demand planners can: view/adjust forecasts, run what-if scenarios, override at SKU level, export to Excel/IBP | Forecasts + scoring endpoints |
| Continuous Learning | Online learning pipeline: monitor drift (PSI > 0.2), auto-trigger retraining. Weekly model refresh with latest 52 weeks of data. Alerting on sustained MAPE degradation (>5pp over 4 weeks) | A/B framework operational |
| Top-Down/Bottom-Up Reconciliation | Reconcile SKU-level bottom-up forecasts with top-down financial targets from Finance/Commercial. Proportional adjustment + planner override workflow | Self-service portal operational |
| Executive Dashboard Module | KPI command center: Forecast-to-Plan Gap, Revenue at Risk, Inventory Opportunity Cost, Market Reaction Speed (<3 days target), Analyst Automation Rate. Business language only — no WMAPE. Updated weekly post forecast cycle | Self-service portal + Continuous Learning |

**Exit Criteria:**
- [ ] All 6+ LAM countries live with automated forecasting
- [ ] Self-service portal with 80%+ demand planner adoption
- [ ] Continuous learning pipeline handling at least 2 automated retrains
- [ ] Top-down/bottom-up reconciliation workflow operational
- [ ] Platform operating at <$31K/month

**Team:** Full team + 1 Frontend Developer

---

## Summary Timeline

| Phase | Duration | Key Milestone | Business Value |
|-------|----------|--------------|----------------|
| **Phase 0** | Weeks 1-8 | Infrastructure live | Foundation ready |
| **Phase 1** | Weeks 5-18 | Bronze-to-Gold pipeline | Unified data, data quality visibility |
| **Phase 2** | Weeks 14-28 | ML forecasts in production + **MLOps Studio live** | First accuracy improvement + **Data Scientists module** |
| **Phase 3** | Weeks 24-40 | All 4 channels + **Scenario Planner live** | Ensemble models + **Consumer Intelligence + Business Analyst module** |
| **Phase 4** | Weeks 36-52 | Full LAM + **Executive Dashboard live** | Self-service + **C-Level module + all three modules operational** |

**First value delivery:** Month 7 (Phase 2 milestone — ML forecasts live for Brazil eComm + Retail)

**Full platform maturity:** Month 12 (Phase 4 — all countries, all channels, self-service)

---

## Team Structure (Steady State)

| Role | Count | Phase Needed |
|------|-------|-------------|
| Data Architect | 1 | Phase 0 onwards |
| Platform / Cloud Engineer | 2 | Phase 0-1 (1 continues) |
| Data Engineer | 2-3 | Phase 1 onwards |
| ML Engineer | 2-3 | Phase 2 onwards |
| Data Scientist | 1 | Phase 2 onwards |
| BI Developer | 1 | Phase 2 onwards |
| Frontend Developer | 1 | Phase 4 |
| **Total** | **10-12** | |

---

## Dependencies & External Coordination

| Dependency | Owner | Phase | Risk Level |
|-----------|-------|-------|-----------|
| SAP ERP access + credentials | SAP Basis team | Phase 1 | High — start early |
| POS system API documentation | Retail IT | Phase 1 | Medium |
| eCommerce clickstream Kinesis setup | Digital team | Phase 3 | Medium |
| Wholesale retailer data sharing agreements | Commercial / Legal | Phase 3 | High — legal review |
| Franchise data sharing agreements | Franchise ops / Legal | Phase 3 | High — contractual |
| SAP IBP integration specs | Supply Chain IT | Phase 2 | Medium |
| Tableau / BI license provisioning | IT Procurement | Phase 2 | Low |
| Financial targets for reconciliation | Finance / FP&A | Phase 4 | Medium |
