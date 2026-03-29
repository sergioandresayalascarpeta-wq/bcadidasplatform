# adidas LAM — Demand Forecasting Data Platform

Proposal deliverables for the adidas Latin America Demand Forecasting capability, built on **Databricks Lakehouse** (AWS) with the **Medallion Architecture** (Bronze/Silver/Gold).

## Executive Snapshot

- **Objective:** improve demand forecasting accuracy across LAM channels and countries.
- **Target business outcomes:** WMAPE below 20%, 10-15% safety stock reduction, 95%+ automated SKU coverage.
- **Primary recommendation:** Databricks Lakehouse on AWS, with governed Bronze/Silver/Gold data products and ML-driven forecasting.
- **Delivery horizon:** 12-month roadmap with first production value in Month 7.

## Start Here (For Panel / Recruiters)

1. Read the 2-page proposal: [`02-technical-proposal/technical-proposal-2page.md`](02-technical-proposal/technical-proposal-2page.md)
2. Review architecture views: [`01-architecture/`](01-architecture/)
3. Open the presentation deck: [`04-presentation/presentation.md`](04-presentation/presentation.md)
4. Use Q&A prep for defense: [`06-sustentacion/guia-sustentacion-qa.md`](06-sustentacion/guia-sustentacion-qa.md)

## Deliverables — Official Submission

| # | Deliverable | Path | Notes |
|---|------------|------|-------|
| 1 | Architecture Diagrams | [`01-architecture/`](01-architecture/) | Mermaid diagrams (5 views) |
| 2 | **Technical Proposal (2 pages)** | [`02-technical-proposal/technical-proposal-2page.md`](02-technical-proposal/technical-proposal-2page.md) | ⭐ Submit this — covers all 5 areas |
| 3 | Execution Roadmap | [`03-roadmap/roadmap.md`](03-roadmap/roadmap.md) | Gantt + phase detail |
| 4 | Presentation (18 slides) | [`04-presentation/presentation.md`](04-presentation/presentation.md) | Marp format, 30 min |

## Supporting Materials (Backup & Study)

| # | Document | Path | Purpose |
|---|---------|------|---------|
| 5 | Technical Proposal (full detail) | [`02-technical-proposal/technical-proposal.md`](02-technical-proposal/technical-proposal.md) | Deep technical backup for Q&A |
| 6 | Speaker Notes | [`04-presentation/speaker-notes.md`](04-presentation/speaker-notes.md) | Timing + talking points per slide |
| 7 | Q&A Preparation Guide (30 questions) | [`06-sustentacion/guia-sustentacion-qa.md`](06-sustentacion/guia-sustentacion-qa.md) | ⭐ Most important for sustentación |
| 8 | ROI / Business Case | [`06-sustentacion/roi-business-case.md`](06-sustentacion/roi-business-case.md) | Industry benchmarks + financial model |
| 9 | Technical Flashcards | [`05-study/technical-qa-flashcards.md`](05-study/technical-qa-flashcards.md) | Quick study reference |
| 10 | NotebookLM Input | [`notebooklm-output-and-presentation.md`](notebooklm-output-and-presentation.md) | For NotebookLM podcast/study |

## Scope

- **Channels:** eCommerce (B2C), Retail / Own Stores (B2C), Wholesale (B2B), Franchise (B2B)
- **Countries:** Brazil, Mexico, Argentina, Colombia, Chile, Peru
- **Platform:** Databricks Lakehouse on AWS
- **Architecture:** Medallion (Bronze / Silver / Gold)

## Rendering

- **Diagrams:** Any Mermaid renderer — VS Code extension, [mermaid.live](https://mermaid.live), or GitHub native rendering
- **Presentation:** Install [Marp CLI](https://marp.app/) and run:
  ```bash
  marp 04-presentation/presentation.md --pdf
  ```
- All documents render natively on GitHub
