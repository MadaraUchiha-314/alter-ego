# Decision 005: meeting-to-artifacts is a human-reviewed, pluggable-routing skill

- **Status:** accepted
- **Date:** 2026-07-17
- **Deciders:** @MadaraUchiha-314 (issue author), implemented per issue #2
- **Work item:** issue-2

## Context

Issue #2 asks for a `meeting-to-artifacts` skill that turns meeting transcripts into
durable artifacts (decisions, requirements, tasks, open questions, risks, disagreements,
design/ADR, summary, context updates), optionally chains into requirements → design →
implementation, and tracks meeting effectiveness. Two design questions were called out
explicitly as needing a decision rather than a single opinionated default: (1) how much
of transcript ingestion and the review gate should live in the skill itself vs. be left
to whatever integrations the user has, and (2) where "durable storage" should default to.

## Decision

1. **The skill never writes a drafted artifact to its final destination without an
   explicit human approval step.** Transcripts capture what was said, not always what was
   agreed (sarcasm, thinking-out-loud, reversed positions) — automating past that point
   would pollute a decision log with noise indistinguishable from signal.
2. **Ingestion (pulling the raw transcript) is explicitly left to whatever
   integration/MCP/file the user already has** — the skill documents the expectation but
   does not build or assume a specific meeting-platform integration.
3. **Storage is fully pluggable per artifact type**, configured in
   `meeting-artifacts.config.yaml` (schema: `skills/meeting-to-artifacts/config.schema.json`)
   with four destination kinds: `repo-path`, `decision-log`, `issue-tracker`,
   `decision-tracking-system`. The default (documented in `reference/routing.md`) is
   per-project `docs/meetings/<date>-<slug>/` for most artifact types, and this repo's
   existing `docs/decisions/decision-<nnn>.md` convention for decisions specifically —
   rather than a dedicated separate meeting-artifacts repo — because a repo that already
   has a decisions/spec convention (e.g. one using `the-loop`) should not get a second,
   competing one.
4. **`design.md`/architecture artifacts drafted from a meeting use ADR format** (context /
   decision / consequences / alternatives), matching this repo's own `docs/decisions/`
   convention, per the issue's explicit suggestion to adopt ADR outright.

## Consequences

- Positive: no meeting transcript can silently become a "decision" without a human
  looking at it first; a repo already running `the-loop` gets a consistent single
  decision/spec convention instead of two; the skill works standalone in any repo since
  it defines its own config/schema rather than depending on `the-loop` being installed.
- Negative: routing configuration has one more moving part (`meeting-artifacts.config.yaml`)
  that a new adopting repo must set up (or accept the documented defaults for); the human
  review step means nothing is fully automated end-to-end, by design.

## Alternatives considered

- Auto-committing extracted artifacts straight to their destination — rejected: the issue
  itself calls out that transcripts need a human review pass before being treated as
  final, and a decision log with unreviewed noise in it is worse than no decision log.
- A single hardcoded destination (e.g. always a dedicated `meeting-artifacts` repo) —
  rejected: the issue explicitly flags this as needing to be configurable rather than a
  single opinionated default, since teams already running a per-project decisions/specs
  convention shouldn't get a second, competing one.
- Building the transcript-ingestion integration inside the skill (e.g. a specific
  meeting-platform API client) — rejected as premature: it couples the skill to one
  platform and duplicates whatever MCP/CLI integration the user may already have.
