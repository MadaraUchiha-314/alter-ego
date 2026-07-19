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
5. Routed tree is vault-pointable: pointing Obsidian at `raw/meetings/` (or a parent)
   just works; no links depending on files outside the tree.
6. Transcripts are immutable raw sources; artifacts are the derived layer, backlinked
   via `sourceTranscript`.
7. The effectiveness log is the append-only chronicle; never rewrite its history rows.
8. Routed artifacts are **immutable once routed** — the vault records them with
   `version: sha256:` markers; corrections are new routed content, not edits.

## Division of labor

The repo-level taxonomy (decision-012): `raw/` holds captured knowledge inputs (this
skill's artifacts under `raw/meetings/`), `knowledge/` holds only the vault's derived
layer, `docs/` stays for repo-development docs. This skill routes artifacts into
`raw/meetings/` by default — never into the vault's `notes/`; the vault ingests those
trees as *sources* and derives its own notes ("the vault never becomes a dumping ground
for un-derived files", `knowledge-management/reference/vault-layout.md`). Entity
resolution, indexing, staleness linting, and consolidation are the vault's job;
`context.md` (glossary/ownership changes) is our richest feed into its entity notes.

`knowledgeBase.path` in `meeting-artifacts.config.yaml` should point at the vault root
(the knowledge-management skill's `vault.path`, default `knowledge/`) — used to resolve
mentions during extraction and as the `context.md` routing target.
