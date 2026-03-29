# Data Flow Detail — adidas LAM Demand Forecasting Platform

## 1. Source System Inventory

| Source | System | Protocol | Frequency | Landing Zone | Bronze Table(s) | Est. Daily Volume |
|--------|--------|----------|-----------|-------------|-----------------|-------------------|
| SAP ERP (Orders) | SAP S/4HANA | BAPI/RFC via Fivetran | Daily batch, T+1 | `s3://adidas-lam-raw-landing/sap/` | `bronze.sap_erp.sales_orders_raw` | ~5M rows |
| SAP ERP (Inventory) | SAP S/4HANA | BAPI/RFC via Fivetran | Daily batch, T+1 | `s3://adidas-lam-raw-landing/sap/` | `bronze.sap_erp.inventory_snapshots_raw` | ~2M rows |
| SAP ERP (Product Master) | SAP S/4HANA | BAPI/RFC via Fivetran | Daily batch (CDC) | `s3://adidas-lam-raw-landing/sap/` | `bronze.sap_erp.material_master_raw` | ~50K rows (delta) |
| Retail POS | Various POS systems | Kafka (AWS MSK) | Streaming, 5-min micro-batch | MSK topic: `pos-transactions` | `bronze.pos.transactions_raw` | ~50M events |
| eCommerce Clickstream | adidas.com / App | Kinesis Data Streams | Streaming, 5-min micro-batch | Kinesis stream: `ecomm-clickstream` | `bronze.ecomm.clickstream_raw` | ~200M events |
| eCommerce Orders | Commerce Microservices | REST API / CDC | Near real-time via MSK | MSK topic: `ecomm-orders` | `bronze.ecomm.orders_raw` | ~2M rows |
| Wholesale Order Books | B2B Portal / EDI | SFTP + API | Daily batch | `s3://adidas-lam-raw-landing/wholesale/` | `bronze.wholesale.order_books_raw` | ~500K rows |
| Wholesale Sell-Through | Retailer data feeds | SFTP / API | Weekly batch | `s3://adidas-lam-raw-landing/wholesale/` | `bronze.wholesale.sell_through_raw` | ~1M rows/week |
| Franchise Sell-In | Franchise Portal | REST API | Daily batch | `s3://adidas-lam-raw-landing/franchise/` | `bronze.franchise.sell_in_raw` | ~1M rows |
| Promotional Calendars | Marketing / Commercial | Manual upload + API | Weekly | `s3://adidas-lam-raw-landing/promo/` | `bronze.promo.calendar_raw` | ~10K rows/week |
| Weather Data | OpenWeatherMap / Meteoblue | REST API | Daily | `s3://adidas-lam-raw-landing/external/` | `bronze.external.weather_raw` | ~50K rows |
| Macroeconomic Indicators | Central banks / IMF | REST API | Monthly / Weekly | `s3://adidas-lam-raw-landing/external/` | `bronze.external.macro_raw` | ~5K rows |
| Google Trends | Google Trends API | REST API | Daily | `s3://adidas-lam-raw-landing/external/` | `bronze.external.trends_raw` | ~20K rows |

---

## 2. Bronze Layer — Ingestion Rules

### General Principles
- **Append-only**: No updates or deletes in Bronze; all records preserved with ingestion metadata
- **Schema-on-read**: Raw schema preserved from source; no transformations
- **Metadata columns** added at ingestion:
  - `_ingestion_timestamp` — when the record was loaded
  - `_source_file` — source file path or topic/partition/offset
  - `_batch_id` — unique identifier for the ingestion batch

### Streaming Sources (POS + eCommerce)

```
MSK/Kinesis → Spark Structured Streaming → Delta Table (Bronze)
    |
    ├── Trigger: processingTime = "5 minutes" (micro-batch)
    ├── Checkpoint: s3://adidas-lam-checkpoints/{source}/
    ├── Output mode: append
    ├── Schema enforcement: minimal (parse JSON, add metadata)
    └── Error handling: dead-letter S3 path for malformed records
```

### Batch Sources (SAP, Wholesale, Franchise, External)

```
Source → S3 Raw Landing → Lambda (trigger on s3:ObjectCreated)
    → Databricks Workflow (Auto Loader)
    → Delta Table (Bronze)
    |
    ├── Auto Loader with cloudFiles format
    ├── Schema evolution: mergeSchema = true
    ├── File notification mode (for large volumes)
    └── Partition: ingestion_date={YYYY-MM-DD}, country_code={XX}
```

---

## 3. Silver Layer — Transformation Rules

### 3.1 Unified Product Master (`silver.demand.unified_product_master`)

**Purpose:** Single canonical product entity across all channels and source systems.

| Source Field | Mapping | Logic |
|-------------|---------|-------|
| SAP Material Number | `sap_material_id` | Primary key from ERP |
| POS Item Code | `pos_item_code` | Mapped via cross-reference table |
| eComm Product ID | `ecomm_product_id` | Mapped via product catalog API |
| Wholesale Article # | `wholesale_article_id` | Mapped via account-specific mapping tables |

**Entity Resolution Logic:**
1. Exact match on EAN/UPC barcode (highest confidence)
2. Fuzzy match on product description + color + size (Levenshtein distance < 3)
3. Manual mapping table for exceptions (maintained by Product Data team)
4. SCD Type 2 tracking: `valid_from`, `valid_to`, `is_current` columns

**Output Schema:**
```
unified_product_id  STRING    -- Surrogate key
sap_material_id     STRING    -- SAP reference
product_name        STRING    -- Canonical name
category_l1         STRING    -- e.g., Footwear, Apparel, Accessories
category_l2         STRING    -- e.g., Running, Football, Originals
gender              STRING    -- Men, Women, Kids, Unisex
size                STRING    -- Normalized size
color_code          STRING    -- Canonical color
country_availability ARRAY<STRING>  -- Countries where available
channel_availability ARRAY<STRING>  -- Channels where available
valid_from          TIMESTAMP
valid_to            TIMESTAMP
is_current          BOOLEAN
```

### 3.2 Standardized Demand Signals (`silver.demand.standardized_signals`)

**Purpose:** Unified demand event table across all channels.

**Transformations:**
- Currency normalization → USD (using daily exchange rates from `bronze.external.macro_raw`)
- Unit standardization → individual units (some wholesale sources report in cases/packs)
- Channel tagging → `ecommerce`, `retail`, `wholesale`, `franchise`
- Country code standardization → ISO 3166-1 alpha-2
- Deduplication → hash-based dedup on `(order_id, line_item, source_system)`
- Late arrival handling → upsert via `MERGE INTO` with 7-day lookback window

**Output Schema:**
```
demand_signal_id    STRING    -- Surrogate key
unified_product_id  STRING    -- FK to product master
channel             STRING    -- ecommerce | retail | wholesale | franchise
country_code        STRING    -- ISO 3166-1 alpha-2
store_id            STRING    -- Nullable (retail/franchise only)
account_id          STRING    -- Nullable (wholesale/franchise only)
event_date          DATE
event_type          STRING    -- sale | return | order | cancel
units               DECIMAL(12,2)
revenue_usd         DECIMAL(14,2)
revenue_local       DECIMAL(14,2)
currency_code       STRING
is_promotional      BOOLEAN
promo_id            STRING    -- FK to promo calendar (nullable)
```

### 3.3 Promo Calendar Clean (`silver.demand.promo_calendar_clean`)

**Transformations:**
- Date standardization (various input formats → ISO 8601)
- Discount normalization (% off, BOGO, fixed discount → unified discount %)
- Channel scope mapping (which channels participate)
- Country applicability tagging

### 3.4 External Signals Clean (`silver.demand.external_signals_clean`)

**Transformations:**
- Weather: daily → weekly aggregation (avg temp, precipitation index, extreme weather flag)
- Macro: CPI, exchange rate, consumer confidence → aligned to forecast week grain
- Trends: Google Trends index normalized per country and category

---

## 4. Gold Layer — Aggregations & Features

### 4.1 Feature Store (`gold.forecast.feature_store`)

**Grain:** `unified_product_id × channel × country_code × forecast_week`

| Feature | Description | Computation |
|---------|-------------|-------------|
| `units_lag_1w` to `units_lag_52w` | Lagged demand (1-52 weeks) | `LAG(units, N) OVER (PARTITION BY product, channel, country ORDER BY week)` |
| `units_rolling_mean_4w` | 4-week rolling average | `AVG(units) OVER (...ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)` |
| `units_rolling_mean_13w` | 13-week rolling average | Same pattern, 13-week window |
| `units_rolling_std_4w` | 4-week rolling std deviation | Volatility indicator |
| `yoy_growth` | Year-over-year growth rate | `(units_current - units_52w_ago) / units_52w_ago` |
| `is_promo_active` | Promotion active flag | Join with `silver.demand.promo_calendar_clean` |
| `promo_discount_pct` | Discount magnitude | From promo calendar |
| `promo_weeks_since_last` | Weeks since last promotion | Running counter |
| `seasonality_index` | Fourier seasonal components | Pre-computed seasonal decomposition |
| `weather_temp_avg` | Weekly avg temperature | From `silver.demand.external_signals_clean` |
| `weather_precip_idx` | Precipitation index | From external signals |
| `macro_cpi_index` | Consumer Price Index | Country-level monthly, forward-filled to weekly |
| `macro_fx_rate` | USD/local exchange rate | Daily, averaged to weekly |
| `category_trend` | Google Trends index | Per category × country |
| `price_current` | Current unit price | From product master + pricing feeds |
| `price_change_pct` | Week-over-week price change | Derived from price_current |
| `channel_mix_share` | Channel's share of total product demand | Cross-channel feature |
| `new_product_flag` | NPI indicator (<12 weeks history) | Based on first appearance date |
| `days_since_launch` | Days since product first sold | For NPI decay/ramp modeling |

### 4.2 Forecast Outputs (`gold.forecast.outputs_v1`)

**Grain:** `unified_product_id × channel × country_code × forecast_week`

```
forecast_id          STRING
unified_product_id   STRING
channel              STRING
country_code         STRING
forecast_week        DATE       -- Monday of forecast week
forecast_horizon     INT        -- Weeks ahead (1-26)
units_forecast       DECIMAL(12,2)
units_lower_bound    DECIMAL(12,2)  -- 10th percentile
units_upper_bound    DECIMAL(12,2)  -- 90th percentile
model_version        STRING     -- MLflow run ID
model_family         STRING     -- statistical | ml | dl | ensemble
confidence_score     DECIMAL(5,4)
generated_at         TIMESTAMP
```

### 4.3 Accuracy Metrics (`gold.forecast.accuracy_metrics`)

```
metric_id            STRING
evaluation_date      DATE
channel              STRING
country_code         STRING
category_l1          STRING
model_version        STRING
model_family         STRING
horizon_weeks        INT
mape                 DECIMAL(8,4)
wmape                DECIMAL(8,4)
bias                 DECIMAL(8,4)   -- Positive = over-forecast
hit_rate_10pct       DECIMAL(5,4)   -- % of SKUs within ±10%
coverage_80          DECIMAL(5,4)   -- % of actuals within 80% PI
```

### 4.4 Demand by Channel × Country (`gold.analytics.demand_by_channel_country`)

Pre-aggregated, Z-ordered on `(country_code, channel, category_l1)` for BI query performance.

**Grain:** `channel × country_code × category_l1 × week` (also materialized at daily and monthly grain)

```
channel              STRING
country_code         STRING
category_l1          STRING
period_date          DATE
period_grain         STRING     -- daily | weekly | monthly
units_actual         DECIMAL(14,2)
revenue_usd_actual   DECIMAL(16,2)
units_forecast       DECIMAL(14,2)
forecast_error_pct   DECIMAL(8,4)
units_yoy_change     DECIMAL(14,2)
```

---

## 5. Data Freshness SLAs

| Layer | Source Type | Target Freshness | Monitoring |
|-------|-----------|-----------------|------------|
| Bronze | Streaming (POS, eComm) | < 10 minutes | Structured Streaming metrics |
| Bronze | Batch (SAP, Wholesale) | < 1 hour after source delivery | Auto Loader lag monitoring |
| Silver | All | < 4 hours from Bronze update | DLT pipeline metrics |
| Gold (Features) | All | < 6 hours from Silver update | Workflow completion alerts |
| Gold (Forecasts) | Weekly cycle | Every Monday by 06:00 UTC-3 | Workflow SLA alert |
| Gold (BI Views) | All | < 8 hours from actuals update | SQL Warehouse query freshness |
