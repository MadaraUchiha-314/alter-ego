# Handoff — the pipe into meeting-to-artifacts

Radar's whole job ends here: each approved candidate becomes a `templates/handoff-record.md`
and is fed to `handoff.skill` (default `meeting-to-artifacts`) at that skill's **Ingest**
step. Nothing downstream is radar's concern.

## What the handoff record carries

- **Metadata** — title, date, series slug (if known), attendees, organizer.
- **Source kind** — `recording-link` | `transcript-link` | `summary-email` | `notes-email`
  (from `reference/detection.md`), so the receiver knows whether to pull a link or use text.
- **The payload** — the recording/transcript URL to pull, or, when the provider only emailed
  a summary, that summary verbatim.
- **Provenance** — which calendar event and/or email it came from (sender, subject, received
  time). This lets `meeting-to-artifacts` — and, further down, the `knowledge-management`
  vault — record where the material originated.

`meeting-to-artifacts` Ingest already accepts either "a file path / pasted text" or "a
recording reference to pull via the configured provider." A `recording-link`/`transcript-link`
record maps to the latter; a `summary-email`/`notes-email` record maps to the former (paste
the text). Radar produces exactly that shape — no adapter needed.

## Payload durability

The handoff record is an in-process message — transport, not storage. Inline-only text
in a temp record is fragile: a scratchpad purge mid-run destroys the only copy
(issue #13). Durability comes from the receiver: `meeting-to-artifacts` Ingest persists
the verbatim payload (transcript, summary, agenda) to its `storage.rawSources` (default
`raw/meetings/{date}-{slug}/`) before any drafting. A handoff is complete only once
that source file exists; record its repo-relative path in the ledger row.

## Dedup

Before handing off, drop occurrences already processed:

- Check `handoff.processedLog` — the append-only ledger of prior handoffs.
- Check the `meeting-to-artifacts` output tree at the paths its config names (read
  `handoff.meetingArtifactsConfig`; default `knowledge/meetings/<date>-<slug>/`) —
  never a hardcoded location (issue #13).

After a successful handoff, append one ledger row: date, title, series, source kind, link,
the repo-relative path of the source file Ingest persisted, and the handoff time.
**Metadata, links, and paths only — never message contents** (`reference/privacy.md`).
A re-scan that sees a matching ledger row skips the candidate (still lists it under "already
processed" in the digest for transparency).

## Boundary

Radar **discovers and routes**. It does not:

- extract summaries, decisions, tasks, or any artifact — that is `meeting-to-artifacts`,
  behind its own human-review gate;
- write to the knowledge vault — that is `knowledge-management`;
- chain into design or implementation work (decision-011).

One clean seam per skill: radar → meeting-to-artifacts → knowledge-management.
