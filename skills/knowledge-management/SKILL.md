---
name: knowledge-management
description: Maintain an Obsidian-compatible knowledge vault - ingest knowledge from anywhere (GitHub issues, Slack, Google Docs, meeting artifacts, existing notes), structure it as linked markdown notes with provenance, index it, and validate it for staleness. Use for "add this to my knowledge base", "ingest these docs/issues/threads", "what do we know about X", "check the vault for stale notes", "set up a knowledge vault".
---

# Knowledge Management

The knowledge **primitive** for alter-ego: one durable, Obsidian-compatible vault that
every other skill reads from and writes into. Knowledge scattered across GitHub issues,
Slack threads, Google Docs, meeting artifacts and personal notes gets compiled — once —
into a persistent, compounding wiki instead of being re-derived on every question.
Rationale: issue [#5](https://github.com/MadaraUchiha-314/alter-ego/issues/5).

Design lineage: Karpathy's LLM-wiki layering (immutable raw sources → LLM-maintained
derived notes → self-describing schema) consolidated with the Open Knowledge Format
(one concept per file, YAML front matter with `type`, relative markdown links,
`index.md` catalogs). See `docs/decisions/decision-001.md`.

## Config

`knowledge.config.yaml` at target repo root. Schema: `config.schema.json`; example +
defaults: `config.example.yaml`. Missing file → use defaults, tell the user; never
invent a vault location outside the current repo.

- `vault.path` — vault root (default `knowledge/`). Pointing Obsidian here must
  always just work.
- `sources` — registry of upstream systems knowledge is pulled from; interface
  `mcp` > `cli` > `api` (api needs a public `apiDocsUrl`). See `reference/ingestion.md`.
- `staleness` — per-type review TTLs and lint behaviour. See `reference/staleness.md`.
- `indexing` — index tier for the vault's current scale. See `reference/indexing.md`.

## The vault

Layout in `reference/vault-layout.md`; note format in `reference/note-format.md`.
Non-negotiables, everywhere, always:

1. **Two layers.** `sources/` is immutable raw material + provenance records — never
   edited, only appended. `notes/` is the derived layer — freely maintained, every
   claim traceable back to `sources/`.
2. **One concept per file**, YAML front matter on every file, `type` always present.
3. **Relative markdown links** that resolve on GitHub *and* in Obsidian. No
   `[[wikilinks]]`, no absolute paths, no links escaping the vault root.
4. **`index.md` is the catalog, `log.md` is the chronicle, `schema.md` is the
   contract.** Every operation updates the first two; only a reviewed decision changes
   the third.

## Operations

### init

No vault at `vault.path` → seed it from `templates/` (`schema.md`, `index.md`,
`log.md`, empty `sources/` + `notes/` trees). Read templates for structure; write
filled files. **Never copy a blank template into a target repo** — the seed files are
written with this vault's real name, date and config baked in.

### ingest

Input: anything — a URL, an issue number, a pasted thread, a file, a meeting-artifacts
tree, a whole existing Obsidian vault. Per-source-kind handling in
`reference/ingestion.md`.

1. **Capture** — create/refresh the source record (and raw capture when the origin is
   volatile) under `sources/` per `reference/provenance.md`. Pull via the configured
   `sources` interface; unconfigured or unreachable origin → say so and ask for a
   paste/path, never build one-off scraping.
2. **Check the index first** — does a note for this entity/topic already exist?
   Extend existing notes; creating a duplicate page is a lint error you caused.
3. **Derive** — create/update the affected notes (an ingest typically touches several:
   entities mentioned, the topic, cross-references). Every derived claim lists its
   source record in `sources:` front matter.
4. **Bookkeep** — update `index.md`, append one `log.md` entry.

Contradiction with an existing note → don't overwrite either side; record both with
their sources and flag per `reference/staleness.md`. The human resolves; you never
silently pick a winner.

### query

"What do we know about X": read `index.md` first, follow links to the relevant notes,
answer **with citations** (note links + their sources). If the answer required real
synthesis across notes, offer to file it back as a new note — that's the compounding
loop. If the vault can't answer, say so; don't pad from general knowledge without
labelling it as outside the vault.

### validate (staleness lint)

On request or configured cadence — full procedure in `reference/staleness.md`:

- **Pull**: notes past their type's TTL (or `review_after`) → `status: needs-review`.
- **Push**: re-check upstream version markers on source records; changed upstream →
  flag the source record and every note referencing it.
- **Graph**: orphan notes, dead links, missing citations, contradiction pairs.

Output is a review report + status flips + log entries. **Flag, never fix silently**:
content rewrites, supersedes and deletions happen only after human review.

### consolidate

Merge duplicate pages, split overgrown ones, promote a recurring inline concept to its
own note, tier up the index (`reference/indexing.md`). Propose the plan, get approval,
then execute — this is the one operation that may rewrite many notes at once, so it
always gets a review gate and a detailed log entry.

## Provenance — the short version

Full model in `reference/provenance.md`. Every note answers "says who?": front-matter
`sources:` → source records → origin system, canonical URL, retrieval time, version
marker, raw capture. Git history + `log.md` answer "who changed the derived layer and
when". A claim you cannot source gets `verification: unverified` — visible, not hidden.

## Boundaries

- This skill maintains knowledge; it never acts on it (no code, no tickets, no
  messages sent). Point a separate task at a note to act on it.
- Producer skills (e.g. `meeting-to-artifacts`) write compatible inputs; this skill
  owns the derived layer — entity pages, catalogs, consolidation, staleness. Ingesting
  their output must never require migrating it.
- The vault is a format, not a platform: plain files, no required tooling. Optional
  search/index tools plug in via config, and losing them must lose nothing.
