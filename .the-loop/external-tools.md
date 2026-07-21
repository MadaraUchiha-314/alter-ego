# External tools, skills, MCPs and plugins

> Free-form, user-owned registry. The-loop reads this file so the harness is aware of
> the tools it is allowed to freely use while delivering work items. Edit at will.

## MCP servers

- _e.g._ `github` — GitHub issues/PRs/Actions via MCP
- _e.g._ `jira` — Jira tickets via MCP

## CLIs

- _e.g._ `gh` — GitHub CLI

## Skills / plugins

- _e.g._ `the-loop` — this plugin
- _e.g._ other installed plugins you want the-loop to leverage
- `knowledge-management` (this repo, `skills/knowledge-management/`) — maintains the
  Obsidian-compatible knowledge vault; use it to ingest/query/validate knowledge
  rather than inventing ad-hoc note structures. Obsidian itself is an optional viewer
  over the vault, never a dependency.
- `meeting-to-artifacts` (this repo, `skills/meeting-to-artifacts/`) — turns a meeting
  transcript into reviewed, durable knowledge artifacts (decisions, requirements,
  tasks, open questions, risks, disagreements, design/ADR, summary) routed to
  configured storage; the vault ingests them as its `meeting-artifact` origin.
  Knowledge only — independent of the-loop, which is reserved for building alter-ego
  itself.

## Notes

Describe any access patterns, auth, or constraints the harness should know about.
