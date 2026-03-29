# Architecture Diagrams — adidas LAM Demand Forecasting Platform

## A. End-to-End Platform Overview

```mermaid
graph LR
    subgraph Sources["Source Systems"]
        SAP["SAP ERP<br/>(Orders, Inventory,<br/>Product Master)"]
        POS["Retail POS<br/>(Transactions,<br/>Foot Traffic)"]
        ECOM["eCommerce<br/>(Clickstream,<br/>Conversions)"]
        WHL["Wholesale<br/>(Order Books,<br/>Sell-Through)"]
        FRN["Franchise<br/>(Sell-In Orders,<br/>Commitments)"]
        PROMO["Promo Calendars<br/>(Campaigns,<br/>Discounts)"]
        EXT["External Signals<br/>(Weather, Macro)"]
        CI["Consumer Intelligence<br/>(Google Trends, Social<br/>Listening, AI Chatbots)"]
    end

    subgraph Ingestion["Ingestion Layer"]
        MSK["AWS MSK<br/>(Kafka)"]
        KIN["AWS Kinesis<br/>Data Streams"]
        S3R["AWS S3<br/>(Raw Landing)"]
        LMB["AWS Lambda<br/>(Event Triggers)"]
    end

    subgraph Lakehouse["Databricks Lakehouse"]
        subgraph Bronze["Bronze Layer<br/>(Raw, Append-Only)"]
            B1["bronze.sap_erp.*"]
            B2["bronze.pos.*"]
            B3["bronze.ecomm.*"]
            B4["bronze.wholesale.*"]
            B5["bronze.franchise.*"]
            B6["bronze.promo.*"]
            B7["bronze.external.*"]
            B8["bronze.consumer_intel.*"]
        end

        subgraph Silver["Silver Layer<br/>(Cleansed, Conformed)"]
            S1["Unified Product<br/>Master"]
            S2["Standardized<br/>Demand Signals"]
            S3["Promo Calendar<br/>(Clean)"]
            S4["External + Consumer<br/>Signals (Normalized)"]
        end

        subgraph Gold["Gold Layer<br/>(Business-Ready)"]
            G1["ML Feature<br/>Tables"]
            G2["Forecast<br/>Outputs"]
            G3["Accuracy<br/>Metrics"]
            G4["Aggregated<br/>Demand Views"]
        end

        subgraph ML["ML Platform"]
            FS["Feature Store"]
            TR["Training<br/>Orchestration"]
            MR["MLflow Model<br/>Registry"]
            SRV["Model Serving<br/>(Batch + On-Demand)"]
            MON["Monitoring<br/>(Drift, Accuracy)"]
        end
    end

    subgraph Modules["Platform Modules (User Experience Layer)"]
        M1["MLOps Studio<br/>(Data Scientists)<br/>Production Monitor +<br/>Challenger Lab"]
        M2["Scenario Planner<br/>(Data Analysts &<br/>Category Managers)<br/>What-If Simulation +<br/>Top-3 Model Selection"]
        M3["Executive Dashboard<br/>(C-Level & Country Leaders)<br/>Forecast-to-Plan Gap +<br/>Business KPI Tracking"]
    end

    subgraph Downstream["Downstream Systems"]
        IBP["SAP IBP<br/>(Supply Chain)"]
        BI["BI Dashboards<br/>(Tableau / Power BI)"]
    end

    %% Source to Ingestion
    SAP -->|"Batch (Daily)"| S3R
    POS -->|"Streaming"| MSK
    ECOM -->|"Streaming"| KIN
    WHL -->|"Batch (Daily)"| S3R
    FRN -->|"Batch (Daily)"| S3R
    PROMO -->|"Batch (Weekly)"| S3R
    EXT -->|"Batch (Daily)"| S3R
    CI -->|"Batch (Daily)"| S3R

    %% Ingestion to Bronze
    S3R --> LMB --> Bronze
    MSK --> Bronze
    KIN --> Bronze

    %% Medallion Flow
    Bronze -->|"Delta Live Tables"| Silver
    Silver -->|"Delta Live Tables"| Gold

    %% ML Flow
    Gold --> FS --> TR --> MR --> SRV
    SRV --> G2
    MON --> TR

    %% Gold to Modules
    G2 --> M1
    G3 --> M1
    G2 --> M2
    G4 --> M2
    G3 --> M3
    G4 --> M3

    %% Modules to Downstream
    M1 -->|"Model Promotion"| MR
    M2 -->|"Selected Forecast"| IBP
    M3 --> BI
    G2 --> IBP
```

```mermaid
graph TB
    subgraph Governance["Governance Spine (Spanning All Layers)"]
        UC["Unity Catalog<br/>(Metastore)"]
        LIN["Data Lineage<br/>(End-to-End)"]
        RBAC["Role-Based<br/>Access Control"]
        AUDIT["Audit Logs<br/>(Compliance)"]
        DQ["Data Quality<br/>Expectations"]
    end

    UC --- LIN --- RBAC --- AUDIT --- DQ
```

---

## B. Medallion Architecture Detail

```mermaid
graph TD
    subgraph Bronze["BRONZE — Raw Ingestion (Schema-on-Read, Append-Only)"]
        B_SAP["<b>bronze.sap_erp.sales_orders_raw</b><br/>Source: SAP ERP via Fivetran<br/>Format: Delta (append-only)<br/>Partition: ingestion_date, country_code<br/>Refresh: Daily T+1"]
        B_POS["<b>bronze.pos.transactions_raw</b><br/>Source: Retail POS via MSK<br/>Format: Delta (streaming append)<br/>Partition: event_date, store_id<br/>Refresh: 5-min micro-batch"]
        B_ECOM["<b>bronze.ecomm.clickstream_raw</b><br/>Source: eCommerce via Kinesis<br/>Format: Delta (streaming append)<br/>Partition: event_date, country_code<br/>Refresh: 5-min micro-batch"]
        B_WHL["<b>bronze.wholesale.order_books_raw</b><br/>Source: B2B Portal / SFTP<br/>Format: Delta (append-only)<br/>Partition: ingestion_date, account_id<br/>Refresh: Daily"]
        B_FRN["<b>bronze.franchise.sell_in_raw</b><br/>Source: Franchise Portal / API<br/>Format: Delta (append-only)<br/>Partition: ingestion_date, franchise_id<br/>Refresh: Daily"]
        B_PROMO["<b>bronze.promo.calendar_raw</b><br/>Source: Marketing Systems<br/>Format: Delta<br/>Partition: campaign_year<br/>Refresh: Weekly"]
        B_EXT["<b>bronze.external.signals_raw</b><br/>Source: Weather API, Macro APIs<br/>Format: Delta<br/>Partition: signal_type, date<br/>Refresh: Daily"]
        B_CI["<b>bronze.consumer_intel.signals_raw</b><br/>Source: Google Trends, Social Listening APIs,<br/>AI Chatbot Query Patterns<br/>Format: Delta<br/>Partition: signal_type, country_code, date<br/>Refresh: Daily (2–8 week lead time advantage)"]
    end

    subgraph Silver["SILVER — Cleansed, Conformed, Deduplicated"]
        S_PM["<b>silver.demand.unified_product_master</b><br/>SKU harmonization across SAP material #,<br/>POS item codes, eComm product IDs<br/>SCD Type 2 for historical tracking"]
        S_DS["<b>silver.demand.standardized_signals</b><br/>Unified demand events: units sold,<br/>currency-normalized revenue,<br/>channel + country attribution<br/>Deduped, null-handled, late-arrival reconciled"]
        S_PC["<b>silver.demand.promo_calendar_clean</b><br/>Standardized campaigns with<br/>start/end dates, discount %, channel scope,<br/>country applicability"]
        S_EX["<b>silver.demand.external_signals_clean</b><br/>Normalized weather indices,<br/>CPI, exchange rates, sentiment scores<br/>Aligned to forecasting grain (week × country)"]
        S_CI["<b>silver.demand.consumer_intel_clean</b><br/>Normalized search volume indices,<br/>brand/category sentiment scores,<br/>AI query trend signals<br/>Aligned to forecasting grain (week × country × category)"]
    end

    subgraph Gold["GOLD — Business-Ready Aggregations & ML Features"]
        G_FT["<b>gold.forecast.feature_store</b><br/>Engineered features: lag(1..52), rolling_mean,<br/>promo_active, seasonality_index,<br/>weather_index, consumer_signal_index,<br/>social_sentiment_score, search_trend_score<br/>Grain: SKU × channel × country × week"]
        G_OUT["<b>gold.forecast.outputs_v1</b><br/>Point forecasts + prediction intervals<br/>by SKU × channel × country × week<br/>Model version, confidence score, top-3 candidates"]
        G_ACC["<b>gold.forecast.accuracy_metrics</b><br/>MAPE, WMAPE, bias, opportunity cost impact<br/>by channel, country, category, model version<br/>Updated post each forecast cycle"]
        G_AGG["<b>gold.analytics.demand_by_channel_country</b><br/>Aggregated actuals + forecasts<br/>Forecast-to-Plan gap tracking<br/>BI-optimized with Z-ordering"]
    end

    B_SAP --> S_PM
    B_SAP --> S_DS
    B_POS --> S_PM
    B_POS --> S_DS
    B_ECOM --> S_DS
    B_WHL --> S_DS
    B_FRN --> S_DS
    B_PROMO --> S_PC
    B_EXT --> S_EX
    B_CI --> S_CI

    S_PM --> G_FT
    S_DS --> G_FT
    S_PC --> G_FT
    S_EX --> G_FT
    S_CI --> G_FT

    G_FT --> G_OUT
    G_OUT --> G_ACC
    S_DS --> G_AGG
    G_OUT --> G_AGG
```

---

## C. Three-Module User Experience Layer

```mermaid
graph TD
    subgraph Gold["Gold Layer (Data Source)"]
        G_OUT["gold.forecast.outputs_v1<br/>(Top-3 model candidates)"]
        G_ACC["gold.forecast.accuracy_metrics<br/>(MAPE, WMAPE, drift)"]
        G_AGG["gold.analytics.demand_by_channel_country<br/>(Forecast-to-Plan gap)"]
    end

    subgraph M1["Module 1 — MLOps Studio<br/>(Data Scientists & ML Engineers)"]
        M1A["Production Monitor<br/>— Live model WMAPE / PSI / drift alerts<br/>— Performance by channel × country<br/>— Auto-retrain trigger history"]
        M1B["Challenger Lab<br/>— Register new model experiments<br/>— A/B test against production champion<br/>— Promote / retire models via MLflow Registry<br/>— They decide what goes to production"]
    end

    subgraph M2["Module 2 — Scenario Planner<br/>(Category Managers, Product Owners,<br/>Analysts, Marketing Managers)"]
        M2A["Top-3 Model View<br/>— See 3 best models for any SKU × channel × country<br/>— Compare prediction intervals and confidence<br/>— No ML expertise required"]
        M2B["What-If Simulator<br/>— Adjust: promo %, competitor event, macro shock,<br/>  seasonal multiplier, supply constraint<br/>— See how each model forecast responds<br/>— Select best forecast for their domain"]
        M2C["Portfolio Analyzer<br/>— Category-level demand view<br/>— Channel mix impact<br/>— Inventory implication estimates"]
    end

    subgraph M3["Module 3 — Executive Dashboard<br/>(CEO, CFO, Country Leaders)"]
        M3A["Forecast-to-Plan Gap Tracker<br/>— Live delta: forecasted vs financial plan<br/>— By country, channel, category<br/>— Updated weekly post forecast cycle"]
        M3B["Business KPI Command Center<br/>— Revenue at Risk (stockout exposure)<br/>— Inventory Opportunity Cost (overstock)<br/>— Market Reaction Speed (signal-to-decision days)<br/>— Analyst automation rate"]
        M3C["Trend Alerts<br/>— Consumer signal early warnings<br/>— Model accuracy degradation flags<br/>— Country-level performance heatmap"]
    end

    G_OUT --> M1A
    G_ACC --> M1A
    G_ACC --> M1B
    M1B -->|"Model Promotion"| MLflow["MLflow Model Registry"]

    G_OUT --> M2A
    G_OUT --> M2B
    G_AGG --> M2C

    G_AGG --> M3A
    G_ACC --> M3B
    G_AGG --> M3C
```

---

## D. ML Pipeline Architecture

```mermaid
graph LR
    subgraph FeatureEng["Feature Engineering"]
        FS["Databricks<br/>Feature Store<br/>(Unity Catalog)"]
        FT["Feature Tables<br/>(gold.forecast.<br/>feature_store)<br/>incl. consumer_signal_index<br/>search_trend_score"]
    end

    subgraph Training["Training Orchestration"]
        WF["Databricks<br/>Workflows<br/>(Scheduled Weekly)"]
        STAT["Statistical Models<br/>(Prophet, ETS)"]
        ML["ML Models<br/>(LightGBM, XGBoost)"]
        DL["Deep Learning<br/>(TFT, N-BEATS)"]
        ENS["Ensemble Layer<br/>(Weighted Stacking)"]
    end

    subgraph Registry["Model Registry"]
        MLF["MLflow<br/>Model Registry"]
        STG["Staging"]
        PRD["Production<br/>(Top-3 exposed<br/>to Scenario Planner)"]
        CHMP["Champion /<br/>Challenger<br/>(MLOps Studio)"]
    end

    subgraph Serving["Model Serving"]
        BATCH["Batch Scoring<br/>(Primary)<br/>Databricks Workflows<br/>→ Gold Tables"]
        RT["On-Demand Serving<br/>(Secondary)<br/>Databricks Model Serving<br/>→ Scenario Planner API"]
    end

    subgraph Monitoring["Monitoring & Drift"]
        MAPE["Forecast Accuracy<br/>(MAPE / WMAPE)"]
        PSI["Feature Drift<br/>(PSI)"]
        CI_MON["Consumer Signal<br/>Freshness Monitor<br/>(API quotas, gaps)"]
        ALERT["Alerting<br/>(PagerDuty / Slack)"]
        RETRAIN["Auto-Retrain<br/>Trigger"]
    end

    FS --> FT --> WF
    WF --> STAT
    WF --> ML
    WF --> DL
    STAT --> ENS
    ML --> ENS
    DL --> ENS

    ENS --> MLF
    MLF --> STG --> PRD
    MLF --> CHMP

    PRD --> BATCH
    PRD --> RT

    BATCH --> MAPE
    MAPE --> PSI --> ALERT
    CI_MON --> ALERT
    ALERT --> RETRAIN --> WF
```

---

## E. AWS Infrastructure

```mermaid
graph TD
    subgraph AWS["AWS Account — sa-east-1 (São Paulo)"]
        subgraph VPC["VPC (10.0.0.0/16)"]
            subgraph Private["Private Subnets"]
                DBX["Databricks Workspace<br/>(via PrivateLink)"]
                MSK["Amazon MSK<br/>(Kafka Cluster)<br/>3 brokers, m5.large"]
                KIN["Amazon Kinesis<br/>Data Streams"]
            end

            subgraph Public["Public Subnets"]
                NAT["NAT Gateway"]
                ALB["Application Load<br/>Balancer<br/>(Scenario Planner API)"]
            end
        end

        subgraph Storage["S3 Storage"]
            S3_RAW["s3://adidas-lam-raw-landing/<br/>(Source file drops)"]
            S3_BRONZE["s3://adidas-lam-bronze/<br/>(Delta tables)"]
            S3_SILVER["s3://adidas-lam-silver/<br/>(Delta tables)"]
            S3_GOLD["s3://adidas-lam-gold/<br/>(Delta tables)"]
            S3_ML["s3://adidas-lam-ml-artifacts/<br/>(MLflow, checkpoints)"]
        end

        subgraph Security["Security"]
            KMS["AWS KMS<br/>(Encryption at rest)"]
            IAM["IAM Roles<br/>(Cross-service access)"]
            SCT["AWS Secrets Manager<br/>(API keys, credentials,<br/>Social Listening tokens)"]
        end

        subgraph Integration["Integration Services"]
            LMB["AWS Lambda<br/>(Event-driven triggers)"]
            EVB["Amazon EventBridge<br/>(Orchestration events)"]
            SNS["Amazon SNS<br/>(Alerting)"]
        end
    end

    subgraph Databricks["Databricks Control Plane"]
        UC["Unity Catalog<br/>Metastore"]
        WKSP["Workspace<br/>(Dev / Staging / Prod)"]
    end

    %% Connections
    S3_RAW --> LMB --> DBX
    MSK --> DBX
    KIN --> DBX
    DBX --> S3_BRONZE
    DBX --> S3_SILVER
    DBX --> S3_GOLD
    DBX --> S3_ML
    KMS --> S3_BRONZE
    KMS --> S3_SILVER
    KMS --> S3_GOLD
    KMS --> S3_ML
    UC --> WKSP --> DBX
    DBX --> ALB
```

---

## F. Data Governance Model

```mermaid
graph TD
    subgraph UnityCatalog["Unity Catalog Metastore"]
        subgraph Catalogs["Catalogs"]
            DEV["dev"]
            STG["staging"]
            PROD["prod"]
        end

        subgraph Schemas["Schemas (prod example)"]
            SCH_B["prod.bronze_*<br/>(sap_erp, pos, ecomm,<br/>wholesale, franchise,<br/>promo, external,<br/>consumer_intel)"]
            SCH_S["prod.silver_demand"]
            SCH_G_F["prod.gold_forecast"]
            SCH_G_A["prod.gold_analytics"]
            SCH_ML["prod.ml_models"]
        end
    end

    subgraph RBAC["Role-Based Access Control — by Module"]
        subgraph Roles["Defined Roles"]
            R_DE["Data Engineers<br/><i>Own Bronze + Silver</i><br/>Read/Write: bronze_*, silver_*<br/>Read: gold_*"]
            R_DS["Data Scientists / ML Eng<br/><i>MLOps Studio</i><br/>Read: silver_*<br/>Read/Write: gold_*, ml_*<br/>Model promote/retire rights"]
            R_DA["Data Analysts / Category Mgrs<br/><i>Scenario Planner</i><br/>Read: gold_forecast (top-3 view)<br/>Read: gold_analytics<br/>What-if simulation access"]
            R_EX["Executives / Country Leaders<br/><i>Executive Dashboard</i><br/>Read: gold_analytics<br/>KPI views only, no raw data"]
            R_FP["Franchise Partners<br/><i>Restricted</i><br/>Read: filtered views<br/>Country-level restriction"]
        end
    end

    subgraph Lineage["End-to-End Lineage"]
        L1["Source System"] --> L2["Bronze Table"] --> L3["Silver Table"] --> L4["Gold Table"] --> L5["Forecast Output"]
        L5 --> L6["Module Layer<br/>(MLOps / Scenario / Executive)"]
        L6 --> L7["SAP IBP /<br/>BI Dashboard"]
    end

    subgraph Compliance["LAM Regulatory Compliance"]
        LGPD["Brazil — LGPD<br/>PII masking via dynamic views<br/>Data residency: sa-east-1<br/>Consent tracking in Bronze"]
        LFPD["Mexico — LFPDPPP<br/>Consent metadata propagation<br/>Data subject access requests"]
        LEY["Argentina — Ley 25.326<br/>Deletion via Delta tombstoning<br/>Cross-border transfer controls"]
        AUDIT["Audit Trail<br/>Unity Catalog system tables<br/>90-day query + access logs"]
    end

    Catalogs --> Schemas
    Schemas --> RBAC
    RBAC --> Compliance
```
