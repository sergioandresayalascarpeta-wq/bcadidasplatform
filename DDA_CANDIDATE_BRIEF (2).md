# Director of Data Engineering — Technical Use Case

## Overview
As part of the evaluation process for the **Director of Data Engineering** position at adidas, we ask you to prepare a strategic and technical proposal for the use case described below. This exercise is designed to assess your technical depth across Data Engineering, Data Science (ML), and Data Architecture, as well as your strategic thinking and leadership capabilities.

---

## Use Case: Demand Forecasting Platform for adidas LAM

### Context
adidas Latin America (LAM) needs to build a robust **Demand Forecasting** capability to drive inventory planning, replenishment, and assortment decisions across all commercial channels in the region. Demand forecasting in LAM is a complex, multi-dimensional problem due to the diversity of go-to-market models, local market dynamics, and data maturity levels across countries (Brazil, Mexico, Argentina, Colombia, Chile, Peru, among others).

The forecasting platform must support **all adidas channels**:

- **eCommerce (B2C)** — adidas.com and app-based direct-to-consumer sales, where demand signals come from web traffic, conversion funnels, promotions, and seasonality patterns specific to each LAM country.
- **Retail / Own Stores (B2C)** — adidas-operated physical stores, including outlet and full-price formats, where POS transaction data, foot traffic, and local events drive demand.
- **Wholesale (B2B)** — Sales to key accounts and multi-brand retailers (e.g., Netshoes, Liverpool, Falabella), where demand depends on order books, sell-through rates, retailer inventory positions, and pre-order cycles.
- **Franchise (B2B)** — Franchise-operated stores with limited data visibility, where forecasting relies on sell-in orders, contractual commitments, and indirect sell-out proxies.

### Current State
The current landscape presents significant challenges: fragmented data sources (SAP ERP, Salesforce, Commerce Microservices / Relational, Non-Relational databases, retail POS systems, distributor portals), inconsistent product master data across channels, lack of unified demand signals, and limited ML/statistical forecasting capabilities beyond basic trending in spreadsheets. Legacy batch pipelines run with high latency (T+2 to T+5), and there is no centralized feature store or model registry to support forecasting models at scale.

### What We Ask You to Address
Your solution should account for channel-specific demand patterns, cross-channel cannibalization effects, promotional uplift modeling, new product introduction (NPI) forecasting with limited history, and the ability to reconcile bottom-up forecasts with top-down financial targets.

---

## Architectural Constraints
The following are non-negotiable platform decisions already in place at adidas:

- **Platform:** Databricks Lakehouse
- **Cloud Provider:** AWS
- **Data Architecture Pattern:** Bronze / Silver / Gold (medallion architecture)

Your proposal must work within these constraints.

---

## Areas to Address

### 1. Technical Architecture & Design
- Design the demand forecasting data platform within the Databricks Lakehouse, clearly defining what belongs in each medallion layer:
  - **Bronze** — Raw ingestion from source systems (SAP ERP orders, POS transactions, eCommerce clickstream, wholesale order books, franchise sell-in feeds, promotional calendars, external signals such as weather and macroeconomic indicators).
  - **Silver** — Cleansed, conformed, and deduplicated data: unified product master (article/SKU harmonization across channels), standardized demand signals, currency normalization, and channel-attributed sales history.
  - **Gold** — Business-ready aggregations and ML feature tables: demand forecasts by channel × country × category × week, forecast accuracy metrics, promotional uplift features, and serving tables consumed by planning systems (e.g., SAP IBP) and BI dashboards.
- Define the technology stack within the Databricks ecosystem (Delta Lake, Databricks Workflows or external orchestrators such as Airflow/MWAA, MLflow, Unity Catalog).
- Address how the platform integrates with AWS infrastructure (S3, MSK/Kinesis for streaming, Lambda for event-driven triggers) and any cross-account or cross-region considerations for LAM.
- Design for scalability across LAM markets, fault tolerance, and cost optimization (cluster policies, auto-scaling, spot/on-demand strategies).
- Propose a compute strategy: separation of ETL, ML training, and serving/inference workloads using appropriate Databricks compute types (Jobs Clusters, SQL Warehouses, Model Serving endpoints).
- Define the **forecasting model strategy** at an architectural level: which model families are appropriate (e.g., statistical time series, ML-based, deep learning), how the choice impacts compute and data requirements, whether to build unified cross-channel models vs. channel-specific models, and how the end-to-end ML pipeline is designed (feature store, training orchestration, model registry, A/B testing, model serving). You are not expected to define algorithmic details, but you should demonstrate fluency in model infrastructure trade-offs.

### 2. Data Governance & Quality
- Define a data governance framework using Unity Catalog: data ownership per domain (demand planning, commercial, supply chain), cataloging of Bronze/Silver/Gold assets, end-to-end lineage, and role-based access control.
- Define **how consumers access forecasting output data**: who can read Gold-layer forecast tables (e.g., demand planners, commercial leads, supply chain managers, franchise partners), through which interfaces (SQL Warehouses, BI tools, API endpoints, exports to SAP IBP), and with what granularity controls (country-level restrictions, channel-level permissions, sensitive data masking).
- Propose data quality standards, monitoring, and SLAs specific to forecasting: forecast accuracy thresholds (e.g., MAPE/WMAPE by channel), data freshness SLAs per layer, anomaly detection on input signals, and alerting on model drift or pipeline failures.
- Address **LAM-specific regulatory compliance**:
  - **Brazil (LGPD)**
  - **Mexico (LFPDPPP)**
  - **Argentina (Ley 25.326)**
  - **Regional considerations**
### 3. Strategic Vision & Business Alignment
- Define KPIs to measure the success of the demand forecasting platform.
- Present a phased roadmap with milestones (short-term, mid-term, long-term).

### 4. Stakeholder Management & Communication
- Demonstrate the ability to communicate technical concepts to non-technical stakeholders (C-level, product, marketing).
- Define collaboration models with Business and Product teams.
- Present a change management approach for platform adoption.

### 5. Execution & Delivery
- Describe how to manage competing priorities and technical debt.
- Define development practices: CI/CD for data pipelines, testing strategies, observability.
- Present incident management and on-call strategies for data reliability.

---

## Deliverables

Please prepare the following:

1. **Architecture Diagram** — High-level design of the proposed demand forecasting data platform.
2. **Technical Proposal** — Written document (max 2 pages) covering your architecture decisions, trade-offs, and rationale.
3. **Roadmap** — Phased execution plan with timelines and dependencies.
4. **Presentation** — You will deliver a 30-minute presentation to a panel simulating C-level and technical stakeholders, followed by 15 minutes of Q&A.

---

## Evaluation
Your proposal will be evaluated across the five areas listed above. We are looking for a balance of technical depth, strategic thinking, and practical execution. There are no trick questions — we want to understand how you think about complex data problems and how you would lead the delivery of this platform.

Good luck!
