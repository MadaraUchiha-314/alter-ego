# Decision 009: meeting artifacts follow an Obsidian-compatible knowledge-base contract

- **Status:** accepted
- **Date:** 2026-07-17
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4, forward-compatible with issue-5

## Context

Issue #5 plans a knowledge-management skill: knowledge from many sources — GitHub
issues, Slack, Google Docs, Obsidian, and explicitly "meeting artifacts created by #4" —
indexed, structured, staleness-validated, and stored so the knowledge folder can be
pointed at as an Obsidian vault, taking inspiration from Karpathy's LLM-wiki pattern
(immutable raw sources → an LLM-maintained markdown wiki layer → index/log files with
YAML front matter). PR #4 review feedback asked that this skill's artifacts not be
incompatible with that plan.

## Decision

`meeting-to-artifacts` guarantees a compatibility contract, codified in
`skills/meeting-to-artifacts/reference/knowledge-base-compat.md` and enforced at drafting
(SKILL.md step 4) and routing (step 6):

1. Plain markdown only (mermaid allowed — Obsidian renders it), one artifact per file.
2. YAML front matter on every artifact with stable, queryable keys (`type`, `meeting`,
   `date`, `status`, `tags`, plus `series`/`attendees`/`sourceTranscript` where
   applicable). Renaming a key is a breaking change.
3. Nested Obsidian tags under one namespace: `tags: [meeting/<artifact-type>]`, added to
   every template.
4. Cross-artifact links are relative markdown links that resolve both on GitHub and
   inside a vault.
5. The routed `docs/meetings/` tree is self-contained and vault-pointable.
6. Transcripts are immutable raw sources; artifacts are the derived layer, backlinked
   via `sourceTranscript` — matching the LLM-wiki layering.
7. The effectiveness log is the append-only, parseable chronicle (the `log.md` role).

Division of labor: this skill produces compatible inputs; issue #5's skill owns the wiki
layer on top (entity pages, `index.md` catalogs, cross-source consolidation, staleness
linting). The `date`/`status`/`sourceTranscript` metadata is what makes that staleness
validation possible, which is why the front-matter requirement is mandatory.

## Consequences

- Positive: when issue #5 lands, every meeting artifact ever produced is already
  ingestible — no migration pass. The artifacts are usable in Obsidian today, before #5
  exists. The contract doubles as a spec input for #5's design.
- Negative: front-matter keys are now a public interface — renaming one requires a
  coordinated change with the knowledge-base skill once it exists.

## Alternatives considered

- Building the indexing/wiki layer inside this skill now — rejected: that's issue #5's
  scope; duplicating it here would create the same competing-conventions problem
  decision-005 avoided for decision logs.
- Obsidian `[[wikilinks]]` for cross-artifact links — rejected: they don't resolve on
  GitHub, where these artifacts are also read/reviewed; relative markdown links work in
  both renderers.
- Deferring compatibility until #5 is designed — rejected: retrofitting front matter and
  link conventions across accumulated artifacts is exactly the migration this contract
  makes unnecessary, and the cost of adopting it now is near zero.
