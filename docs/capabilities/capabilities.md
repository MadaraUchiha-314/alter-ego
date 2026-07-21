# Capabilities — alter-ego

The **organized view of the specs**: one living doc per capability, each the single
source of truth for that capability's *current* behaviour, with history rows tracing
every behaviour back to the raw specs (`docs/specs/<id>/`) and decisions that produced
it. Affected docs are updated **in the same PR** as the work item that changes
behaviour (a ready-to-ship gate item).

| Capability | What it covers |
|------------|----------------|
| [knowledge-management](./knowledge-management.md) | The knowledge primitive: an Obsidian-compatible markdown vault with provenance-carrying source records, staleness validation, tiered indexing, and pluggable source connectors |
| [meeting-to-artifacts](./meeting-to-artifacts.md) | Turns a meeting transcript into reviewed, durable knowledge artifacts (decisions, requirements, tasks, open questions, risks, disagreements, design/ADR, summary, context) routed to pluggable storage, with pre-reads and an effectiveness scorecard; feeds the knowledge vault as its `meeting-artifact` origin |
| [meeting-radar](./meeting-radar.md) | Scans email and calendar for meetings and their recording/transcript/summary links, correlates and dedups them, and — after human review — pipes each into meeting-to-artifacts; the discovery front-end that keeps knowledge current without manual forwarding |
| [plugin-lifecycle](./plugin-lifecycle.md) | Plugin-wide setup and upgrade: `alter-ego:init` seeds a repo (detect skills, offer configs, seed the vault, write a manifest) and `alter-ego:upgrade` reconciles managed files against new plugin versions — user-owned content never touched, vault-format changes review-gated and logged |
| [release-automation](./release-automation.md) | Zero-dependency semantic release on merge to `main`: derives the version bump from conventional commits, writes `plugin.json`/changelog, tags and cuts the GitHub release, with a blocking PR-title lint and an advisory contract-drift check — the source of the versions `alter-ego:upgrade` walks |
