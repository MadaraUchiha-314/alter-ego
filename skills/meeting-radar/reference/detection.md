# Detecting meetings and meeting-related mail

How radar decides what is a meeting source, and how it groups signals into one candidate
per occurrence. Tuned by `scan.signals` and `correlation` (`config.schema.json`).

## Calendar events

An event is a meeting when it has attendees beyond the owner and/or a conferencing link
(Zoom/Meet/Teams join URL, or a `conferenceData` entry). Capture: title, start date/time,
attendees, organizer, series/recurrence id, and any recording link already on the event.
A past event with attendees but no recording/summary anywhere → noted in the digest as
"no recording found yet," not handed off.

## Meeting-related email

An email is a meeting source when **any** signal in `scan.signals` fires:

- **sender** — from a configured recording/notetaker address or domain (e.g. `zoom.us`,
  `meetings-noreply@google.com`, `fireflies.ai`, `otter.ai`).
- **subject** — matches a configured pattern (`recording is ready`, `meeting summary`,
  `transcript`, `notes from`, ...).
- **link host** — body contains a link on a configured `recordingLinkHosts` host. Under
  `bodyAccess: metadata-first`, this signal is evaluated only after sender/subject already
  matched the message (opening the body to pull the link is then allowed).

Classify each match: `recording-link` (video), `transcript-link`, `summary-email`
(provider emailed the summary inline, no recording), or `notes-email` (a human forwarded
notes). The classification travels in the handoff record so `meeting-to-artifacts` knows
whether it received a link to pull or text to use directly.

## Correlation

Group signals into one candidate per meeting occurrence:

1. **Email ↔ event** — match on time (email within `correlation.matchWindowHours` of the
   event), then corroborate with title similarity and attendee/organizer overlap. A
   provider's "recording ready" mail usually lands minutes-to-hours after the event ends.
2. **↔ series** — if `handoff.meetingArtifactsConfig` is set, match the event against its
   `series` registry so the candidate carries the right `series` slug.
3. **Unmatched email** — a meeting-source email with no calendar event (external call,
   ad-hoc meeting) is still a standalone candidate; carry what the mail provides.
4. **Multiple emails, one event** — a recording mail *and* a summary mail for the same
   occurrence collapse into one candidate listing both sources.

Ambiguous matches (a vague "notes from our sync" with two plausible events in-window) go to
the digest's "needs your call" section — resolve with `AskUserQuestion`, never a silent guess.
