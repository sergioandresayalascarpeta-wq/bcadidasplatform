# Speaker Notes — Demand Forecasting Platform Presentation
## adidas LAM | Director of Data Engineering Use Case

---

## Timing Guide (30 minutes total)

| Slide | Topic | Time | Cumulative |
|-------|-------|------|-----------|
| 1 | Title | 0:30 | 0:30 |
| 2 | Agenda | 0:30 | 1:00 |
| 3 | The Challenge | 2:30 | 3:30 |
| 4 | The Vision — Three Modules | 2:30 | 6:00 |
| 5 | Platform Architecture | 2:30 | 8:30 |
| 6 | Data Sources + Consumer Intelligence | 2:30 | 11:00 |
| 7 | Medallion Architecture | 2:00 | 13:00 |
| 8 | Module 1 — MLOps Studio | 2:00 | 15:00 |
| 9 | Module 2 — Scenario Planner | 2:30 | 17:30 |
| 10 | Module 3 — Executive Dashboard | 1:30 | 19:00 |
| 11 | Forecasting Model Strategy | 2:30 | 21:30 |
| 12 | Data Governance & Compliance | 2:00 | 23:30 |
| 13 | Compute & Cost | 1:30 | 25:00 |
| 14 | Execution Roadmap | 2:00 | 27:00 |
| 15 | Success Metrics | 1:30 | 28:30 |
| 16 | Team & Risks | 1:00 | 29:30 |
| 17 | Q&A | 0:30 | 30:00 |

---

## Slide-by-Slide Notes

### Slide 1 — Title
- Brief intro. Thank the panel.
- Opening: *"In the next 30 minutes I'll walk you through a demand forecasting platform for adidas LAM — the architecture, the ML strategy, the three user modules that make this usable by everyone from Data Scientists to the CEO, and how we measure success in business terms."*
- 30 seconds max.

---

### Slide 2 — Agenda
- Do not read the 10 items. Instead:
- *"I've structured this to start with the business problem, then the platform vision, then go deep on each of the three user modules — because how a platform is used is just as important as how it's built — and close with execution plan and metrics."*
- Emphasis: "three user modules" — this differentiates the proposal.

---

### Slide 3 — The Challenge
**Key talking points:**
- *"Today, demand forecasting in LAM is a spreadsheet exercise. Each channel does their own thing, with their own data, their own process, and their own version of the truth."*
- *"7+ source systems that don't speak to each other. The same shoe has a different ID in SAP, in POS, in eCommerce, and in wholesale order books."*
- *"Data is 2 to 5 days stale by the time it reaches planners. In a market where trends move in hours, that's the difference between capturing demand and losing it."*
- **For C-level:** *"The cost isn't just inaccuracy — it's speed. By the time we detect a demand shift, plan a response, and execute — the window of opportunity has already closed."*

**Transition:** *"So what does better look like? Three modules — one platform."*

---

### Slide 4 — The Vision — Three Modules
**Most differentiating slide. Take your time.**

- *"What I'm proposing is not a single dashboard that tries to serve everyone. That fails because a Data Scientist and a CEO don't have the same questions, context, or time budget."*
- Walk each module:
  - *"Module 1, MLOps Studio — Data Scientists own production. No model enters or exits production without their explicit action. They are the arbiters of model quality."*
  - *"Module 2, Scenario Planner — Category Managers run what-if simulations. They see the top-3 models ranked by the Data Scientists, configure market scenarios, select the forecast that fits their domain knowledge."*
  - *"Module 3, Executive Dashboard — C-Level tracks business KPIs: Forecast-to-Plan Gap, Revenue at Risk, Market Reaction Speed. Weekly. No statistical jargon on this screen."*
- *"Each module has a clear owner, a clear decision, and a clear outcome. That's how this platform gets adopted."*

**Transition:** *"Let me show you the architecture that powers all three."*

---

### Slide 5 — Platform Architecture
**Key talking points:**
- *"Databricks Lakehouse on AWS sa-east-1, Sao Paulo. Everything — ETL, feature engineering, ML training, serving — on one platform. No multi-cloud complexity, no data copying between systems."*
- Walk top to bottom:
  - *"Source Systems — 8 domains, including a new layer: Consumer Intelligence."*
  - *"Ingestion — streaming via MSK and Kinesis for POS and eCommerce, batch for SAP, Wholesale, Franchise."*
  - *"Medallion layers — Bronze raw, Silver cleansed, Gold business-ready."*
  - *"ML Platform — Feature Store, MLflow Registry, batch scoring, on-demand serving for the Scenario Planner API."*
  - *"At the top, the three user modules."*
- *"Unity Catalog at the bottom: lineage, access control, compliance audit across every asset."*

**For technical audience:** *"Delta Live Tables manages pipeline execution with declarative quality gates. If Silver fails validation, Gold doesn't refresh. We don't propagate bad data."*

---

### Slide 6 — Data Sources — Consumer Intelligence
**Key talking points:**
- Walk the table briefly: SAP, POS, eCommerce, Wholesale, Franchise, External.
- Pause on Consumer Intelligence:
  - *"Google Trends, social listening — Brandwatch, Sprinklr — and AI chatbot query patterns. What people are searching and asking about right now."*
  - *"These signals surface demand shifts 2 to 8 weeks before they appear in a sales transaction. If searches for 'running shoes Colombia' spike and social sentiment around a category turns positive, we know 6 weeks before the POS confirms it."*
  - *"For NPI forecasting — new products with zero sales history — this is the primary signal. It initializes cold-start forecasts when we have no transactional data."*
- **Anticipated — data quality risk:** *"We treat these as leading indicators with controlled weight in the ensemble, not primary drivers. Freshness monitoring in MLOps Studio. Multi-provider strategy to avoid single-API dependency."*

---

### Slide 7 — Medallion Architecture
**Key talking points:**
- *"Bronze: append-only, no transformations. Safety net. If anything breaks downstream, we reprocess from Bronze."*
- *"Silver: the hard work. Especially the Unified Product Master — entity resolution across all systems. EAN/UPC match catches 70-80%, fuzzy match another 15-20%, manual mapping for the rest. Target: >95% automated. Without this, cross-channel aggregation is impossible."*
- *"Gold: Feature Store with 20+ features, forecast outputs with prediction intervals, analytics views tuned to each of the three modules."*
- *"Consumer Intelligence lands in bronze.consumer_intel — same governance, same lineage, same quality gates as every other domain."*

---

### Slide 8 — Module 1 — MLOps Studio
**Key talking points:**
- *"Two views: Production Monitor — live WMAPE dashboards, drift alerts, retraining history — and Challenger Lab — experiment registration, A/B test management, model promotion."*
- **Most important point:** *"Data Scientists are the sole arbiters of what enters production. No model changes without their explicit MLflow Registry action. This removes the black-box problem — demand planners trust the forecasts because they know who is accountable."*
- *"What MLOps Studio surfaces to Module 2: the top-3 production models per SKU x channel x country. Those become the options in the Scenario Planner."*

---

### Slide 9 — Module 2 — Scenario Planner
**Key talking points:**
- *"Designed for adoption. Category Managers need no ML expertise. They pick context — SKU, channel, country — and see three models already ranked by the Data Scientists."*
- Walk the 4 steps: context, model view, what-if parameters, forecast selection.
- *"What-if scenarios cover what category managers actually think about: promo discounts, competitor events, macro shocks, seasonal multipliers."*
- **Key design choice:** *"Category Managers retain decision authority. They pick the forecast, they export to SAP IBP. The platform enhances their judgment — it doesn't replace it. That's why adoption friction is low."*
- *"Consumer Intelligence signals are most visible here — if Google Trends for a category is surging, it shows in the forecast confidence intervals and model rankings."*

---

### Slide 10 — Module 3 — Executive Dashboard
**Key talking points:**
- *"Designed for someone who has 10 minutes a week and needs to know whether the platform is delivering business value."*
- Walk the KPI table:
  - *"Forecast-to-Plan Gap: the delta between ML forecast and the financial plan. If it widens, the business plan is diverging from what the data says — early warning."*
  - *"Revenue at Risk: projected stockout exposure in dollar terms by country and channel."*
  - *"Market Reaction Speed: days from signal detection to operational response. Today 2-4 weeks. Target: under 3 days."*
- **Key phrase to memorize:** *"There is no WMAPE on the Executive Dashboard. WMAPE is a Data Scientist metric. Executives track revenue, cost, and speed."*

---

### Slide 11 — Forecasting Model Strategy
**Key talking points:**
- *"Not betting on one model family. Different demand patterns need different approaches."*
- Three tiers:
  - *"Statistical — Prophet, ETS — for Wholesale: seasonal, interpretable, fast. 50 large accounts with strong cycles."*
  - *"ML — LightGBM, XGBoost — for Retail: promo-driven demand, rich features, explainable for commercial review."*
  - *"Deep Learning — TFT, N-BEATS — for eCommerce: millions of daily signals, complex temporal patterns."*
- *"Ensemble stacks all three. Weights optimized per channel-country. A/B testing validates any new model beats the champion before production."*
- **For technical:** *"Expanding window cross-validation — not random split. Time series has temporal dependency. Random split leaks future data into training."*
- **Anticipated:** *"Why start with statistical if deep learning is better?"* → *"Statistical baselines give us WMAPE benchmark in weeks. DL comes in Phase 3 and must beat the baseline — otherwise we add complexity for nothing."*

---

### Slide 12 — Data Governance & Compliance
**Key talking points:**
- *"Unity Catalog: single metastore across all workspaces. Column-level and row-level access control."*
- RBAC by module: *"Data Scientists: write access to ML artifacts. Category Managers: read access to forecast top-3 and the what-if API. Executives: read-only on KPI views."*
- Compliance: *"Three frameworks in LAM: LGPD Brazil — data localization, consent logging. LFPDPPP Mexico — privacy notice, ARCO rights. Argentina Ley 25.326 — habeas data, cross-border transfer controls."*
- *"Implementation: column-level PII masking via Unity Catalog dynamic views, 90-day audit logs, data subject rights via Delta MERGE with full lineage."*

---

### Slide 13 — Compute & Cost
**Key talking points:**
- *"Two cost levers: 70% Spot instances for batch — saves 60-70% vs on-demand — and scale-to-zero for model serving."*
- *"Steady state: $22K-$31K/month. Phase 0-1 is about 40% of that."*
- **For CFO:** *"Year 1 infrastructure: $250K-$370K. ROI model in backup slides — payback in year 2 is weeks, not months."*

---

### Slide 14 — Execution Roadmap
**Key talking points:**
- *"Four phases, twelve months, each with a named module delivery."*
- *"Phase 0: AWS, Databricks, Unity Catalog, CI/CD. Foundation."*
- *"Phase 1: Bronze-to-Gold for Brazil and Mexico. First deliverable: the Unified Product Master — first time adidas LAM has a single SKU view across all channels."*
- *"Phase 2: ML in production + MLOps Studio live. Month 7: Data Scientists have their module. First business value."*
- *"Phase 3: Scenario Planner live. Category Managers have what-if simulation. Consumer Intelligence integrated."*
- *"Phase 4: Executive Dashboard live. Full LAM. All three modules operational."*
- **Emphasis:** *"First value at month 7 — not month 12."*

---

### Slide 15 — Success Metrics
**Key talking points:**
- *"Two-layer KPI structure — deliberate."*
- Business KPIs: *"Inventory Opportunity Cost, Market Reaction Speed under 3 days, Forecast-to-Plan Gap, Revenue at Risk, Analyst Automation Rate. All in business language."*
- Technical KPIs: *"WMAPE, coverage, latency. The engine metrics."*
- **Key phrase:** *"WMAPE is an engineering metric. Revenue at Risk reduction is a business outcome. This platform speaks both languages."*
- On Analyst Automation Rate: *"Today under 5% of forecast volume is generated automatically. Everything else is manual. Target: 80%+ automated — planners focus on exceptions and judgment calls."*

---

### Slide 16 — Team & Risks
**Focus on Risks:**
- Lead with Risk #3 (adoption): *"Highest risk on any data platform is not technical — it's adoption. Our mitigation: 4-week shadow mode. ML forecasts run in parallel with existing process. Planners compare accuracy before committing. The Scenario Planner keeps users in control — adoption friction is low."*
- Risk #1 (SAP): *"Fivetran pre-built SAP connector, not custom BAPI. Removes 4-6 weeks of delivery risk from Phase 1."*
- Risk #5 (Consumer Intelligence): *"Multi-provider strategy. If one API goes down, we degrade gracefully without breaking the core forecast."*

---

### Closing — Q&A Setup
*"I'll stop there. Happy to go deeper on any part — architecture decisions, model strategy, compliance implementation, or the business case. What would be most useful for the panel?"*

Backup slides ready: Why Databricks vs Snowflake, Why not SageMaker, Cost by phase, Technology comparison matrix.

---

## Key Phrases to Memorize

| Situation | Phrase |
|-----------|--------|
| Opening | *"From reactive planning to proactive demand intelligence"* |
| On three modules | *"One platform, three experiences — the CEO and the Data Scientist don't have the same questions"* |
| On Consumer Intelligence | *"Surfaces demand shifts 2 to 8 weeks before they appear in a sales transaction"* |
| On MLOps Studio | *"Data Scientists are the sole arbiters. No black box."* |
| On Scenario Planner | *"Enhances judgment — doesn't replace it. That's why adoption is high."* |
| On Executive Dashboard | *"There is no WMAPE on the Executive Dashboard."* |
| On KPIs | *"WMAPE is an engineering metric. Revenue at Risk is a business outcome."* |
| On timeline | *"First value at month 7 — not month 12."* |
| On cost | *"$22K-$31K/month. Payback in year 2 measured in weeks."* |
| If you don't know a LAM number | *"I don't have that figure, but here's the model — we apply it together with the real data."* |
