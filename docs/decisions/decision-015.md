# Decision 015: meeting-radar is a discovery-only pipe from email/calendar into meeting-to-artifacts

- **Status:** accepted
- **Date:** 2026-07-21
- **Deciders:** @MadaraUchiha-314 (issue #10)
- **Work item:** issue-10

## Context

Meetings get recorded and summarized by tools that deliver their output over email — Zoom
"recording is ready" notices, Google Meet/Teams links, notetaker digests from Fireflies,
Otter, and the like — and the corresponding events live on a calendar. Today
`meeting-to-artifacts` can turn one of those into knowledge, but only once a human notices
the mail and hand-feeds it the link or transcript. Issue #10 asks for a skill that looks up
email and calendar for meetings and any recording link or summary, "acting as a pipe to the
meeting-to-artifact skill so that knowledge can be updated."

The open question was scope: should this new skill also extract the artifacts, or store
them, since it already has the raw material in hand?

## Decision

Add a `meeting-radar` skill that is **discovery and handoff only**. It scans the configured
calendar and mailbox, detects and correlates meeting recordings/summaries into one candidate
per occurrence, dedups against a ledger, and — after a human review gate — hands each
approved candidate to `meeting-to-artifacts` at that skill's existing Ingest step. It does
**not** extract summaries/decisions/tasks (that stays with `meeting-to-artifacts`, behind
its own review gate) and does **not** write to the vault (that stays with
`knowledge-management`).

It reuses, rather than reinvents, the plugin's existing patterns: the MCP > CLI > API
interface model with a free-form, harness-interpreted source name (decisions 006/007), the
templates-stay-internal rule (decision-008), and the knowledge/code boundary (decision-011).
Because it reads a personal mailbox, it is **metadata-first** (full bodies opened only to
extract a link from an already-matched candidate) and **never forwards, sends, or quotes
email outward**; its dedup ledger stores meeting metadata and links only, never message
contents.

## Consequences

- One clean seam per skill: `meeting-radar` (find + route) → `meeting-to-artifacts`
  (extract + review + route) → `knowledge-management` (store). No skill duplicates another's
  job, and the handoff needs no adapter because `meeting-to-artifacts` Ingest already accepts
  "a recording reference to pull" or "pasted text."
- Meetings recorded/summarized outside a live transcript paste now reach durable knowledge
  without the user manually spotting and forwarding each notification.
- Radar carries a privacy surface (mailbox + calendar access) that the other skills don't;
  the metadata-first default, the mandatory review gate, the no-exfiltration rule, and the
  contents-free ledger are load-bearing, not optional polish.

## Alternatives considered

- **Fold discovery into `meeting-to-artifacts`** as an extra ingest mode — rejected: it
  would give that skill mailbox/calendar scope and a privacy surface unrelated to its
  extraction job, and blur its single responsibility. A thin upstream skill keeps each seam
  auditable.
- **Have radar extract artifacts directly** since it holds the link — rejected: it would
  duplicate `meeting-to-artifacts`' inference and its human-review gate, and split
  extraction across two skills. Radar stops at the handoff.
- **Auto-ingest everything a scan finds** — rejected: reading a personal inbox demands a
  human gate. Auto-selection is offered only for already-known recurring series, and even
  then the digest is shown and remains deselectable.
