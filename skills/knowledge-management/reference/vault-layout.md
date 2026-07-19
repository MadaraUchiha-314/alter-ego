# Vault layout

The vault is a directory of markdown files. Pointing Obsidian at `vault.path` must
always just work: no file depends on anything outside the vault root, links are
relative, front matter is plain YAML (Obsidian properties), tags are nested Obsidian
tags, mermaid is fine, HTML-only content is not.

```
<vault.path>/                      # default: knowledge/
├── schema.md                      # layer 3 — the vault's own conventions, self-describing
├── index.md                       # global catalog: every note, one line each
├── log.md                         # append-only operation chronicle
├── sources/                       # layer 1 — immutable provenance layer
│   ├── index.md                   # catalog of source records
│   ├── <source-id>.md             # source record (provenance metadata, see provenance.md)
│   └── <source-id>/               # optional raw capture (snapshot, export, transcript)
└── notes/                         # layer 2 — derived, LLM-maintained wiki
    ├── entities/                  # people, teams, systems, repos, services
    ├── topics/                    # thematic syntheses across entities/sources
    └── concepts/                  # ideas, terms, patterns, glossary entries
```

## The three layers (Karpathy consolidation)

1. **`sources/` — immutable.** Original material and its provenance records. Append
   and refresh only; never edit a raw capture. This is the source of truth the derived
   layer cites.
2. **`notes/` — derived.** Synthesized knowledge, freely maintained: updated, linked,
   refactored. Loses nothing permanently thanks to git; cites everything via
   `sources:`.
3. **`schema.md` — the contract.** The vault documents its own structure, note types,
   front-matter keys and conventions so *any* agent or human pointed at the vault can
   make sense of it without this skill installed. Seeded from `templates/schema.md`;
   changed only via reviewed decision (it is the vault's public interface).

## Placement rules

- One concept per file; the path is the concept's identity (OKF). Slug filenames:
  lowercase, hyphenated, no dates in note filenames (dates live in front matter).
- `entities/` vs `topics/` vs `concepts/` is judgement — `schema.md` records the
  choices made so they stay consistent. New subfolders (e.g. `entities/people/`) are
  allowed once a folder gets crowded; add an `index.md` to any folder you create
  (OKF: every directory is browsable via its index).
- `scratch/`, `.obsidian/` and other tool workspaces are ignored by this skill and
  belong in `.gitignore` where transient.
- Producer skills route their output *into* `sources/`-adjacent trees or their own
  homes (e.g. `raw/meetings/`); those trees are ingested as sources, not maintained
  as notes. The vault never becomes a dumping ground for un-derived files.

## Catalog and chronicle

- **`index.md`** — every note gets a row: relative link, `type`, one-line description,
  `updated` date. Updated on every ingest/consolidate. This is what gets read first on
  every query; keep rows to one line. Scaling tiers in `indexing.md`.
- **`log.md`** — append-only. One entry per operation:
  `## [YYYY-MM-DD] <operation> | <summary>` plus a short body listing files touched
  and why. Greppable (`grep "^## \[" log.md | tail -5`). History is never rewritten.
