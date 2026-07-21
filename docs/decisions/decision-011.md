# Decision 011: knowledge and code stay separate; no the-loop coupling

- **Status:** accepted — supersedes the the-loop-alignment and chaining aspects of
  decisions 005/009-era docs
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

PR #4 review feedback on the chaining doc: "I don't want any 'code' to be written in the
same place as where we are maintaining knowledge. I can always point claude/cursor
towards a knowledge base entity and ask it to start working on it. Let's not connect
the-loop with this right now. the-loop should only be used to build alter-ego and all its
tools." A sibling comment also asked to generalize the provider naming, since the
input-source pattern isn't meeting-specific.

## Decision

1. **`meeting-to-artifacts` ends at knowledge artifacts.** The
   requirements→design→implementation chaining feature is removed, along with every
   the-loop integration point (kiro-3-phase handoff, `docs/specs/<id>/` routing,
   `relatedWorkItem`, "the-loop integration" routing rules). Acting on an artifact is a
   separate task the user initiates by pointing an agent at it, in the code repo, with
   that repo's own workflow. `the-loop` is reserved for building alter-ego itself.
2. **`meetingProvider` → `provider` (`name` + `interface`)**, and
   `reference/meeting-providers.md` → `reference/providers.md`: the provider pattern is
   the general shape for any input source, not just meeting platforms.
3. Kept: ADR-format decision routing (`decision-log` style — an industry convention
   issue #2 endorses, not a the-loop dependency), the pre-read loop, and the
   downstream-conversion metric (now measured passively via downstream work referencing
   artifacts, rather than driven by the skill).

## Consequences

- A clean boundary: knowledge tooling can evolve (with issue #5) without entangling the
  development workflow, and vice versa. The skill got smaller.
- Downstream conversion is now only observable when downstream work links back
  voluntarily; the skill no longer creates that link itself. Accepted trade.
- `config.schema.json` key rename (`meetingProvider` → `provider`) is pre-merge, so no
  migration concern.

## Alternatives considered

- Keeping chaining as an opt-in flag — rejected: the boundary is the point; an opt-in
  reintroduces the coupling and the "code where knowledge lives" risk.
- Keeping the-loop handoff only for this repo — rejected: the-loop's scope here is
  building alter-ego, and meeting knowledge for other projects should never route
  through it.
