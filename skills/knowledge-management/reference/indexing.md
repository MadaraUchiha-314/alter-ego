# Indexing

"Knowledge needs to be indexed" scales in tiers. Start at tier 1; `consolidate`
proposes tiering up when the current tier strains. The config records the current tier
(`indexing.tier`) so every operation knows what to maintain. Losing any optional
tooling must lose nothing — the markdown indexes are always the source of truth.

## Tier 1 — `single-index` (default, < ~100 notes)

One global `index.md`: every note, one row (link, `type`, one-line description,
`updated`). Every query reads it first; every ingest/consolidate updates it. Plain
`grep`/read is the search engine. No infrastructure.

## Tier 2 — `per-folder` (~100–1000 notes)

The global `index.md` becomes an index of indexes: one row per folder + the highest-
traffic notes. Each folder (`entities/`, `topics/`, `concepts/`, and any subfolder)
carries its own `index.md` cataloging its files (the OKF browsable-directory
property). Queries read global → folder → note. Ingests update the folder index and,
when the note is index-worthy at the top, the global one.

## Tier 3 — `search-tool` (1000+ notes, optional at any tier)

A local search tool over the vault (configured as `indexing.searchTool`, interface
`cli` or `mcp` — e.g. a SQLite FTS/embedding indexer). The tool accelerates *finding*;
the markdown indexes remain canonical and maintained — the tool's index can always be
rebuilt from the files, never vice versa. Front matter is the structured query surface
(Dataview in Obsidian, `grep`/`yq` in shells) at every tier.

## Index hygiene

- A note absent from its index is an orphan (graph lint catches it).
- Rows are one line; descriptions come from the note's `description` key — divergence
  is a lint finding.
- The index is a *catalog*, not a summary document: no prose sections beyond a short
  header explaining what the vault is.
