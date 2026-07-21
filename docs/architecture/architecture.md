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
