# Architecture — alter-ego

This is the top-level architecture index. Sub-component architectures are linked from
here as they are added (`docs/architecture/<component>.md`).

## Components

- **knowledge-management skill** (`skills/knowledge-management/`) — the knowledge
  primitive: an Obsidian-compatible markdown vault (immutable `sources/` provenance
  layer + derived `notes/` wiki + self-describing `schema.md`) that other alter-ego
  skills produce into and consume from. Capability doc:
  [knowledge-management](../capabilities/knowledge-management.md).
- **meeting-to-artifacts skill** (`skills/meeting-to-artifacts/`) — drafts durable
  knowledge artifacts from a meeting transcript, gates them behind human review, and
  routes approved artifacts to pluggable storage; the vault ingests them as its
  `meeting-artifact` origin. See
  [capability doc](../capabilities/meeting-to-artifacts.md) and
  [decision-005](../decisions/decision-005.md).
- **meeting-radar skill** (`skills/meeting-radar/`) — the discovery front-end: scans
  email + calendar for meetings and their recording/transcript/summary links, correlates
  and dedups them, and hands human-reviewed candidates to `meeting-to-artifacts` at its
  Ingest step. Discovery + handoff only — it extracts nothing and stores nothing. See
  [capability doc](../capabilities/meeting-radar.md) and
  [decision-015](../decisions/decision-015.md).

The end-to-end flow across the three skills is one seam per skill:
`meeting-radar` (find + route) → `meeting-to-artifacts` (extract + review + route) →
`knowledge-management` (store).

## Release automation

- **Release automation** (`.github/`) — a zero-dependency semantic release: on merge to
  `main`, GitHub Actions derives the version bump from conventional commits, writes
  `.claude-plugin/plugin.json`, updates the changelog, tags `v<version>`, and cuts the
  GitHub release; PRs are gated by a blocking conventional-commit title lint and an
  advisory contract-drift check. It produces the tags/releases the `alter-ego:upgrade`
  skill walks. Capability doc:
  [release-automation](../capabilities/release-automation.md); rationale
  [decision-016](../decisions/decision-016.md).
