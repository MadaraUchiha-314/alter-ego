# Decision 003: Staleness is detected by machines and resolved by humans

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314
- **Work item:** issue-5

## Context

Issue #5's second hard question: "How do we deal with data sources changing, and how
do we keep updating our data?" Two failure modes bound the design space: a vault that
silently rewrites itself when upstreams change cannot be trusted as a record, and a
vault that never re-checks anything rots into confident wrongness.

## Decision

Split detection from repair. Detection is automatic and twofold: **pull** (per-type
TTLs on `updated`, overridable via `review_after`) and **push** (diffing recorded
upstream `version` markers against live origins, then propagating `needs-review`
transitively along the `sources:` dependency edges), plus structural graph lint
(orphans, dead links, uncited claims, duplicates, unresolved contradictions). Repair
is human-gated: detectors only flip `status` to `needs-review` and emit a review
report; rewrites, supersedes and deletions happen after approval, and supersession
keeps the predecessor (`superseded_by` link, never delete). Contradictions between
sources are recorded as content — both positions, both sources — never auto-resolved.
Full procedure: `skills/knowledge-management/reference/staleness.md`.

## Consequences

- The trust boundary is legible: `status`/`verification` say exactly what a machine
  suspects vs. what a human has confirmed, per note.
- Staleness handling costs periodic human review time; bulk-approval keeps it small,
  and reversal data ("flagged but confirmed current") feeds back into TTL tuning.
- Paste/file-origin knowledge only ages out by TTL — the report says so explicitly
  rather than pretending those corners are checked.

## Alternatives considered

- Auto-refresh derived notes when upstreams change — silent rewrites poison the
  record and can launder upstream vandalism into "knowledge"; rejected.
- Periodic full re-derivation from sources — discards human edits and synthesis, the
  most valuable layer; rejected.
- TTLs only (no upstream checks) — misses the actual event the issue asks about
  (sources changing); kept only as the fallback where no live origin exists.
