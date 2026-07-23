---
type: tasks
phase: tasks-breakdown
workItem: "issue-13"
status: in-review
approvedBy: []
overrides: {}
---

# Tasks: retro — extracted artifacts routed to `raw/`, verbatim sources never persisted

> Phase 3 of 3 (requirements → design → tasks). A DAG of implementation tasks derived
> from the approved design. MUST be reviewed/approved before implementation begins.

> **Retroactive spec.** Backfilled onto PR
> [#14](https://github.com/MadaraUchiha-314/alter-ego/pull/14); tasks are recorded as
> executed. TDD's red→green invariant does not apply — this plugin is markdown +
> JSON schema with no executable code; each task's check is the mechanical validation
> that proves it instead.

## Task list

- [x] 1. meeting-to-artifacts config: add `storage.rawSources`, move artifact +
      `effectivenessLog` defaults to `knowledge/meetings/` (schema + example)
  - _Depends on:_ none
  - _Requirements:_ R1, R3
  - _Check:_ `config.schema.json` parses; `config.example.yaml` parses and matches the schema's defaults
- [x] 2. meeting-to-artifacts SKILL + references: persist-first Ingest, tree preview
      at the review gate, missing-config consent, new routing defaults,
      `sourceTranscript` = repo-relative path (SKILL, `routing.md`,
      `knowledge-base-compat.md`, templates)
  - _Depends on:_ 1
  - _Requirements:_ R1, R2, R4, R5
  - _Check:_ grep — no extraction destination under `raw/` remains in the skill's docs/templates
- [x] 3. knowledge-management: ingestion locates the artifact tree via producer
      config; `vault-layout.md` reflects the amended taxonomy
  - _Depends on:_ 1
  - _Requirements:_ R6
  - _Check:_ grep — no hardcoded `raw/meetings` artifact path in `ingestion.md`/`vault-layout.md`
- [x] 4. meeting-radar: handoff-as-transport (payload persisted by receiver, path in
      ledger row), dedup + `processedLog` follow configured paths (SKILL,
      `handoff.md`, handoff-record template, schema + example)
  - _Depends on:_ 1
  - _Requirements:_ R6, R7
  - _Check:_ `config.schema.json` + `config.example.yaml` parse; grep as above
- [x] 5. init: taxonomy question in the config-offer step; detection recognizes new +
      legacy trees
  - _Depends on:_ 1
  - _Requirements:_ R5
  - _Check:_ review — step 3 asks before writing layout into config
- [x] 6. upgrade: `reference/layout-migration.md` (move, backfill, rewrite, update
      configs) wired into plan/migrate steps
  - _Depends on:_ 1, 2
  - _Requirements:_ R8
  - _Check:_ review — migration is staged and review-gated, nothing destructive
- [x] 7. docs: decision-017 (+ index, decision-012 status), capability-doc behaviour
      bullets + history rows (×4), learning-001
  - _Depends on:_ 2, 3, 4, 5, 6
  - _Requirements:_ all (documentation)
  - _Check:_ decision index row links resolve; history rows cite issue #13

## Dependency graph (DAG)

`1 → {2, 3, 4, 5} → 6 → 7` (6 also depends on 2; 7 closes over all).

## Checkpoints

One checkpoint after task 7 (the whole change is one reviewed commit on PR #14):
JSON/YAML parse validation ran clean, and the final `raw/meetings` grep showed only
legitimate references (verbatim-source layer, legacy-migration mentions, historical
decisions 005–016).
