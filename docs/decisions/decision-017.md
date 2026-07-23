# Decision 017: `raw/` is verbatim capture only — sources persisted at Ingest, extractions default to `knowledge/meetings/`

- **Status:** accepted — amends decision-012's reading of `raw/` ("captured inputs"
  included extracted artifacts; it no longer does)
- **Date:** 2026-07-22
- **Deciders:** @MadaraUchiha-314 (issue #13 retro)
- **Work item:** issue-13

## Context

The meeting pipeline's first real runs exposed an inversion (issue #13): extracted
artifacts (summaries, decisions, tasks) were written into `raw/`, while the verbatim
sources (transcripts, provider AI summaries) were never persisted at all — only linked
by URL, living in ephemeral tool output that a scratchpad purge nearly destroyed. The
user's model is the opposite: `raw/` = verbatim capture, `knowledge/` = extractions.
Decision-012's "`raw/` for captured inputs" used "raw" in the pipeline sense (input to
the next stage); humans read the directory name as "verbatim". The layer contract
("transcripts are immutable raw sources") existed only on paper — no step materialized
the raw layer. And the routing defaults ran without real consent: no config existed,
and "missing config → defaults + notify" is weak consent for a structural decision.
The review gate showed artifact content but not the resulting tree, so the layout
objection could only surface after commit.

## Decision

1. **`raw/` holds verbatim capture only.** Extracted meeting artifacts default to
   `knowledge/meetings/{date}-{slug}/` (with the effectiveness log and radar's
   processed-sources ledger at `knowledge/meetings/`), and are no longer documented as
   "captured inputs". Directory names are an interface — `raw/` will always be read as
   verbatim.
2. **Verbatim sources are persisted at Ingest**, before any drafting, via a
   first-class `storage.rawSources` destination (default `raw/meetings/{date}-{slug}/`;
   stable filenames `transcript.md`, `provider-summary.md`, `agenda.md`). Persist
   evidence first, derive second.
3. **`sourceTranscript` is a repo-relative path** to the persisted source; a URL is a
   fallback only when persistence failed.
4. **The review gate shows the resulting file tree** — every path about to be written —
   not just artifact content.
5. **Layout is an explicit choice**: `alter-ego:init` asks the taxonomy question and
   writes the answer into config; `meeting-to-artifacts` with no config confirms the
   layout before its first route instead of silently applying defaults.
6. **Consumers follow config paths**: knowledge-management ingestion and meeting-radar
   dedup locate the artifact tree from `meeting-artifacts.config.yaml`, never a
   hardcoded `raw/meetings/`.
7. **Handoff payloads are durable only once persisted**: meeting-radar's handoff record
   is transport, and a handoff completes only when the receiver has written the source
   file; the ledger row records that path.
8. **`alter-ego:upgrade` ships the migration** for repos on the old default
   (`skills/upgrade/reference/layout-migration.md`): move artifacts, backfill sources,
   rewrite links, update configs — review-gated.

## Consequences

- The tree now matches the human reading: `raw/` verbatim, `knowledge/` derived
  (vault notes *and* meeting extractions), `docs/` repo-development docs.
- Extraction is auditable: every artifact backlinks a durable source file rather than
  a URL that may rot or an ephemeral tool output.
- Repos already routed on the old default need the upgrade migration; the config
  schema gains `storage.rawSources` and new path defaults (a breaking default change).
- Structural defaults across the plugin now require explicit consent, not
  "default + notify".

## Alternatives considered

- **Keep artifacts in `raw/` and rename the directory** (e.g. `pipeline/`) — rejected:
  renaming dodges the real defect (sources were never persisted) and still leaves
  extractions posing as captures.
- **Persist sources into the vault's `sources/`** — rejected: producers writing into
  the vault violates the division of labor (decision-004); the vault ingests producer
  trees, it doesn't receive writes from them.
- **Keep "defaults + notify" for routing** — rejected: the retro's root cause;
  structural decisions get asked, not defaulted.
