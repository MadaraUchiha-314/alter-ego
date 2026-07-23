# Decision Log

Index of architecture/process decisions for alter-ego. Each entry links a detailed
record (`decision-<nnn>.md`). Newest first.

| # | Title | Status | Date |
|---|-------|--------|------|
| [018](./decision-018.md) | the-loop is mandatory for all work on this repo | accepted | 2026-07-22 |
| [017](./decision-017.md) | `raw/` is verbatim capture only — sources persisted at Ingest, extractions default to `knowledge/meetings/` | accepted | 2026-07-22 |
| [016](./decision-016.md) | automate plugin versioning with semantic-release, enforced at PR time with commitlint | accepted | 2026-07-21 |
| [015](./decision-015.md) | meeting-radar is a discovery-only pipe from email/calendar into meeting-to-artifacts | accepted | 2026-07-21 |
| [014](./decision-014.md) | plugin lifecycle skills — `alter-ego:init` seeds, `alter-ego:upgrade` reconciles | accepted | 2026-07-21 |
| [013](./decision-013.md) | no meeting artifact defaults into `docs/` — decisions included | accepted | 2026-07-19 |
| [012](./decision-012.md) | `raw/` for captured inputs, `knowledge/` for derived — not `docs/` | accepted — carve-out superseded by 013; artifact default amended by 017 | 2026-07-19 |
| [011](./decision-011.md) | knowledge and code stay separate; no the-loop coupling | accepted | 2026-07-18 |
| [010](./decision-010.md) | install caveman + ponytail; skill docs stay minimal | accepted | 2026-07-18 |
| [009](./decision-009.md) | meeting artifacts follow an Obsidian-compatible knowledge-base contract | accepted | 2026-07-17 |
| [008](./decision-008.md) | skill templates stay internal; only derived artifacts are routed | accepted | 2026-07-17 |
| [007](./decision-007.md) | `meetingProvider.provider` is free-form, not a fixed enum | accepted | 2026-07-17 |
| [006](./decision-006.md) | meeting-to-artifacts scopes ingest to Zoom, prefers MCP/CLI over raw API | accepted — point 1 superseded by 007 | 2026-07-17 |
| [005](./decision-005.md) | meeting-to-artifacts is a human-reviewed, pluggable-routing skill | accepted | 2026-07-17 |
| [004](./decision-004.md) | The vault is the shared knowledge primitive; connectors and search stay pluggable | accepted | 2026-07-18 |
| [003](./decision-003.md) | Staleness is detected by machines and resolved by humans | accepted | 2026-07-18 |
| [002](./decision-002.md) | Two-layer vault — immutable source records under `sources/`, derived notes under `notes/` | accepted | 2026-07-18 |
| [001](./decision-001.md) | One knowledge format — Obsidian-compatible markdown with OKF-style front matter | accepted | 2026-07-18 |
