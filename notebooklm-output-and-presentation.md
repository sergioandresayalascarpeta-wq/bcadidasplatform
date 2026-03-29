# adidas LAM Demand Forecasting — Output Specs + Presentation Blueprint (NotebookLM)

## Contexto (1 minuto)
Este documento consolida el **output** del sistema propuesto para la plataforma de *Demand Forecasting* de adidas Latin America (LAM), con especial foco en las **tablas Gold** y en cómo esas salidas se consumen por **SAP IBP**, **BI**, **Demand Planners** y un **what-if API**.

Fuentes internas (ya existentes en el repo):
- `04-presentation/presentation.md` (deck Marp)
- `04-presentation/speaker-notes.md` (notas slide-by-slide)
- `01-architecture/data-flow-detail.md` (detalle de capas y schemas)
- `02-technical-proposal/technical-proposal.md` (KPIs, decisiones clave)

## 1) Qué “output” produce la plataforma (resultado final)
La plataforma transforma señales (ventas, inventario, clickstream, promociones, señales externas) desde una **capa Bronze** (raw, append-only) y una **capa Silver** (clean/unified) hacia una **capa Gold** que es la base para:
1. **Forecasts** (punto + intervalos)
2. **Métricas de exactitud** (MAPE/WMAPE, bias, coverage, hit-rate)
3. **Vistas agregadas** optimizadas para BI
4. **Feature sets** listos para entrenamiento/inferencia

### 1.1 Feature Store / Feature Tables — `gold.forecast.feature_store`
**Grano (grain):** `unified_product_id × channel × country_code × forecast_week`

**Propósito:** servir features ya ingeniería para modelos estadísticos/ML/DL y para que el proceso de scoring sea consistente y auditable.

**Features (ejemplos del catálogo del repo):**
- Demanda histórica:
  - `units_lag_1w` a `units_lag_52w`
  - `units_rolling_mean_4w`
  - `units_rolling_mean_13w`
  - `units_rolling_std_4w`
- Crecimiento / tendencia:
  - `yoy_growth`
- Promociones:
  - `is_promo_active`
  - `promo_discount_pct`
  - `promo_weeks_since_last`
- Estacionalidad:
  - `seasonality_index` (componentes Fourier)
- Señales externas:
  - `weather_temp_avg`
  - `weather_precip_idx`
  - `macro_cpi_index`
  - `macro_fx_rate`
  - `category_trend` (Google Trends)
- Precio:
  - `price_current`
  - `price_change_pct`
- Señales cross-channel:
  - `channel_mix_share`
- NPI (New Product Introductions):
  - `new_product_flag`
  - `days_since_launch`

> Nota: en el repo, estas features están definidas en `01-architecture/data-flow-detail.md` en la sección “4. Gold Layer — Aggregations & Features”.

### 1.2 Forecast Outputs — `gold.forecast.outputs_v1`
**Grano:** `unified_product_id × channel × country_code × forecast_week`

**Propósito:** entregar pronósticos por SKU/canal/país/semana con **intervalos de predicción** y trazabilidad al modelo que generó el resultado.

**Esquema (schema):**
```text
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

### 1.3 Accuracy Metrics — `gold.forecast.accuracy_metrics`
**Propósito:** medir desempeño del sistema post-ciclo de forecast, permitir alertas y disparar retraining (cuando aplique) con base en degradación sostenida.

**Esquema (schema):**
```text
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

### 1.4 Demand Aggregations for BI — `gold.analytics.demand_by_channel_country`
**Propósito:** vistas pre-agregadas para consultas de BI rápidas y consistentes con los pronósticos y el histórico.

**Grano (grain):** `channel × country_code × category_l1 × week`
**Grain materialized:** además de semanal, también “daily” y “monthly” (según el repo).

**Esquema (schema):**
```text
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

**Optimización:** Z-ordering en `(country_code, channel, category_l1)` para performance en BI.

## 2) Consumidores del output (quién usa cada salida)
Del diagrama de arquitectura (repo) y el flujo Gold→Consumers:

### 2.1 SAP IBP
- Entrada principal: forecasts (table/exports basados en `gold.forecast.outputs_v1`).
- Resultado: decisiones de suministro y planificación con forecast + intervalos.

### 2.2 BI Dashboards (Tableau / Power BI)
- Entrada principal: `gold.analytics.demand_by_channel_country` (actual vs forecast, error, YoY).
- Resultado: visibilidad para planners y analistas, drill-down por canal/país/categoría.

### 2.3 Demand Planners
- Entrada principal: forecasts por SKU/canal/país/semana (más intervalos y trazabilidad por modelo).
- Funcionalidad: revisión, ajuste y “what-if” (según fase) usando outputs + scoring.

### 2.4 What-if API / escenarios
- Entrada principal: features + modelo (reglas de serving y scoring).
- Resultado: “¿qué pasa si…?” (por ejemplo, variaciones de promo o escenarios por país).

## 3) Data Freshness SLAs (output debe llegar a tiempo)
Del repo (`01-architecture/data-flow-detail.md`):

| Layer | Source Type | Target Freshness | Monitoring |
|-------|-----------|-----------------|------------|
| Bronze (streaming) | POS, eComm | < 10 minutes | Structured Streaming metrics |
| Bronze (batch) | SAP, Wholesale | < 1 hour after delivery | Auto Loader lag monitoring |
| Silver | All | < 4 hours from Bronze update | DLT pipeline metrics |
| Gold (features) | All | < 6 hours from Silver update | Workflow completion alerts |
| Gold (forecasts) | Weekly cycle | Every Monday by 06:00 UTC-3 | Workflow SLA alert |
| Gold (BI views) | All | < 8 hours from actuals update | SQL Warehouse query freshness |

## 4) Éxito (KPIs que “se ven” en el output)
Del repo (`02-technical-proposal/technical-proposal.md`):
- Forecast accuracy (WMAPE):
  - Baseline: ~35-40% (spreadsheet)
  - Target (12 meses): < 20%
  - Fuente en el sistema: `gold.forecast.accuracy_metrics`
- Data latency:
  - Baseline: T+2 a T+5
  - Objetivo: T+0 ingestion, T+1 forecast
  - Fuente: monitoreo de pipelines
- Safety stock reduction: 10-15% (vía integración SAP IBP)
- Demand planner adoption: 80%+ (uso real del producto)
- Coverage de SKU: 95%+ automatizado

## 5) Blueprint de presentación (18 slides) para construir el deck
Puedes usar este bloque tal cual como “esqueleto” en NotebookLM para generar una presentación narrativa (ej. Marp, PowerPoint o Google Slides).

### Slide 1 — Título
- Mensaje: qué construimos y por qué ahora (forecasting ML-driven en LAM)

### Slide 2 — Agenda
- The challenge → vision → platform architecture → forecasting strategy → governance → roadmap → success metrics

### Slide 3 — The Challenge
- Fragmentación por canal/sistema
- Latencia (T+2 a T+5) y dependencia de spreadsheets
- IDs inconsistentes / lack of unified view

### Slide 4 — The Vision
- Medallion Lakehouse unificado
- Data más fresca + forecasting ML
- Métricas objetivo (WMAPE < 20%, safety stock -10-15%)

### Slide 5 — Platform Architecture
- Fuente → Ingestion → Bronze/Silver/Gold → ML platform → Consumers
- Governance spine (Unity Catalog / RBAC / lineage / audit)

### Slide 6 — Data Sources & Ingestion
- Batch vs streaming (MSK/Kinesis/S3 + triggers)
- Principio de ingesta según necesidad (responsiveness vs costo)

### Slide 7 — Medallion Architecture
- Bronze append-only (source of truth)
- Silver cleansing/conformance
- Gold business-ready (features, forecasts, metrics)

### Slide 8 — Unified Product Master
- Entity resolution: EAN/UPC exact → fuzzy description → manual exceptions
- SCD Type 2 para consistencia histórica

### Slide 9 — Forecasting Model Strategy
- Tres tiers: Statistical / ML / DL + Ensemble stacking
- Por qué no usar un único modelo (channel-specific patterns)

### Slide 10 — MLOps Pipeline
- Feature store → training → MLflow registry → batch scoring → monitoreo
- A/B champion/challenger

### Slide 11 — Governance & Compliance
- Unity Catalog, acceso por columnas, lineage, audit
- Enfoque LGPD/LFPDPPP y data residency

### Slide 12 — Compute & Cost
- Estrategias de compute (spot, scheduled windows, scale-to-zero)
- Por qué batch scoring reduce costo en forecasting semanal

### Slide 13 — Roadmap
- Fases 0-4 en 12 meses
- Primer valor (Month 7) y escalado a self-service (Phase 4)

### Slide 14 — Success Metrics
- WMAPE target
- Adoption, coverage, confiabilidad de pipelines

### Slide 15 — Team & Operating Model
- roles por fase y cómo se gestiona el trabajo

### Slide 16 — Risks
- complejidad SAP connectors
- adopción por planners

### Slide 17 — Change Management
- shadow mode → guided adoption → ownership

### Slide 18 — Summary & Next Steps
- recap y “ask” para iniciar Phase 0

## 6) Notas para NotebookLM (cómo usar este doc)
Sugerencia de tarea para NotebookLM (prompt):
- “Usa la sección ‘1) Qué output produce la plataforma’ y ‘4) KPIs’ para redactar una narrativa ejecutiva y luego convertirla en un guion de 10–12 diapositivas.”
- “Incluye definiciones y schemas (Gold tables) en un anexo o slide de detalle técnico.”

