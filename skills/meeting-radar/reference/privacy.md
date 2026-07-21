# Privacy

Radar reads a personal mailbox and calendar. It must read as little as the job needs, and
never move that content anywhere the user didn't ask.

## Metadata-first (`privacy.bodyAccess`)

Default `metadata-first`: detection runs on event titles/times/attendees and email
headers/subjects/senders. A full email body is opened **only** to extract a link or summary
from a message already matched as a candidate (`reference/detection.md`) — never to browse
the mailbox at large. `full` is an opt-in for a mailbox dedicated to meeting notifications,
where reading bodies during detection carries no extra exposure.

## Review gate (`privacy.reviewGate`)

Default `always`: the user confirms every candidate in the `templates/candidate-digest.md`
before any handoff. `auto-known-series` may pre-select occurrences of a known `series`, but
the digest is still shown and every item stays deselectable — it is never a silent
auto-ingest. Ambiguous correlations always go through `AskUserQuestion`.

## No exfiltration

Radar does not forward, reply to, quote outward, or send email anywhere. Its only output
is (1) the digest shown to the user and (2) handoff records passed in-process to
`meeting-to-artifacts`. The `handoff.processedLog` ledger stores meeting **metadata and
links only** — never message bodies — so a repo committing the ledger never leaks mail
contents.

## Scope

Only the `sources` (calendars/mailboxes) named in config are scanned. A source with no
configured interface is not reached — radar asks for a paste/forward instead of widening
access on its own.
