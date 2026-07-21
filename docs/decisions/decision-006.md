# Decision 006: meeting-to-artifacts scopes ingest to Zoom, prefers MCP/CLI over raw API

- **Status:** accepted — point 1 (`provider` as a fixed enum) superseded by decision-007
- **Date:** 2026-07-17
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

PR #4 review feedback on the initial `meeting-to-artifacts` skill (decision-005) asked
for two things left underspecified: (1) which meeting platforms are actually supported
for pulling transcripts, and how the skill talks to them, and (2) how storage
destinations interface with their target system, generalized beyond the original
`repo-path`/`decision-log`/`issue-tracker`/`decision-tracking-system` kinds so providers
like Notion or Google Docs fit the same shape as an issue tracker.

## Decision

1. **`meetingProvider.provider` supports only `zoom` for now**, as an enum (not free
   text) so a second provider is a config addition later, not a redesign. Requests naming
   an unsupported platform (e.g. Google Meet) are told plainly that it isn't supported yet.
2. **Every provider/destination interface picks from `mcp` | `cli` | `api`, in that
   preference order.** `api` requires `apiDocsUrl` pointing at real, public documentation
   — it is not to be configured against an undocumented or private endpoint, and is a
   fallback rather than a default.
3. **Storage destination kinds are generalized to `filesystem` | `filesystem-git` | `mcp`
   | `cli`**, replacing the original `repo-path`/`issue-tracker`/`decision-tracking-system`
   split. `filesystem-git` gained a `style: decision-log` mode to keep this repo's ADR
   convention working under the new shape. This makes Notion/Google Docs/any other
   MCP-or-CLI-backed system a matter of configuration (`kind: mcp`/`cli` + `server`/
   `command`), not new schema.

## Consequences

- Positive: no undocumented/private API integration can sneak in through either the
  ingest or storage config — the schema itself blocks it (`api` requires a public docs
  URL). Adding Google Meet, Notion, or Google Docs later is additive config, not a schema
  break. One consistent interface-preference story (MCP > CLI > API) across both ends of
  the pipeline (ingest and storage) instead of two different mental models.
- Negative: `zoom`-only ingest means the skill can't process transcripts from other
  platforms yet — acceptable per the review feedback ("for now let's only support zoom")
  since a single working provider beats a shallow integration across several.

## Alternatives considered

- A free-text `provider` string instead of an enum — rejected: an enum makes "not
  supported yet" an explicit, checkable state instead of silently mishandling an
  unrecognized platform name.
- Keeping `issue-tracker`/`decision-tracking-system` as separate destination kinds
  alongside the new `mcp`/`cli` ones — rejected: they were already MCP/CLI-shaped in
  practice (an issue tracker is just a system reachable via MCP or CLI), so keeping them
  distinct would mean two schema paths to the same underlying mechanism.
