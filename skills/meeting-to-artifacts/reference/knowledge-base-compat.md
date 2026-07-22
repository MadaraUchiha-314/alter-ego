# Knowledge-base compatibility

Routed artifacts are a first-class ingest origin (`meeting-artifact`) for the
`knowledge-management` skill (`skills/knowledge-management/`), which maintains the
Obsidian-compatible vault (default `knowledge/`; layers: immutable `sources/` → derived
`notes/` → self-describing `schema.md`). Its `reference/ingestion.md` ingests our
artifacts **without migration**, citing exactly this contract — breaking it breaks that
pipeline (decision-009; vault side: decisions 001–004).

## The contract

1. Plain markdown, one artifact per file. Mermaid OK; no HTML-only content.
2. YAML front matter on every file. Required: `type`, `meeting`, `date` (`YYYY-MM-DD`),
   `status`, `tags`; plus `series`/`attendees`/`sourceTranscript` where applicable.
   Key names are a public interface — renaming is a breaking change.
3. `tags: [meeting/<artifact-type>]` — nested Obsidian tags, one `meeting` tree.
4. Cross-artifact links: relative markdown links that resolve on GitHub **and** in a
   vault. No `[[wikilinks]]`, no absolute paths.
5. Routed tree is vault-pointable: pointing Obsidian at `knowledge/meetings/` (or a
   parent) just works; no links depending on files outside the tree.
6. Transcripts (and provider summaries/agendas) are immutable raw sources, **persisted
   at Ingest** under `storage.rawSources` (default `raw/meetings/`); artifacts are the
   derived layer, backlinked via `sourceTranscript` as a repo-relative path to the
   persisted file (URL only when persistence failed) — issue #13.
7. The effectiveness log is the append-only chronicle; never rewrite its history rows.
8. Routed artifacts are **immutable once routed** — the vault records them with
   `version: sha256:` markers; corrections are new routed content, not edits.

## Division of labor

The repo-level taxonomy (decision-012 as amended by decision-017): `raw/` holds
**verbatim capture only** (transcripts, provider summaries, agendas — persisted at
Ingest), `knowledge/` holds extractions — this skill's artifacts under
`knowledge/meetings/`, the vault's own derived layer under its `notes/` — and `docs/`
stays for repo-development docs. This skill routes artifacts into
`knowledge/meetings/` by default — never into `raw/` (extractions are not captured
inputs) and never into the vault's `notes/`; the vault ingests the artifact tree as
*sources* and derives its own notes ("the vault never becomes a dumping ground
for un-derived files", `knowledge-management/reference/vault-layout.md`). Entity
resolution, indexing, staleness linting, and consolidation are the vault's job;
`context.md` (glossary/ownership changes) is our richest feed into its entity notes.

`knowledgeBase.path` in `meeting-artifacts.config.yaml` should point at the vault root
(the knowledge-management skill's `vault.path`, default `knowledge/`) — used to resolve
mentions during extraction and as the `context.md` routing target.
