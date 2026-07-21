# Sources (email + calendar)

The two input systems radar scans, configured in `sources` (`config.schema.json`, example
in `config.example.yaml`). Same provider/interface pattern as `meeting-to-artifacts`
(`reference/providers.md`) and `knowledge-management` (`reference/ingestion.md`) — this
skill adds no new integration mechanism.

## Sources

- `sources.calendar` — a calendar system (`google-calendar`, `outlook`, ...). Scanned for
  events: title, time, attendees, organizer, and any conferencing/recording link on the
  event. `calendars` selects which calendars (default: primary only).
- `sources.email` — a mailbox (`gmail`, `outlook`, ...). Scanned for meeting-related mail
  per `reference/detection.md`. `mailboxes` selects which labels/folders (default: INBOX).

Either may be omitted. Radar works from whichever is configured: calendar-only (events but
no recording links yet), email-only (recordings/summaries but no attendee list), or both
(the correlated case, `reference/handoff.md`).

`name` is free-form and harness-interpreted — no schema enum (decision-007). A source with
no working interface configured/available: say so and ask the user to paste a link or
forward the mail; never guess an integration.

## Interface, in preference order

1. `mcp` — configured MCP server exposing the calendar/mailbox. Preferred.
2. `cli` — installed first-party/well-maintained CLI, when no MCP server exists.
3. `api` — direct HTTP, **only** with `apiDocsUrl` pointing at real public docs. Never
   against undocumented/private endpoints. Fallback, not default.

Only use an interface actually available in the environment. Unconfigured or unreachable →
ask for a paste/forward.

## Adding a source

Write its name + an `interface` block under `sources.calendar` or `sources.email`. No
schema change needed.
