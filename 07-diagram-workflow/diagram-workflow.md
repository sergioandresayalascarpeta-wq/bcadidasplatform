# Diagram Workflow (Mermaid + draw.io + Interactive View)

This project uses:
- **Mermaid in Markdown** as the single source of truth
- **draw.io (diagrams.net)** for executive visual versions
- **Mermaid Chart** for interactive exploration

## 1) Source of Truth Rule

Always update Mermaid-first.

- Canonical files:
  - `01-architecture/architecture-diagram.md`
  - `01-architecture/data-flow-detail.md`
  - `01-architecture/infrastructure-diagram.md`
- Any visual file in draw.io must be derived from the Mermaid canonical version.

If Mermaid and draw.io differ, Mermaid wins.

## 2) Folder and Naming Convention

Use this structure:

```text
07-diagram-workflow/
├─ source/          # Optional extracted Mermaid snippets (if needed)
├─ drawio/          # Editable draw.io files (.drawio)
├─ exports/         # PNG/SVG/PDF exports for slides/docs
└─ diagram-workflow.md
```

File naming:
- Mermaid source file (existing): `architecture-diagram.md`
- draw.io editable: `architecture-overview.v1.drawio`
- export image: `architecture-overview.v1.png`

Versioning format:
- `v1`, `v2`, `v3` for meaningful visual revisions.
- Increment version when layout/meaning changes (not tiny cosmetic fixes).

## 3) Update Flow (Required Sequence)

1. **Edit Mermaid source** in `01-architecture/*.md`
2. Validate Mermaid render (GitHub, VS Code Mermaid, or mermaid.live)
3. Update corresponding `.drawio` visual
4. Export PNG/SVG for presentation
5. Add short changelog note in commit message (or PR description)

Suggested commit message examples:
- `docs: update mermaid data flow for franchise feed`
- `docs: refresh drawio architecture overview v2`
- `docs: export updated infra diagram for presentation`

## 4) Mapping Table (Mermaid -> draw.io -> Export)

Keep this mapping updated:

| Mermaid Source | draw.io Editable | Slide/Usage Export |
|---|---|---|
| `01-architecture/architecture-diagram.md` | `07-diagram-workflow/drawio/architecture-overview.v1.drawio` | `07-diagram-workflow/exports/architecture-overview.v1.png` |
| `01-architecture/data-flow-detail.md` | `07-diagram-workflow/drawio/data-flow.v1.drawio` | `07-diagram-workflow/exports/data-flow.v1.png` |
| `01-architecture/infrastructure-diagram.md` | `07-diagram-workflow/drawio/infrastructure.v1.drawio` | `07-diagram-workflow/exports/infrastructure.v1.png` |

## 5) Interactive Visualization for Data Flow Markdown

Recommended tool: **Mermaid Chart**  
URL: <https://www.mermaidchart.com>

With **Mermaid Chart Pro** you get team workspaces, private projects, and stronger collaboration on the same diagrams tied to your Markdown source. Use Pro to:

- Sync or paste diagrams from this repo and keep interactive versions for reviews.
- Comment and iterate without editing the canonical `.md` until you are ready to merge changes back.

How to use with this repo:
1. Copy Mermaid blocks from:
   - `01-architecture/architecture-diagram.md`
   - `01-architecture/data-flow-detail.md` (flow blocks)
2. Paste into Mermaid Chart
3. Use interactive navigation (zoom/pan/comments)
4. Share links for review sessions

## 6) Quality Checklist Before Presentation

- Mermaid renders without syntax errors
- draw.io visual matches Mermaid semantics
- Exports are readable in projector mode
- Titles and labels are consistent across diagrams
- Version suffix (`vN`) is consistent in draw.io + export files

