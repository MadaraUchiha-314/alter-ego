# Decision 008: skill templates stay internal; only derived artifacts are routed

- **Status:** accepted
- **Date:** 2026-07-17
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

PR #4 review feedback pointed at `MadaraUchiha-314/the-loop#36` as a cautionary
precedent: `the-loop` was copying its internal template library
(`.the-loop/templates/*.md`) into every repo it initialized, cluttering consuming repos
with blank boilerplate that should have stayed inside the plugin and been referenced, not
distributed. This repo's own `.the-loop/templates/` directory (from issue #1) is a live
example of exactly that footprint. The ask was to confirm `meeting-to-artifacts` doesn't
repeat the mistake.

## Decision

Confirmed and documented explicitly in `SKILL.md` step 4: `skills/meeting-to-artifacts/templates/*.md`
are read for structure when drafting an artifact, never copied verbatim into a target
repo. Only two kinds of content ever leave the skill directory:

1. **Routed, meeting-specific artifacts** (step 6) — the *filled-in* `summary.md`,
   `decisions.md`, etc. for a specific meeting, not the blank template.
2. **`meeting-artifacts.config.yaml`** — a one-time, per-project config file a repo
   deliberately opts into (documented in `config.example.yaml`), analogous to any other
   project config file (`.eslintrc`, `tsconfig.json`), not a bulk library of internal
   artifacts.

No code/schema change was needed — the skill's design already worked this way (`SKILL.md`
already said "use the templates... as the shape," never "copy the template file"); this
decision makes that intent explicit and auditable so it doesn't regress.

## Consequences

- Positive: a target repo adopting `meeting-to-artifacts` never accumulates unfilled
  template boilerplate the way `.the-loop/templates/` does today in this repo — its
  footprint is only the meeting artifacts it actually produced plus one config file.
- Negative: none identified; this is a confirmation of existing design, not a behavior
  change.

## Alternatives considered

- Shipping `templates/` into each consuming repo (e.g. under `docs/meetings/_templates/`)
  for local customization — rejected: this is exactly the pattern `the-loop#36` flags as a
  mistake. A repo wanting to customize a template's shape can fork/override the skill
  itself rather than the skill distributing copies into every adopter.
