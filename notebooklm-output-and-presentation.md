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

### Business KPIs (primarios — visibles en Executive Dashboard)

| KPI | Baseline | Target 12 meses |
|-----|----------|----------------|
| Inventory Opportunity Cost Reduction | Baseline TBD | **10–15% reducción** (stockout + overstock) |
| Market Reaction Speed | 2–4 semanas (ciclo manual) | **< 3 días** (señal → decisión automatizada) |
| Forecast-to-Plan Gap | ~35–40% desviación | **< 15% desviación** |
| Revenue at Risk (eventos de stockout) | Baseline TBD | **20% reducción** |
| Analyst Automation Rate | < 5% del volumen automatizado | **80%+ automatizado** (planners en excepciones) |

### Technical KPIs (soporte — visibles en MLOps Studio)

| KPI | Baseline | Target 12 meses |
|-----|----------|----------------|
| Forecast accuracy (WMAPE) | ~35–40% (spreadsheet) | **< 20%** |
| SKU automated coverage | ~20% | **95%+** |
| Data latency (pipeline) | T+2 a T+5 | **< 10 min (streaming)** |
| Pipeline reliability | N/A | **99.5% uptime** |

> **Nota clave:** WMAPE es un KPI de ingeniería visible para Data Scientists. Revenue at Risk y Market Reaction Speed son los outcomes de negocio. La plataforma habla los dos lenguajes — pero nunca los mezcla en la misma audiencia.

### Consumer Intelligence — KPI de ventaja temporal
- Detecta cambios de demanda **2 a 8 semanas antes** que los datos transaccionales (POS/eCommerce)
- Fuente: Google Trends (`category_trend` feature), Social Listening (Brandwatch/Sprinklr), AI Chatbot query patterns
- Uso principal: NPI cold-start forecasting — cuando no hay historial transaccional

## 5) Blueprint de presentación (17 slides — deck actual)

Este es el esqueleto del deck de sustentación para el Director of Data Engineering use case. Cada slide tiene un mensaje principal, un diferenciador y una transición.

### Slide 1 — Título
- **Mensaje:** “From reactive planning to proactive demand intelligence”
- Databricks Lakehouse · adidas LAM · March 2026

### Slide 2 — Agenda
- Challenge → Vision (tres módulos) → Architecture → Data Sources → Medallion → Module 1 MLOps Studio → Module 2 Scenario Planner → Module 3 Executive Dashboard → Forecasting Strategy → Governance → Compute & Cost → Roadmap → Success Metrics → Team & Risks

### Slide 3 — The Challenge
- 7+ source systems sin interoperabilidad, el mismo SKU tiene ID diferente en SAP, POS, eCommerce
- Datos con 2–5 días de latencia; tendencias de demanda se mueven en horas
- Planificación por planillas: cada canal tiene su propia versión de la verdad

### Slide 4 — The Vision — Tres Módulos *(más diferenciador)*
- **Diferenciador clave:** no un dashboard único — tres experiencias para tres personas distintas
- Module 1 — MLOps Studio: Data Scientists → árbitros únicos de calidad de modelos
- Module 2 — Scenario Planner: Category Managers → what-if sin expertise en ML
- Module 3 — Executive Dashboard: C-Level → KPIs de negocio, sin WMAPE

### Slide 5 — Platform Architecture
- Databricks Lakehouse en AWS sa-east-1 (São Paulo) — todo en una plataforma
- Flujo: Source Systems (8) → Ingestion (MSK/Kinesis/S3) → Medallion (Bronze/Silver/Gold) → ML Platform → Tres Módulos
- Governance spine: Unity Catalog, lineage, RBAC por módulo, audit logs 90d

### Slide 6 — Data Sources + Consumer Intelligence *(diferenciador)*
- 7 fuentes estándar + **Consumer Intelligence Layer** (nueva)
- Google Trends, Social Listening (Brandwatch/Sprinklr), AI Chatbot query signals
- Ventaja: 2–8 semanas de adelanto sobre datos transaccionales
- Uso crítico: NPI cold-start (productos sin historial)

### Slide 7 — Medallion Architecture
- Bronze: append-only, reprocess safety net — `consumer_intel.*` misma gobernanza
- Silver: trabajo duro → Unified Product Master (EAN match → fuzzy → manual, >95% automático)
- Gold: Feature Store 20+ features, outputs con intervalos de predicción, vistas por módulo

### Slide 8 — Module 1 — MLOps Studio *(Data Scientists)*
- Production Monitor: WMAPE dashboards, drift alerts, retraining history
- Challenger Lab: experiment registration, A/B test, model promotion
- **Punto más importante:** Data Scientists = únicos árbitros. Sin acción explícita en MLflow Registry, nada entra a producción

### Slide 9 — Module 2 — Scenario Planner *(Category Managers)*
- 4 pasos: contexto → top-3 models (rankeados por Data Scientists) → what-if params → forecast selection
- What-if: promo discount %, competitor event, macro shock, seasonal multiplier
- Diseño clave: usuarios retienen autoridad de decisión → adopción alta, fricción baja

### Slide 10 — Module 3 — Executive Dashboard *(C-Level)*
- Forecast-to-Plan Gap (delta ML vs plan financiero)
- Revenue at Risk (exposición stockout en USD por país/canal)
- Market Reaction Speed (días desde señal hasta respuesta operativa)
- **Regla de diseño:** cero WMAPE en esta pantalla

### Slide 11 — Forecasting Model Strategy
- Statistical (Prophet, ETS): Wholesale — estacional, interpretable, rápido
- ML (LightGBM, XGBoost): Retail — promo-driven, features ricos
- Deep Learning (TFT, N-BEATS): eCommerce — millones de señales, patrones temporales complejos
- Ensemble: pesos optimizados por channel-country, A/B validation ante cualquier cambio

### Slide 12 — Data Governance & Compliance
- Unity Catalog: metastore único, column-level + row-level access
- RBAC por módulo: Data Scientists (write ML artifacts), Category Managers (read top-3 + what-if API), Executives (read-only KPI views)
- LGPD (Brasil) · LFPDPPP (México) · Ley 25.326 (Argentina)

### Slide 13 — Compute & Cost
- 70% Spot instances para batch → ahorro 60–70% vs on-demand
- Scale-to-zero para model serving
- Steady state: $22K–$31K/mes. Año 1: $250K–$370K infra. Payback año 2 en semanas

### Slide 14 — Execution Roadmap
- Phase 0 (Mes 1–2): AWS + Databricks + Unity Catalog + CI/CD
- Phase 1 (Mes 2–5): Bronze→Gold Brasil + México. Entregable: Unified Product Master
- Phase 2 (Mes 4–7): ML producción + **MLOps Studio live** → **primer valor de negocio mes 7**
- Phase 3 (Mes 6–10): Consumer Intelligence + **Scenario Planner live**
- Phase 4 (Mes 9–12): Full LAM + **Executive Dashboard live**

### Slide 15 — Success Metrics
- Business KPIs (5): Inventory Cost, Market Speed, Plan Gap, Revenue at Risk, Automation Rate
- Technical KPIs (4): WMAPE, Coverage, Latency, Reliability
- Frase clave: “WMAPE is an engineering metric. Revenue at Risk is a business outcome.”

### Slide 16 — Team & Risks
- Risk más alto: adopción → mitigación: 4-week shadow mode + Scenario Planner mantiene control al usuario
- Risk SAP: Fivetran pre-built connector → elimina 4–6 semanas de riesgo en Phase 1
- Risk Consumer Intel: multi-provider → degradación graceful sin romper forecast core

### Slide 17 — Q&A
- Cierre: “Happy to go deeper on architecture decisions, model strategy, compliance, or the business case.”
- Backup slides: Why Databricks vs Snowflake, Why not SageMaker, Cost by phase, Tech comparison matrix

## 6) Notas para NotebookLM (prompts recomendados)

Usa estos prompts en NotebookLM con este documento y `04-presentation/presentation.md` como fuentes:

- **Para narrativa ejecutiva:** “Usa las secciones ‘4) KPIs’ y ‘5) Blueprint slide 10 y 15’ para redactar un resumen ejecutivo de 1 página del valor de negocio de la plataforma. Enfócate en los 5 Business KPIs, no en métricas técnicas.”
- **Para preparar Q&A técnico:** “Lista las 10 preguntas técnicas más difíciles que podría hacer un panel de ingeniería senior sobre esta arquitectura, y dame respuestas cortas de 3 líneas máximo para cada una.”
- **Para los tres módulos:** “Explica en lenguaje simple por qué la plataforma tiene tres módulos separados en lugar de un solo dashboard, y qué problema de adopción resuelve ese diseño.”
- **Para Consumer Intelligence:** “Resume el propósito, las fuentes de datos, la ventaja temporal y los riesgos de la Consumer Intelligence Layer en 5 bullets de máximo 2 líneas.”
- **Para el roadmap:** “¿En qué mes se entrega el primer valor de negocio y qué entregable concreto lo representa? ¿Cómo se justifica esa decisión de secuenciación?”

