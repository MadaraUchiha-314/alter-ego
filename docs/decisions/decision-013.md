# Decision 013: no meeting artifact defaults into `docs/` — decisions included

- **Status:** accepted — supersedes decision-012's `docs/decisions/` carve-out for
  meeting-extracted decisions
- **Date:** 2026-07-19
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

Decision-012 kept one exception to the `raw/`-for-inputs rule: meeting-extracted
decisions defaulted into a repo's `docs/decisions/` ADR log, reasoning they're project
decisions rather than minutes. Review feedback rejected the exception: in a repo where
this plugin manages knowledge, `docs/` belongs to that repo's own development docs,
which the owner wants kept fully separate from the knowledge trees — "nothing should
ideally go into docs."

## Decision

`decisions.md` defaults to `raw/meetings/{date}-{slug}/decisions.md` like every other
artifact. ADR-style routing (`filesystem-git` + `style: decision-log`) remains available
but is **opt-in only** and must name its own `dir` — the schema no longer defaults it to
`docs/decisions`. The skill never writes into a target repo's `docs/` unless the config
explicitly says to.

## Consequences

- The taxonomy is now exception-free: `raw/` = captured inputs, `knowledge/` = the
  vault's derived layer, `docs/` = untouched by this skill. Simpler to state, simpler to
  audit.
- Decision knowledge still reaches durable, queryable form: the vault ingests
  `raw/meetings/` and derives decision notes; a repo that wants ADRs additionally can
  opt in per config.

## Alternatives considered

- Keeping the ADR default only when the target repo already has `docs/decisions/` —
  rejected: still writes into `docs/` uninvited; presence of a folder isn't consent.
- Dropping `style: decision-log` entirely — rejected: it costs nothing as an opt-in and
  issue #2 explicitly endorses the ADR format for repos that want it.
