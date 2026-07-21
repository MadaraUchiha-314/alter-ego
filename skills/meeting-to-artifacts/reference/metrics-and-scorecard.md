# Effectiveness metrics & scorecard

Per-meeting rows accumulate in `effectivenessLog` (`templates/meeting-log-entry.md`).
Scorecard (`templates/scorecard.md`) rolls them up — only on request or configured
cadence.

## Per-meeting fields

- **Artifact yield** — types produced, weighted (see `artifact-inference.md`).
- **Carried-over vs. resolved** — prior open items resolved vs. re-raised. High
  carry-over across occurrences is the strongest broken-meeting signal.
- **Attendees & duration** — when known; feeds cost-per-decision.

## Rolled-up metrics

- **Decision latency** — days/occurrences from open question to decision.
- **Action item completion rate** — % of tasks done by next occurrence. Persistently
  <~50% = commitments nobody keeps; say so plainly.
- **Decision durability** — % reversed within 30/90 days (`superseded by` status in the
  decisions index). Frequent reversals = wrong people/info in the room.
- **Downstream conversion** — requirements → design → shipped changes, traceable when
  downstream work references the artifact it came from. Sharpest value signal.
- **Cost per decision** — (attendees × duration) ÷ decisions, per recurring series.

## Cancellation audit

Series with several consecutive occurrences of summary/tasks-only yield → flag as
kill/convert-to-async candidate, alongside the scorecard, never silently.
