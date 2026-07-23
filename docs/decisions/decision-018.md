# Decision 018: the-loop is mandatory for all work on this repo

- **Status:** accepted
- **Date:** 2026-07-22
- **Deciders:** @MadaraUchiha-314 (PR #14 review comment)
- **Work item:** issue-13 / PR #14

## Context

PR #14 (the issue #13 retro fixes) was implemented directly from the issue: no
`requirements.md`, no `design.md`, no `tasks.md`, even though the repo has the-loop
fully configured (`.the-loop/config.yaml`, `workflow.specApproach: kiro-3-phase`,
`specDir: docs/specs` — which was empty). The owner asked on the PR why the-loop was
not used and whether it can be mandated for any task on this repo. Nothing made the
workflow binding: the config existed, but no instruction told an agent entering the
repo to use it.

## Decision

1. **the-loop's kiro-3-phase workflow is mandatory for every work item on this
   repo**: requirements → design → tasks under `docs/specs/<work-item>/`, each phase
   human-reviewed before the next, then implementation per the approved tasks DAG.
2. **The mandate lives in a repo-root `CLAUDE.md`** — the file agent harnesses load
   automatically every session — so it binds by default rather than by memory.
3. **A PR without its spec artifacts is incomplete.** Work that shipped without them
   (as PR #14 did) gets the spec backfilled onto the PR before merge, marked as
   retroactive.
4. **Scope stays per decision-011**: the-loop governs building alter-ego itself; the
   alter-ego skills remain independent of the-loop when running in target repos.

## Consequences

- Process is discoverable and enforced at the entry point, not dependent on an agent
  knowing the repo's habits; `docs/specs/` starts materializing (first entry:
  `docs/specs/issue-13/`, backfilled).
- Every work item pays the three-phase spec cost — intended: the same retro showed
  what skipping explicit gates costs.
- Enforcement is instructional (CLAUDE.md), not mechanical; a CI gate checking PRs
  for spec artifacts is possible later if drift shows up (same posture as
  decision-016's deferred contract-drift check).

## Alternatives considered

- **Social convention only** (status quo) — rejected: it just failed; PR #14 shipped
  spec-less with the config sitting right there.
- **CI gate requiring `docs/specs/<id>/` per PR** — deferred: mechanical enforcement
  of a semantic judgment, same reasoning as decision-016's deferred drift check;
  revisit if the CLAUDE.md mandate proves insufficient.
- **Mandate inside `.the-loop/config.yaml`** — rejected as the sole home: the-loop
  reads it once entered, but the gap was agents never entering the-loop at all;
  CLAUDE.md is what every session loads.
