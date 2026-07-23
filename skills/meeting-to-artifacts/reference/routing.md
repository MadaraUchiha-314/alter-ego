# Routing approved artifacts

Per-artifact destinations in `meeting-artifacts.config.yaml` (`storage.<artifactType>`,
schema in `config.schema.json`). Never hardcode one location — issue #2 requires this to
stay configurable.

## Two layers, never mixed

Directory names are an interface: humans read `raw/` as "verbatim capture", so only
verbatim capture lives there (issue #13).

- **`storage.rawSources`** (default `raw/meetings/{date}-{slug}/`) — the verbatim
  layer: transcript, provider AI summary, agenda. Written at **Ingest**, before any
  drafting; immutable once written.
- **`storage.<artifactType>`** (default `knowledge/meetings/{date}-{slug}/`) — this
  skill's extractions, routed only after the review gate. Never route an extraction
  into `raw/`.

Every extraction backlinks its persisted source via `sourceTranscript`
(repo-relative path; URL only as a fallback when persistence failed).

## Destination kinds

- `filesystem` — plain path, not version-controlled. Rare.
- `filesystem-git` — path in a git repo (current repo default, or `repo: owner/name`).
  Default for all artifacts, including `decisions.md`, under `knowledge/meetings/`.
  `style: decision-log` is **opt-in only** (never a default — a repo's `docs/` belongs
  to its own development docs, decision-013): ADR convention writing one
  `decision-<nnn>.md` per decision (next nnn = max + 1, zero-padded) + a row appended
  to the `decisions.md` index in the configured `dir`.
- `mcp` — write via a configured MCP server (`server:` name). Preferred for anything
  non-filesystem: issue trackers, Notion, Google Docs. Tasks via tracker: one issue per
  task, title = summary, body = context + meeting link, assignee = owner, `labels:` if
  given.
- `cli` — write via an installed CLI (`command:` template) when no MCP server exists.

Only use `mcp`/`cli` destinations actually available in the environment; otherwise ask,
don't guess.

## Path patterns

Placeholders `{date}`, `{slug}`, `{seriesSlug}` from meeting metadata; default trees
are `knowledge/meetings/{date}-{slug}/...` (extractions) and
`raw/meetings/{date}-{slug}/` (verbatim sources). The review gate shows the resulting
tree — every path about to be written — before anything is committed.

Keep the routed tree vault-pointable per `reference/knowledge-base-compat.md`: one folder
per meeting, shared logs at tree root, relative links.

Knowledge only — never route code, and never hand artifacts off to a development
workflow (decision-011). Acting on an artifact is a separate task the user initiates.

## Multi-project meetings

Route each artifact to its own project's repo/config; ask when ownership isn't obvious.
