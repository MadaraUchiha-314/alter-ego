# Decision 010: install caveman + ponytail; skill docs stay minimal

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

PR #4 review feedback: the skill docs were too verbose; token consumption matters
because SKILL.md's description loads into every session and its body on every trigger.

## Decision

1. Registered `caveman` (JuliusBrussee/caveman — output compression) and `ponytail`
   (DietrichGebert/ponytail — minimal-code philosophy) as marketplaces in
   `.claude/settings.json` and enabled both, mirroring the-loop's registration.
2. Compressed the skill per their philosophies: cut filler and justification prose,
   keep every normative rule, table, and technical term exact. Rationale lives in the
   issue and `docs/decisions/`, not repeated in skill instructions.

## Consequences

- Skill payload roughly halved; no behavioral rules removed.
- Future sessions in this repo load both plugins and keep output/code minimal by
  default.
- Density over hand-holding: contributors needing rationale follow the decision links.
