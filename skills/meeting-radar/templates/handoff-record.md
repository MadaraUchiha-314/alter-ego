> Read for structure; write the filled-in record and pass it in-process to
> meeting-to-artifacts (its Ingest step). Never copy this blank template into a target
> repo — the handoff record is an internal message between skills, not a routed artifact.

---
type: meeting-source
title: <meeting title>
date: YYYY-MM-DD
series: <slug or "">
attendees: [<name/handle>, ...]
organizer: <name/handle or "">
discovered_via: [calendar, email]        # whichever applied
source_kind: recording-link              # | transcript-link | summary-email | notes-email
provider: <zoom | google-meet | teams | fireflies | otter | ...>
link: <recording/transcript url, or "">
handoff_to: meeting-to-artifacts
---

## Provenance

- Calendar event: <title>, <start time>, organized by <organizer>, series <slug or "-">.
- Email: from <sender>, subject "<subject>", received <YYYY-MM-DD HH:MM>.

## Payload for meeting-to-artifacts

<For recording-link / transcript-link: the URL above — meeting-to-artifacts pulls it via
its configured provider.>

<For summary-email / notes-email: the summary/notes text, verbatim, so meeting-to-artifacts
uses it directly instead of pulling a recording.>

## Note

meeting-radar found and routed this source. It does not extract artifacts — that is
meeting-to-artifacts, behind its own human-review gate.
