# Capabilities — alter-ego

The **organized view of the specs**: one living doc per capability, each the single
source of truth for that capability's *current* behaviour, with history rows tracing
every behaviour back to the raw specs (`docs/specs/<id>/`) and decisions that produced
it. Affected docs are updated **in the same PR** as the work item that changes
behaviour (a ready-to-ship gate item).

| Capability | What it covers |
|------------|----------------|
| [knowledge-management](./knowledge-management.md) | The knowledge primitive: an Obsidian-compatible markdown vault with provenance-carrying source records, staleness validation, tiered indexing, and pluggable source connectors |
