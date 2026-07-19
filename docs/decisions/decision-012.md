# Decision 012: `raw/` for captured inputs, `knowledge/` for derived — not `docs/`

- **Status:** accepted — supersedes the `docs/meetings/` default named in decisions
  005/009
- **Date:** 2026-07-19
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

PR #4 review asked whether `docs/meetings/` is the right default home for routed
meeting artifacts, proposing `raw/meetings/` with `knowledge/` reserved for derived
content. The vault design already distinguishes producer trees (ingested as sources)
from the derived `notes/` layer, but the old default buried that raw layer inside
`docs/`, mixing captured knowledge inputs with repo-development docs.

## Decision

Three top-level homes, by role:

- `raw/` — captured knowledge inputs. Meeting artifacts default to
  `raw/meetings/{date}-{slug}/`, with the effectiveness log at
  `raw/meetings/effectiveness-log.md`. Future producer skills follow the same shape
  (`raw/<source-kind>/...`).
- `knowledge/` — the vault only (derived notes, source records, indexes), per
  decisions 001–004.
- `docs/` — repo-development docs (decisions, capabilities, architecture, specs).
  Meeting-extracted decisions still route to a repo's `docs/decisions/` ADR log by
  default because they are project decisions, not merely meeting minutes — overridable
  per artifact like every other destination.

Paths remain fully configurable; only the defaults changed.

## Consequences

- The Karpathy/vault layering is visible in the tree itself: raw → derived reads off
  the folder names, and pointing Obsidian at `raw/` or `knowledge/` each yields a
  coherent view.
- Pre-merge default change only; no migration (nothing routed yet anywhere).

## Alternatives considered

- Keeping `docs/meetings/` — rejected: conflates captured inputs with repo-development
  docs, exactly the ambiguity the review comment called out.
- Routing artifacts into `knowledge/sources/` directly — rejected: the vault owns its
  tree and ingests producer output; producers writing into the vault violates the
  division of labor in decision-004.
