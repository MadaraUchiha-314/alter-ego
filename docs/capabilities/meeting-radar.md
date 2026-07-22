# Capability: meeting-radar

> Scans email and calendar to find meetings and their recording/transcript/summary links,
> then — after human review — pipes each into meeting-to-artifacts, so a meeting that was
> recorded or summarized elsewhere still reaches durable knowledge instead of sitting
> unread in an inbox.
> Skill home: [`skills/meeting-radar/`](../../skills/meeting-radar/SKILL.md).

## What it is

A Claude Code skill (`skills/meeting-radar/`) that acts as the discovery front-end for
`meeting-to-artifacts`. It scans a configured calendar and mailbox over a lookback window,
recognizes meetings (events with attendees/conferencing links) and meeting-related email
(recording-ready notices, transcripts, notetaker summaries), correlates those signals into
one candidate per occurrence, dedups against already-processed meetings, presents a review
digest, and hands each user-approved candidate to `meeting-to-artifacts` at its Ingest step.
It produces no knowledge itself: extraction stays with `meeting-to-artifacts` (behind its
own review gate) and storage stays with `knowledge-management`. It reads a personal mailbox,
so it is metadata-first and never forwards or sends mail.

## Current behaviour

- The system SHALL scan the configured `sources.calendar` and/or `sources.email` over
  `scan.window` via MCP or CLI in preference to a raw API call, and SHALL only use a raw
  API call against a well-documented, public API (`reference/sources.md`); either source
  may be omitted and the system SHALL work from whichever is configured.
- WHEN a source has no working interface configured or reachable THEN the system SHALL say
  so and ask the user for a pasted link or forwarded mail rather than building a one-off
  integration (`reference/sources.md`).
- The system SHALL recognize a meeting-related email when any configured `scan.signals`
  heuristic fires (sender, subject pattern, or recording-link host) and SHALL classify it
  as `recording-link`, `transcript-link`, `summary-email`, or `notes-email`
  (`reference/detection.md`).
- The system SHALL correlate emails to calendar events within `correlation.matchWindowHours`
  (corroborated by title and attendee overlap) and to the `meeting-to-artifacts` `series`
  registry, grouping signals into one candidate per meeting occurrence, and SHALL route
  genuinely ambiguous correlations through an explicit user question rather than guessing
  (`reference/detection.md`).
- The system SHALL default to reading metadata first (event fields, email headers/subjects)
  and SHALL open a full email body only to extract a link or summary from a message already
  matched as a candidate (`privacy.bodyAccess`, `reference/privacy.md`).
- The system SHALL present every scan's findings in a review digest and SHALL NOT hand any
  candidate to the downstream skill without human approval; `privacy.reviewGate:
  auto-known-series` MAY pre-select known-series occurrences but SHALL still show the digest
  and keep items deselectable (`SKILL.md` step 5, `reference/privacy.md`).
- The system SHALL dedup against the `handoff.processedLog` ledger and the
  `meeting-to-artifacts` output tree at its configured paths (read from
  `handoff.meetingArtifactsConfig`, never hardcoded) so a processed meeting is not piped
  twice, and SHALL record only meeting metadata, links, and persisted-source paths —
  never message contents — in that ledger (`reference/handoff.md`, `reference/privacy.md`,
  decision-017).
- The system SHALL hand each approved candidate to `meeting-to-artifacts` at its Ingest step
  as a handoff record (metadata + source kind + recording link or verbatim summary +
  provenance), a shape that Ingest already accepts without an adapter, and SHALL treat the
  record as transport, not storage: a handoff is complete only once the receiver has
  persisted the verbatim payload to its `storage.rawSources`, whose path lands in the
  ledger row (`reference/handoff.md`, decision-017).
- The system SHALL be discovery-and-handoff only: it SHALL NOT extract artifacts (that is
  `meeting-to-artifacts`), SHALL NOT write to the knowledge vault (that is
  `knowledge-management`), SHALL NOT forward/send/quote email outward, and SHALL NOT chain
  into design or implementation work (decision-011, decision-015).
- The system SHALL NOT copy its own `templates/*.md` into a target repo — the digest and
  handoff record are a review surface and an in-process message, and only the opt-in
  `meeting-radar.config.yaml` and the `processedLog` ledger a repo opts into ever land on
  disk (decision-008, decision-015).

## Design

`skills/meeting-radar/SKILL.md` (process), `reference/sources.md` (email/calendar
connectors + interface order), `reference/detection.md` (meeting/email signals +
correlation), `reference/handoff.md` (the pipe contract + dedup + boundary),
`reference/privacy.md` (metadata-first, review gate, no exfiltration),
`templates/candidate-digest.md`, `templates/handoff-record.md`, `config.schema.json`,
`config.example.yaml`. Decisions: 015 (discovery-only pipe, privacy stance). Reuses the
MCP/CLI/API interface model (006) and free-form source name (007) from meeting-to-artifacts,
the templates-stay-internal rule (008), and the knowledge/code boundary (011).

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-13 | Handoff records are transport, not storage — a handoff completes only once the receiver persists the verbatim payload; dedup follows the configured artifact tree (default now `knowledge/meetings/`); `processedLog` default moved off `raw/` | [decision](../decisions/decision-017.md), issue [#13](https://github.com/MadaraUchiha-314/alter-ego/issues/13) |
| issue-10 | Initial `meeting-radar` skill: scans email + calendar, detects/correlates meeting recordings & summaries, dedups, and pipes reviewed candidates into meeting-to-artifacts | [issue #10](https://github.com/MadaraUchiha-314/alter-ego/issues/10), [decision-015](../decisions/decision-015.md) |
