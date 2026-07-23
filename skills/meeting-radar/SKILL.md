---
name: meeting-radar
description: Scan email and calendar to discover meetings and their recording links, transcripts, or summaries (Zoom/Meet/Teams "recording ready" mails, notetaker digests from Fireflies/Otter/etc.), correlate them into per-meeting candidates, and — after human review — hand each to the meeting-to-artifacts skill so knowledge stays current. Use for "check my email/calendar for meeting recordings", "find meetings I haven't processed yet", "any new meeting summaries in my inbox", "pull recent meetings into the knowledge base".
---

# Meeting Radar

The **pipe** that feeds `meeting-to-artifacts`: scan email + calendar → find meetings and
their recording/transcript/summary links → correlate + dedup → human picks → hand each
approved source to `meeting-to-artifacts` for extraction. Radar discovers and routes; it
never extracts artifacts or writes knowledge itself. Rationale: issue
[#10](https://github.com/MadaraUchiha-314/alter-ego/issues/10).

## Config

`meeting-radar.config.yaml` at target repo root. Schema: `config.schema.json`; example +
defaults: `config.example.yaml`. Missing file → use defaults, tell the user; never invent
a source or destination outside the current repo.

- `sources.calendar` / `sources.email` — the two input systems. Free-form `name`, harness
  interpreted; interface `mcp` > `cli` > `api` (api needs a public `apiDocsUrl`), same
  pattern as `meeting-to-artifacts` and `knowledge-management`. See `reference/sources.md`.
- `scan` — lookback `window` and the `signals` (senders, subject patterns, recording-link
  hosts) that mark an email as meeting-related. See `reference/detection.md`.
- `correlation.matchWindowHours` — how far from an event's time an email may sit and still
  be matched to it.
- `handoff` — downstream skill (default `meeting-to-artifacts`), a pointer to its config
  (to read the `series` registry), and the `processedLog` ledger used for dedup. See
  `reference/handoff.md`.
- `privacy` — `reviewGate` and `bodyAccess`. See `reference/privacy.md`.

## Process

### 1. Scan

Over `scan.window`, pull calendar events and meeting-signal emails via the configured
`sources` interfaces. **Metadata-first** (`reference/privacy.md`): read event
titles/times/attendees and email headers/subjects/senders — do not open full bodies yet.
Unconfigured, unsupported, or unreachable interface: say so and ask the user to paste a
link or forward the mail — never build one-off scraping.

### 2. Detect & extract links

Recognize meetings (events with a conferencing link) and meeting-related emails
(recording-ready, transcript, summary, notetaker digest) per `reference/detection.md`.
Classify each email and pull out the recording/transcript link or inline summary. Opening
a full body to extract a link is allowed only for a message already matched as a
meeting-source candidate.

### 3. Correlate

Group signals into one candidate per meeting occurrence: match emails to calendar events
by time (within `correlation.matchWindowHours`), title, and attendees, and to any known
`series` from the `meeting-to-artifacts` config. An email with no matching event is still
a candidate on its own; an event with no recording/summary yet is noted but not handed off.

### 4. Dedup

Drop occurrences already handed off — check the `handoff.processedLog` ledger and the
`meeting-to-artifacts` output tree at its **configured** paths (read
`handoff.meetingArtifactsConfig`; default `knowledge/meetings/`) — never assume a
hardcoded tree (issue #13). Re-piping a processed meeting is a duplicate you caused.

### 5. Human review gate — never skip

Present `templates/candidate-digest.md`: what was found, what's already processed, what's
ambiguous. The user selects which candidates to hand off. Never auto-ingest arbitrary
mail. `privacy.reviewGate: auto-known-series` may pre-select occurrences of a known
`series`, but the digest is still shown and the user can deselect. Use `AskUserQuestion`
when a correlation is uncertain (which event a stray "notes from our sync" mail belongs to).

### 6. Hand off

For each approved candidate, write a `templates/handoff-record.md` (title, date, series,
attendees, the recording/transcript link or verbatim summary) and invoke
`handoff.skill` — `meeting-to-artifacts`, at its **Ingest** step — with it. The record is
transport, not storage: a verbatim payload survives only once the receiver's Ingest
persists it to its `storage.rawSources` — confirm that source file exists before
considering the handoff done (issue #13). That skill owns extraction, its own
human-review gate, and routing; the `knowledge-management` vault stores the result.
Append one row to `handoff.processedLog` — including the persisted source's path — so
the source isn't piped again.

## Boundaries

- **Discovery + handoff only.** Radar does not extract summaries/decisions/tasks (that's
  `meeting-to-artifacts`) and does not write to the vault (that's `knowledge-management`).
  It stops at the handoff — no chaining into design or implementation work (decision-011).
- **Privacy first.** Read only enough to identify meeting sources; full-body access is
  gated on a matched candidate; never forward, quote, or send email anywhere. The ledger
  records meeting metadata and links, not message contents (`reference/privacy.md`).
- **No bespoke integrations.** A source with no working `mcp`/`cli`/documented-`api`
  interface configured → say so and ask for a paste/forward; never guess an integration.
