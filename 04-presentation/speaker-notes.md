# Speaker Notes — Demand Forecasting Platform Presentation

## Timing Guide (30 minutes)

| Slide | Topic | Time | Cumulative |
|-------|-------|------|-----------|
| 1 | Title | 0:30 | 0:30 |
| 2 | Agenda | 0:30 | 1:00 |
| 3 | The Challenge | 2:00 | 3:00 |
| 4 | The Vision | 2:00 | 5:00 |
| 5 | Platform Architecture | 2:30 | 7:30 |
| 6 | Data Sources & Ingestion | 2:00 | 9:30 |
| 7 | Medallion Architecture | 2:30 | 12:00 |
| 8 | Unified Product Master | 2:00 | 14:00 |
| 9 | Forecasting Model Strategy | 3:00 | 17:00 |
| 10 | MLOps Pipeline | 2:00 | 19:00 |
| 11 | Governance & Compliance | 2:00 | 21:00 |
| 12 | Compute & Cost | 2:00 | 23:00 |
| 13 | Roadmap | 2:00 | 25:00 |
| 14 | KPIs | 1:30 | 26:30 |
| 15 | Team Structure | 1:00 | 27:30 |
| 16 | Risks | 1:00 | 28:30 |
| 17 | Change Management | 0:30 | 29:00 |
| 18 | Summary & Next Steps | 1:00 | 30:00 |

---

## Slide-by-Slide Notes

### Slide 1 — Title
- Brief introduction, thank the panel for their time
- Set expectations: "In the next 30 minutes, I'll walk you through our proposed architecture for a demand forecasting platform that serves all of adidas LAM — covering the technical design, the ML strategy, the execution plan, and the business outcomes we're targeting."

### Slide 2 — Agenda
- Quick scan, no need to read every item
- Mention: "I've structured this to start with the business problem, move into the technical solution, and close with how we execute and measure success."

### Slide 3 — The Challenge
**Key talking points:**
- "Today, demand forecasting in LAM is essentially a spreadsheet exercise. Each channel team does their own thing, with their own data, their own process."
- "We have 7+ source systems that don't talk to each other. The same shoe has a different ID in SAP, in our POS systems, in eCommerce, and in wholesale order books."
- "Our data is 2 to 5 days stale by the time it reaches planners. In a market where promotions and trends move fast, that's the difference between capturing demand and losing it."
- **For C-level:** "The cost of this: every percentage point of forecast inaccuracy translates directly into either stockouts — lost sales — or overstock — margin erosion through markdowns."
- **Transition:** "So what does better look like?"

### Slide 4 — The Vision
**Key talking points:**
- Walk through the "From → To" table, emphasizing the business outcomes, not the technology
- "We're targeting WMAPE below 20%, down from roughly 35-40% today. That's not just a number — for adidas LAM's volume, that translates to a meaningful reduction in safety stock requirements."
- "95% automated SKU coverage means planners spend their time on exceptions and judgment calls, not on manually forecasting thousands of SKUs in spreadsheets."
- **Transition:** "Let me show you how we build this."

### Slide 5 — Platform Architecture
**Key talking points:**
- "This is a Databricks Lakehouse on AWS. Think of it as: raw data comes in on the left, gets progressively refined through three layers, and ML-driven forecasts come out on the right."
- Point to the three layers: "Bronze is raw data, Silver is cleaned and unified, Gold is business-ready and feeds our ML models."
- "The governance spine at the bottom — Unity Catalog — provides access control, lineage, and audit across everything. This is how we stay compliant with LGPD and other LAM regulations."
- **For technical audience:** "We're using Delta Lake on S3 for all storage, MSK for streaming, and Delta Live Tables for pipeline orchestration."
- **Transition:** "Let me zoom into the data sources."

### Slide 6 — Data Sources & Ingestion
**Key talking points:**
- "We have 8 distinct source systems. The key design decision: streaming where responsiveness matters — POS and eCommerce — and batch where daily is sufficient — SAP, wholesale, franchise."
- "For SAP, we're using Fivetran rather than building custom connectors. SAP integration is notoriously complex; pre-built connectors reduce risk and save 4-6 weeks."
- "The total daily volume is roughly 260 million events across all sources. The platform needs to handle this at LAM scale."

### Slide 7 — Medallion Architecture
**Key talking points:**
- "Bronze is our safety net — raw, append-only, no transformations. If anything goes wrong downstream, we can always reprocess from Bronze."
- "Silver is where the hard work happens — especially the unified product master, which I'll detail next."
- "Gold is what the business sees — features for ML, forecast outputs, and BI-optimized views."
- **For technical audience:** "Delta Live Tables manages dependencies and quality gates between layers. If a Silver table fails quality checks, downstream Gold tables don't refresh — we don't propagate bad data."

### Slide 8 — Unified Product Master
**Key talking points:**
- "This is arguably the most critical component. Today, the same running shoe has a completely different identifier in every system we operate."
- "Our approach is three-tier entity resolution: first we match on universal barcodes — EAN/UPC — which catches about 70-80%. Then fuzzy matching on description, color, and size catches another 15-20%. The remaining exceptions go through a manual mapping process maintained by the Product Data team."
- "Target is >95% automated match rate. This unlocks the ability to see total demand for a product across eCommerce, retail, wholesale, and franchise — which is essential for accurate forecasting."
- **For C-level:** "Without this, we can't answer the basic question: how much demand is there for this product across all our channels?"

### Slide 9 — Forecasting Model Strategy
**Key talking points:**
- "We are NOT betting on a single model. Different demand patterns need different approaches."
- "eCommerce, with millions of daily signals and rich clickstream features, benefits from deep learning models that can capture complex temporal patterns."
- "Wholesale, with 50 large accounts and strong seasonal cycles, is better served by classical statistical methods like Prophet."
- "Retail, where promotions drive most variance, is a sweet spot for gradient-boosted trees that can explicitly model promotional uplift."
- "Franchise, with limited data visibility, relies on statistical methods with category-level priors — essentially borrowing strength from similar products."
- "The ensemble layer on top combines all three, optimized per channel and country. This is the same approach used by top Kaggle competitors and industry leaders in retail forecasting."
- **Anticipated question:** "Why start with simpler models?" → "Statistical baselines in Phase 2 give us an accuracy benchmark in weeks, not months. ML and DL come in Phase 2 and 3, and they need to prove they beat the baseline."

### Slide 10 — MLOps Pipeline
**Key talking points:**
- "This is the full lifecycle: features go in, trained models go into a registry with versioning, batch scoring produces weekly forecasts, and monitoring watches for drift."
- "Batch scoring is our primary pattern — demand forecasting is inherently a weekly cycle. We don't need real-time inference for this."
- "The monitoring loop is critical: if forecast accuracy degrades beyond a threshold, the system triggers automatic retraining. We don't wait for a planner to notice."
- "A/B testing — champion/challenger — means we never deploy a new model without evidence it's better than what's in production."

### Slide 11 — Governance & Compliance
**Key talking points:**
- "Unity Catalog is our governance backbone. It provides fine-grained access control — down to column level — which is essential for LGPD compliance."
- "For Brazil specifically: PII columns in clickstream and POS data are masked via dynamic views. The data never leaves sa-east-1 — São Paulo region."
- "For franchise partners who need access to forecast data: they see filtered views restricted to their own country and franchise, nothing else."
- "Full audit trail — every query, every access — logged for 90 days in Unity Catalog system tables."
- **For C-level:** "This isn't just a technical checkbox. LGPD fines can reach 2% of revenue. Our architecture makes compliance the default, not an afterthought."

### Slide 12 — Compute & Cost
**Key talking points:**
- "Total steady-state cost: $22K to $31K per month for the entire platform — Databricks and AWS combined."
- "Three key cost levers: Spot instances for 70% of compute — Databricks handles retries automatically. SQL Serverless for BI — pay only when analysts query. Model serving scales to zero when idle."
- "We don't start at steady state. Phase 0-1 is about 40% of this — roughly $9K to $12K per month."
- "Year 1 total infrastructure cost: approximately $300K to $380K, excluding team salaries."
- **Anticipated question:** "How does this compare to current costs?" → "We should compare not just the infrastructure cost, but the cost of inaccurate forecasting — stockouts and overstock — which this platform directly addresses."

### Slide 13 — Roadmap
**Key talking points:**
- "Four phases, 12 months to full maturity. But first value comes in Month 7."
- "Phase 0 is pure infrastructure — 2 months. We need this foundation before anything else."
- "Phase 1 builds the data platform: Bronze-to-Gold pipeline, unified product master. Focus on Brazil and Mexico first — they're the highest-volume markets with the most mature data."
- "Phase 2 is where business value starts: ML forecasts in production for Brazil eComm and Retail. This is Month 7."
- "Phase 3 extends to all four channels and introduces deep learning and ensemble models."
- "Phase 4 rolls out to all LAM countries and delivers the self-service portal for demand planners."
- "Phases overlap intentionally — we don't wait for one to fully complete before starting the next."

### Slide 14 — KPIs
**Key talking points:**
- "These are measurable, time-bound targets. Not aspirational — these are what we commit to."
- "WMAPE below 20% is achievable based on comparable implementations in retail. The current ~35-40% baseline gives us significant room for improvement."
- "80% planner adoption is the non-technical metric that matters most. A perfect model nobody uses delivers zero business value."

### Slide 15 — Team Structure
**Key talking points:**
- "10-12 people at steady state. We ramp up gradually — Phase 0 only needs 3-4 people."
- "Communication cadence: weekly for the engineering team, bi-weekly demos for product and commercial, monthly executive updates, quarterly business impact reviews."

### Slide 16 — Risks
**Key talking points:**
- "Our top risk is SAP connector complexity — SAP integration is always harder than expected. Mitigation: Fivetran's pre-built connector, and we engage the SAP Basis team in Week 1."
- "Adoption resistance is a real risk. Mitigation: 4-week shadow mode where ML runs alongside spreadsheets, and we show planners the accuracy comparison before asking them to switch."

### Slide 17 — Change Management
- Brief overview: shadow mode → guided adoption → full ownership
- "We don't force a switch. We prove the value first, then transition."

### Slide 18 — Summary & Next Steps
**Key talking points:**
- Reiterate three takeaways (unified lakehouse, hybrid ML, first value Month 7)
- "The ask today: approve Phase 0 kickoff. We need AWS account provisioning, SAP access, and team allocation to start in Week 1."
- "Thank you — I'm happy to take questions."

---

## Anticipated Q&A

### Q: "Why Databricks over Snowflake?"
**A:** "For a demand forecasting platform, the differentiator is ML capability. Databricks has native MLflow, Feature Store, GPU support, and model serving — all built in. Snowflake is excellent for BI and SQL analytics, but for an ML-heavy workload like forecasting, we'd need to bolt on SageMaker or another ML platform, creating integration complexity. Databricks gives us ETL, ML, and serving on one platform." *(Refer to Backup Slide 1)*

### Q: "Why not use SageMaker for ML?"
**A:** "SageMaker would add a second compute plane. Our data lives in Delta Lake on Databricks — moving it to SageMaker for training, then back for serving, adds latency, complexity, and cost. MLflow on Databricks gives us the same capabilities — experiment tracking, model registry, serving — with tighter integration. SageMaker's real-time endpoint strengths aren't our primary use case; we're doing weekly batch forecasting." *(Refer to Backup Slide 2)*

### Q: "The timeline seems aggressive — 12 months for the full platform?"
**A:** "Phase 0-2 — foundation through first ML forecasts — is conservative at 7 months. That's where we deliver first business value. Phases 3-4 are more ambitious, and we've built in overlap and contingency. If we need to adjust, we can extend Phase 4 without impacting the core value delivery in Phases 1-2. The key is: we're not building everything at once. Each phase is independently valuable."

### Q: "How do you handle new product introductions (NPI) with no history?"
**A:** "NPI is a Phase 3 deliverable. The approach is cold-start modeling: we use category-level demand priors — essentially, 'new running shoes in Brazil historically sell at this rate' — combined with product attribute similarity to find analogous products. As the product accumulates its own data (8-12 weeks), the model transitions from prior-based to data-driven. Target: MAPE below 30% for the first 8 weeks."

### Q: "What about cross-channel cannibalization?"
**A:** "Phase 3 introduces cross-channel features: channel mix share, cross-channel correlation, and promotion spillover indicators. For example, a 30% discount on adidas.com during a sale event will cannibalize retail store demand for the same products. The ensemble model captures this by including cross-channel demand features. We measure cannibalization impact and feed it into forecast reconciliation."

### Q: "How do you reconcile bottom-up forecasts with top-down financial targets?"
**A:** "Phase 4 delivers a reconciliation workflow. The ML models produce bottom-up forecasts at SKU level. Finance provides top-down targets at category/country level. The platform applies proportional adjustment to align them, with a planner override capability for exceptions. This is the last-mile integration that makes the platform operationally useful for financial planning."

### Q: "What's the cost compared to what we spend today?"
**A:** "Today's direct cost may be lower because the forecasting is done in spreadsheets with no infrastructure. But the total cost of ownership includes the cost of inaccuracy: stockouts, overstock, markdowns, and lost sales. A conservative estimate of 10-15% safety stock reduction across LAM, applied to current inventory carrying costs, should significantly exceed the ~$300K-$380K Year 1 platform investment."

### Q: "What happens if the models underperform?"
**A:** "Statistical baselines (Prophet, ETS) are our safety net — they're reliable, interpretable, and ship in Phase 2. ML and DL models must prove they beat the baseline in A/B testing before replacing it. We never deploy a worse model. If all ML approaches underperform, optimized statistical models still deliver value over spreadsheets — they just run automatically at scale, with proper features and quality data."

### Q: "How do you handle data quality issues?"
**A:** "Three layers of defense. First, Delta Live Tables Expectations at the Silver layer — built-in quality gates that block bad data from propagating. Second, monitoring dashboards that track completeness, freshness, and anomalies daily. Third, ML-specific monitoring — if input feature distributions shift (measured by PSI), we alert before the model produces bad forecasts. Data quality is not an afterthought; it's a first-class citizen in the architecture."

### Q: "What about real-time forecasting?"
**A:** "Demand forecasting doesn't need real-time — inventory and supply chain decisions operate on weekly/monthly cycles. We do ingest data in near real-time (5-minute micro-batch for POS and eCommerce), which means our Bronze layer is always current. But forecasting runs on a weekly cycle because that's how the business consumes it. Phase 4's on-demand model serving endpoints are for what-if scenarios, not for replacing the weekly forecast."

---

## Additional Technical Emphasis (for panel Q&A)

### Q: "How does this integrate with AWS services?"
**A:** "S3 is the storage backbone for raw-to-curated data, MSK/Kinesis handle streaming ingestion, and Lambda triggers event-driven processing when files/events arrive. This gives us a clear, decoupled ingestion pattern."

### Q: "What are cross-account and cross-region considerations for LAM?"
**A:** "Cross-account governs secure sharing between AWS accounts using IAM roles and bucket policies. Cross-region addresses data residency, latency, and disaster recovery. We keep sensitive data in-region where required and replicate only what is necessary."

### Q: "How do you design for scalability and fault tolerance?"
**A:** "Scalability comes from partitioned data models and parameterized pipelines by country/channel. Fault tolerance comes from checkpoints, retries, dead-letter handling, and reprocessing from Bronze as the source of truth."

### Q: "How do you control cost at scale?"
**A:** "We enforce cluster policies, use autoscaling and auto-termination, mix spot and on-demand strategically, and keep BI on SQL Serverless to pay by usage."

### Q: "Why separate ETL, ML training, and serving workloads?"
**A:** "Each workload has different performance and cost patterns. ETL runs on Jobs clusters, analytics on SQL Warehouses, training on dedicated ML compute, and inference on batch scoring plus Model Serving endpoints. Separation prevents resource contention and protects SLAs."
