# Routing approved artifacts

Per-artifact destinations in `meeting-artifacts.config.yaml` (`storage.<artifactType>`,
schema in `config.schema.json`). Never hardcode one location — issue #2 requires this to
stay configurable.

## Destination kinds

- `filesystem` — plain path, not version-controlled. Rare.
- `filesystem-git` — path in a git repo (current repo default, or `repo: owner/name`).
  Default for most artifacts. `style: decision-log` = ADR convention: one
  `decision-<nnn>.md` per decision (next nnn = max + 1, zero-padded) + row appended to
  the `decisions.md` index. Check for an existing decisions index before using a flat
  file for decisions.
- `mcp` — write via a configured MCP server (`server:` name). Preferred for anything
  non-filesystem: issue trackers, Notion, Google Docs. Tasks via tracker: one issue per
  task, title = summary, body = context + meeting link, assignee = owner, `labels:` if
  given.
- `cli` — write via an installed CLI (`command:` template) when no MCP server exists.

Only use `mcp`/`cli` destinations actually available in the environment; otherwise ask,
don't guess.

## Path patterns

Placeholders `{date}`, `{slug}`, `{seriesSlug}` from meeting metadata; default tree is
`docs/meetings/{date}-{slug}/...`.

Keep the routed tree vault-pointable per `reference/knowledge-base-compat.md`: one folder
per meeting, shared logs at tree root, relative links.

Knowledge only — never route code, and never hand artifacts off to a development
workflow (decision-011). Acting on an artifact is a separate task the user initiates.

## Multi-project meetings

Route each artifact to its own project's repo/config; ask when ownership isn't obvious.
