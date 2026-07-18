# Decision 004: The vault is the shared knowledge primitive; connectors and search stay pluggable

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314
- **Work item:** issue-5

## Context

The issue thread prioritizes knowledge management as the primitive to land **before**
other skills, with in-flight work (PR #4's meeting-to-artifacts, which already
declares an issue-5-compatible contract) rebasing onto it. Knowledge arrives from
arbitrary systems (GitHub, Slack, Google Docs, meeting artifacts, existing note
folders), and vaults will eventually outgrow a single index file.

## Decision

The vault contract (decisions 001–003) is alter-ego's knowledge primitive: producer
skills write compatible inputs and this skill alone owns the derived layer — entity
pages, catalogs, consolidation, staleness — so ingesting a compliant producer's output
never requires migration. Upstream connectors use the plugin's one interface story,
**MCP > CLI > documented public API** (api only with a public `apiDocsUrl`), with
paste/file as the universal fallback and one-off scraping forbidden. Indexing scales
in declared tiers (`single-index` → `per-folder` → optional `search-tool`); optional
search tooling only accelerates retrieval — the markdown indexes remain canonical and
fully reconstructible from the files.

## Consequences

- New knowledge origins and search tools plug in via config, not schema or format
  changes; losing any tool loses nothing.
- PR #4 rebases onto this with its contract intact (its `reference/knowledge-base-compat.md`
  division of labor is exactly this decision from the producer side); its decision
  records renumber after 001–004.
- Producer skills are constrained: they may not grow their own entity pages or
  catalogs, which keeps one derived layer instead of several drifting ones.

## Alternatives considered

- Each skill maintaining its own knowledge store — N drifting mini-wikis and no
  cross-source consolidation, the exact problem the issue describes; rejected.
- Building the meeting skill first and extracting the primitive later — the thread
  explicitly chose primitive-first to avoid rework; rejected.
- Hardcoding GitHub/Slack/Google connectors into the skill — repeats per-origin code
  where per-origin *guidance* (`reference/ingestion.md`) plus a generic interface
  story suffices; rejected.
