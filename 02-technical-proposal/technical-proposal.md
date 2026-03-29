# Demand Forecasting Data Platform — Technical Architecture Proposal

**adidas Latin America | March 2026**

---

## 1. Executive Context

adidas LAM currently operates with fragmented demand signals across four commercial channels (eCommerce, Retail, Wholesale, Franchise) and six+ countries, relying on spreadsheet-based forecasting with T+2 to T+5 data latency. There is no unified product master, no centralized feature store, and no ML infrastructure to support statistical or machine learning forecasting at scale.

This proposal defines a **Databricks Lakehouse platform on AWS** using the **Medallion Architecture** (Bronze/Silver/Gold) that unifies demand data across all channels, enables ML-driven forecasting, and reduces data latency to near real-time — targeting a **10-15% reduction in safety stock** and **forecast accuracy (WMAPE) below 20%** within the first year.

---

## 2. Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| **Data architecture** | Medallion (Bronze → Silver → Gold) | Lambda, Data Vault 2.0 | Progressive quality refinement suits the heterogeneous source landscape. Clear ownership boundaries per layer. Native Databricks pattern with Delta Live Tables support. |
| **Storage format** | Delta Lake on S3 | Apache Iceberg, Apache Hudi | Native Databricks integration, ACID transactions, time travel (audit/compliance), Z-ordering for BI query performance. Deep Unity Catalog integration for governance. |
| **Streaming ingestion** | AWS MSK (Kafka) for POS/orders; Kinesis for clickstream | All-Kafka or All-Kinesis | MSK for structured event streams requiring exactly-once semantics. Kinesis for high-volume clickstream where at-least-once suffices and AWS-native integration reduces operational overhead. |
| **Orchestration** | Delta Live Tables (Silver/Gold) + Databricks Workflows (ML/Scoring) | Apache Airflow (MWAA), Step Functions | DLT provides declarative pipeline definitions with built-in data quality expectations and automatic dependency resolution. Eliminates self-managed Airflow infrastructure. |
| **ML strategy** | Hybrid: Statistical (Prophet/ETS) + ML (LightGBM) + DL (TFT/N-BEATS) + Ensemble | Single model family | Channel-specific demand patterns require different approaches. eCommerce (high-volume, feature-rich) benefits from deep learning. Wholesale (low-volume, seasonal) is better served by statistical methods. An ensemble stacking layer combines outputs, preventing over-reliance on any single model family. |
| **Feature store** | Databricks Feature Store (Unity Catalog) | Feast, Tecton | Native integration with MLflow and Delta. No additional infrastructure. Supports both batch features (primary) and online features (for what-if scenarios). |
| **Model serving** | Batch scoring (primary) + Databricks Model Serving (secondary) | SageMaker endpoints | Demand forecasting is inherently batch (weekly cycles). Batch scoring via Workflows is simpler and 70% cheaper than always-on endpoints. Model Serving reserved for ad-hoc what-if scenario APIs. |
| **Governance** | Unity Catalog with per-domain RBAC | Apache Ranger, custom solution | Unified metastore across all Databricks assets. Fine-grained column-level ACLs. Built-in lineage tracking. Simplifies LGPD/LFPDPPP compliance via dynamic views and audit logging. |

---

## 3. Key Trade-Offs

**Unified vs. channel-specific models:** We start with channel-specific models (Phase 2) to capture distinct demand patterns per channel, then build a unified ensemble layer (Phase 3). This avoids premature complexity while allowing cross-channel cannibalization features to be introduced incrementally.

**Real-time vs. batch processing:** Near real-time ingestion (5-minute micro-batch) for POS and clickstream feeds the Bronze layer, but Silver/Gold refreshes run every 4-6 hours. Demand forecasting does not require sub-second latency; this hybrid approach reduces compute costs by ~60% vs. full streaming.

**Build vs. buy for ingestion:** Fivetran for SAP ERP connectors (buy) vs. custom Spark Structured Streaming for POS/clickstream (build). SAP integration is notoriously complex with BAPI/RFC interfaces; pre-built connectors reduce risk and accelerate Phase 1 delivery by 4-6 weeks.

---

## 4. Compute Strategy

| Workload | Compute Type | Instance Strategy | Cost Lever |
|----------|-------------|-------------------|------------|
| ETL (Bronze → Silver → Gold) | DLT Pipeline + Jobs Compute | `i3.2xlarge`, 4-16 workers, auto-scaling | 70% Spot instances; DLT manages retries on preemption |
| ML Training (Statistical + ML) | Jobs Compute, ML Runtime | `m5.4xlarge`, 4-8 workers | Spot, scheduled off-peak (02:00-06:00 BRT) |
| ML Training (Deep Learning) | Jobs Compute, ML GPU Runtime | `g5.xlarge`, 2-4 workers | Spot, subset of high-impact SKUs only |
| BI / SQL Analytics | SQL Serverless Warehouse | Managed, auto-scaling | Pay-per-query, auto-stop 10 min idle |
| Model Serving (API) | Serverless Model Endpoints | Auto-scaling, scale-to-zero | Pay-per-request |

**Estimated steady-state cost:** $22K-$31K/month (Databricks + AWS infrastructure). Phase 0-1 ~40% of steady state.

---

## 5. Data Quality & Monitoring

- **DLT Expectations** at Silver layer: null checks, referential integrity (product master FK), range validation (units > 0, date within 2-year window), uniqueness constraints
- **Forecast accuracy targets:** MAPE < 20% at SKU-week (Phase 2), < 15% (Phase 3). WMAPE for volume-weighted accuracy across categories
- **Model drift detection:** Population Stability Index (PSI) on feature distributions; MAPE tracking with ±5pp alerting threshold; automated retraining trigger on sustained degradation
- **Data freshness SLAs:** Bronze (streaming) < 10 min, Bronze (batch) < 1 hour, Silver < 4 hours, Gold < 6 hours, Forecasts < Monday 06:00 BRT weekly

---

## 6. LAM Regulatory Compliance

| Regulation | Scope | Implementation |
|------------|-------|----------------|
| **Brazil — LGPD** | PII in clickstream/POS (customer IDs, device IDs) | Column-level masking via Unity Catalog dynamic views; data residency enforced in sa-east-1; consent metadata tracked from Bronze |
| **Mexico — LFPDPPP** | Personal data in eCommerce transactions | Consent propagation through Silver layer; data subject access/deletion request workflow via Delta `MERGE` operations |
| **Argentina — Ley 25.326** | Personal data processing and cross-border transfer | Deletion via Delta tombstoning (GDPR-style); cross-border transfer controls for data shared with global adidas systems |
| **All markets** | Audit and accountability | Unity Catalog system tables (90-day query + access logs); CloudTrail API audit; KMS encryption at rest; TLS 1.2+ in transit |

---

## 7. Success Metrics

| KPI | Baseline (Current) | Target (12 months) | Measurement |
|-----|-------------------|--------------------|----|
| Forecast accuracy (WMAPE) | ~35-40% (spreadsheet) | < 20% | `gold.forecast.accuracy_metrics` |
| Data latency (source to forecast) | T+2 to T+5 | T+0 ingestion, T+1 forecast | Pipeline monitoring |
| Safety stock reduction | — | 10-15% reduction | SAP IBP integration metrics |
| Demand planner adoption | 0% (no platform) | 80%+ active users | Platform usage analytics |
| SKU coverage | ~20% (manual) | 95%+ automated | Forecast output coverage ratio |
| Pipeline reliability | — | 99.5% SLA | Databricks Workflow success rate |

---

## 8. AWS Integration and LAM Deployment Considerations

### 8.1 AWS Service Integration Pattern

| Layer | AWS Service(s) | Integration Detail | Output |
|------|-----------------|--------------------|--------|
| Landing / Raw files | S3 + Lambda | Source drops to S3 landing buckets; Lambda triggers Databricks Workflows / Auto Loader on object creation events | Bronze Delta tables updated |
| Streaming ingestion | MSK (Kafka) / Kinesis | POS/orders on MSK topics (structured business events); high-volume clickstream on Kinesis streams | Near real-time Bronze updates (5-min micro-batch) |
| Curated processing | Databricks on S3 (Delta) | DLT pipelines move Bronze to Silver/Gold with data quality gates | Cleansed and business-ready data products |
| Governance / Security | IAM, KMS, CloudTrail, Unity Catalog | IAM roles for least privilege, KMS encryption keys for S3, CloudTrail audit logs, Unity Catalog RBAC/lineage | Compliance-ready access model |

### 8.2 Cross-Account Strategy (LAM)

- **Domain/account separation:** shared-services account for core lakehouse platform, optional country or source accounts for ingestion producers.
- **Access model:** IAM role assumption from Databricks workspace account into producer accounts, with bucket policies scoped to prefixes by domain/country.
- **Data sharing boundary:** curated Gold outputs can be shared cross-account via controlled read roles; raw PII stays restricted to designated domains.

### 8.3 Cross-Region Strategy (LAM)

- **Primary region:** `sa-east-1` (Sao Paulo) for low latency to Brazil and LGPD-aligned residency.
- **Selective replication:** replicate only required datasets/aggregates to secondary region(s) for DR and regional consumption.
- **Failover posture:** recovery runbooks plus infrastructure-as-code to rehydrate critical pipelines in secondary region; no active-active requirement for Phase 1-2.

---

## 9. Scalability, Fault Tolerance, and Cost Optimization

### 9.1 Scalability Across Markets

- **Parameterized pipelines:** country/channel passed as runtime parameters instead of duplicating code.
- **Partition strategy:** partition by `ingestion_date`, `country_code`, and domain-specific keys to keep storage/compute efficient.
- **Progressive rollout:** Brazil/Mexico first, then template-based expansion to Argentina/Colombia/Chile/Peru.

### 9.2 Fault Tolerance and Reliability

- **Streaming resilience:** checkpointing for all streaming jobs; automatic restart on transient failures.
- **Batch resilience:** idempotent loads + retry policies; dead-letter paths for malformed payloads.
- **Data recovery:** Bronze append-only guarantees replay/reprocessing path when Silver/Gold logic changes or fails.
- **Operational SLO:** 99.5% pipeline reliability target with alerting on SLA misses.

### 9.3 Cost Control Guardrails

| Cost Lever | Design Choice | Expected Effect |
|-----------|----------------|-----------------|
| Cluster policies | Restrict node families/sizes, enforce tags, enforce auto-termination | Prevents uncontrolled spend |
| Auto-scaling | Min/max workers by workload type | Aligns spend to demand variability |
| Spot + on-demand mix | Spot-first for non-critical/retriable ETL and training; on-demand fallback for critical workloads | 30-50% compute savings potential |
| SQL Serverless | BI workloads on pay-per-use SQL warehouses | Avoids always-on analytics clusters |
| Model Serving scale-to-zero | Keep endpoints off when idle for what-if usage | Minimizes serving idle cost |

---

## 10. Workload-Isolated Compute Strategy

The platform separates ETL, ML training, and serving/inference workloads to avoid resource contention and improve SLA compliance.

| Workload | Databricks Compute Type | Why This Choice | Cadence |
|---------|--------------------------|-----------------|---------|
| ETL (Bronze/Silver/Gold) | Jobs Clusters + DLT Pipelines | Ephemeral compute, strong orchestration and quality controls, lower idle cost | Continuous micro-batch + scheduled refresh |
| BI and ad-hoc analytics | SQL Warehouses (Serverless) | Isolates analyst queries from pipeline compute; pay-per-query economics | Business-hour / on-demand |
| ML training (statistical/ML/DL) | Jobs Clusters (ML runtime; GPU where needed) | Dedicated training resources, reproducibility, no interference with ETL | Weekly retrain + challenger experiments |
| Batch inference (primary) | Jobs Clusters scoring workflows | Best fit for weekly forecasting cycle, lower cost than always-on online inference | Weekly (e.g., Monday cycle) |
| Online inference (secondary what-if) | Model Serving Endpoints | Low-latency API for scenario simulation, independent autoscaling | On-demand |

|---

## 11. Unity Catalog Governance Framework (Domain Ownership + Access Model)

### 11.1 Domain Ownership Model

| Domain | Business Owner | Data Product Owner | Main Data Assets | Primary Responsibilities |
|-------|-----------------|--------------------|------------------|--------------------------|
| Demand Planning | Head of Demand Planning | Demand Analytics Lead | Forecast outputs, accuracy metrics, planner overrides | Forecast quality targets, model acceptance criteria, planner-facing semantics |
| Commercial | Commercial Director (per market) | Commercial Analytics Manager | Promotions, pricing, channel performance, demand signals by channel | Promo/pricing data quality, commercial KPI definitions, country/channel policy requests |
| Supply Chain | Supply Chain Director | Supply Planning Analytics Lead | Inventory, replenishment feeds, IBP export datasets | IBP integration requirements, service-level constraints, reconciliation with supply plans |

### 11.2 Catalog / Schema Structure (Bronze-Silver-Gold)

| Layer | Catalog.Schema Pattern | Purpose | Stewardship |
|------|-------------------------|---------|-------------|
| Bronze | `bronze.<domain>` | Raw immutable ingestion, replay/recovery source | Data Engineering + source domain steward |
| Silver | `silver.<domain>` | Cleansed/conformed entities and quality-validated signals | Data Engineering + domain data product owner |
| Gold | `gold.<domain>` | Business-ready data products for analytics and forecasting consumers | Domain owner + analytics lead |

Recommended catalog hierarchy in Unity Catalog:
- `lam_dev`, `lam_stg`, `lam_prd` (environment separation)
- Within each: `bronze`, `silver`, `gold` schemas by domain (`demand`, `commercial`, `supply`)

### 11.3 End-to-End Lineage and Audit

- **Lineage scope:** source ingestion tables -> Silver conformed tables -> Gold outputs -> downstream BI/API/IBP exports.
- **Operational requirement:** every Gold forecast record must trace back to source tables, transformation job version, and model version (`model_version` in outputs).
- **Audit controls:** Unity Catalog system tables + CloudTrail for access and change tracking; minimum 90-day retention for query/access logs.
- **Change traceability:** all pipeline/model changes linked to CI/CD release identifiers.

### 11.4 RBAC Model (Role-Based Access Control)

| Role | Typical Users | Bronze | Silver | Gold | Notes |
|------|---------------|--------|--------|------|------|
| `role_data_engineer` | Data engineering team | RW | RW | RW | Full pipeline operations |
| `role_ml_engineer` | ML engineers / data scientists | R | R | RW (forecast + metrics) | No direct write to source Bronze ingestion tables |
| `role_demand_planner` | Demand planners | - | R (selected views) | R | Country/channel scoped |
| `role_commercial_lead` | Commercial leaders | - | R (commercial views) | R | Country/channel scoped |
| `role_supply_manager` | Supply chain managers | - | R (supply views) | R | Access to IBP export views |
| `role_franchise_partner` | External franchise stakeholders | - | - | R (restricted shared views) | Strict row/column filters |

---

## 12. Forecast Data Consumption Model (Who, How, and Granularity)

### 12.1 Who Can Read Gold Forecast Data

| Consumer Group | Gold Data Access | Primary Use |
|---------------|------------------|-------------|
| Demand planners | `gold.forecast.outputs_v1`, `gold.forecast.accuracy_metrics` | Weekly planning, exception handling, forecast adjustments |
| Commercial leads | Aggregated forecast + promo impact views | Campaign and pricing decisions |
| Supply chain managers | Forecast outputs + IBP export views | Replenishment and supply balancing |
| Franchise partners | Restricted forecast slices | Local demand visibility within assigned scope |

### 12.2 Access Interfaces

| Interface | Consumer Type | Typical Access Pattern |
|----------|----------------|------------------------|
| SQL Warehouses | Analysts, planners, commercial/supply leads | Governed SQL queries over Gold views/tables |
| BI Tools (Tableau/Power BI) | Business users | Dashboards with pre-modeled semantic layers |
| API Endpoints (Model Serving / what-if) | Planning applications | Programmatic scenario simulation |
| SAP IBP Exports | Supply planning systems | Scheduled batch export (weekly cycle) |

### 12.3 Granularity Controls and Sensitive Data Protections

- **Country-level restrictions:** row filters by `country_code` (e.g., managers see only assigned country portfolio).
- **Channel-level permissions:** row filters by `channel` (e.g., wholesale lead cannot access franchise-only views unless granted).
- **Franchise isolation:** franchise users restricted to their own account/store scope via secure views.
- **Sensitive data masking:** dynamic masking for PII-related fields and controlled exposure of commercially sensitive attributes.
- **Default access principle:** least privilege + purpose-based access requests approved by domain owners.

---

## 13. Forecasting Data Quality Standards, Monitoring, and SLAs

### 13.1 Quality Standards (Forecast-Specific)

| Quality Dimension | Standard | Threshold / Rule |
|------------------|----------|------------------|
| Completeness | Required keys present | 99.9% non-null for core keys (`unified_product_id`, `channel`, `country_code`, `forecast_week`) |
| Validity | Business rule conformance | No negative unit forecasts unless return scenarios explicitly modeled |
| Consistency | Reference alignment | 100% FK integrity to unified product master for Gold outputs |
| Timeliness | SLA compliance | Forecast run published by Monday 06:00 UTC-3 |
| Accuracy | Forecast performance targets | WMAPE < 20% (12-month target), channel-level MAPE guardrails |

### 13.2 Accuracy Monitoring by Channel (Operational Guardrails)

| Channel | KPI | Target | Alert Threshold |
|--------|-----|--------|-----------------|
| eCommerce | WMAPE | <= 18% | Alert if > 22% for 2 consecutive weekly cycles |
| Retail | WMAPE | <= 20% | Alert if > 24% for 2 consecutive weekly cycles |
| Wholesale | WMAPE | <= 22% | Alert if > 26% for 2 consecutive weekly cycles |
| Franchise | WMAPE | <= 24% | Alert if > 28% for 2 consecutive weekly cycles |

> These are operating guardrails; final KPI commitment remains WMAPE < 20% overall at 12 months.

### 13.3 Freshness SLAs by Layer

| Layer | SLA Target | Breach Condition |
|------|------------|------------------|
| Bronze (streaming) | < 10 minutes | Ingestion lag > 10 minutes for 3 consecutive checks |
| Bronze (batch) | < 1 hour after source delivery | Missing batch beyond 60 minutes |
| Silver | < 4 hours from Bronze update | Silver refresh delay > 4 hours |
| Gold (features) | < 6 hours from Silver refresh | Feature table not refreshed within window |
| Gold (forecast outputs) | Weekly by Monday 06:00 UTC-3 | Forecast publication missed |

### 13.4 Anomaly Detection on Input Signals

- **Volume anomaly checks:** spike/drop detection on event counts by source/channel/country.
- **Distribution drift checks:** feature distribution drift (PSI) against training baseline.
- **Business plausibility checks:** price/promo/outlier validations (e.g., extreme discounts, impossible demand jumps).
- **Late-arrival controls:** monitor delayed events and reprocessing window adherence.

### 13.5 Alerting and Incident Response

| Event Type | Alert Channel | Initial Response |
|-----------|---------------|------------------|
| Pipeline failure | PagerDuty/Slack + email | Auto-retry, then on-call escalation |
| SLA breach | Slack + ticket | Prioritized triage by data engineering owner |
| Model drift | Slack + ML ops queue | Trigger retraining candidate run and challenger evaluation |
| Accuracy degradation | Weekly forecast quality report + alert | Root cause analysis (data, features, or model) |

Operational target:
- **MTTD (detect):** <= 15 minutes for pipeline failures
- **MTTR (recover):** <= 2 hours for critical Bronze/Silver/Gold pipeline incidents
