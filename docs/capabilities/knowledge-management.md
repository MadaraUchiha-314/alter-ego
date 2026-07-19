# Capability: knowledge-management

> Alter-ego's knowledge primitive: an Obsidian-compatible, provenance-carrying,
> staleness-checked markdown vault that every other skill reads from and writes into.
> Skill home: [`skills/knowledge-management/`](../../skills/knowledge-management/SKILL.md).

## What it is

Knowledge scattered across GitHub issues, Slack threads, Google Docs, meeting
artifacts and personal notes gets compiled into one persistent, compounding wiki —
Karpathy's LLM-wiki architecture carried on the Open Knowledge Format's surface. The
vault is a plain directory of markdown files: pointable at Obsidian as a vault,
renderable on GitHub, greppable in a shell. This capability landed first, before other
skills, because they all produce into or consume from it (issue #5 thread).

## Current behaviour

- The system SHALL store knowledge as one concept per markdown file with YAML front
  matter (`type` always present) and relative markdown links only, so the vault
  resolves both on GitHub and in Obsidian (decision-001).
- The system SHALL keep two layers: immutable source records (+ optional raw captures)
  under `sources/`, and a derived notes layer under `notes/`; every load-bearing
  derived claim SHALL cite a source record, and unsourced content SHALL be marked
  `verification: unverified` (decision-002).
- The system SHALL maintain `index.md` (catalog), `log.md` (append-only chronicle) and
  `schema.md` (self-describing contract) at the vault root, updating the first two on
  every operation.
- WHEN ingesting, the system SHALL pull via the configured source interface
  (MCP > CLI > documented API, paste/file fallback), check the index for an existing
  note before creating one, and record provenance (origin, canonical resource,
  retrieval time, upstream version marker) (decisions 002, 004).
- WHEN validating, the system SHALL flag staleness via per-type TTLs and via upstream
  version-marker diffs propagated along `sources:` dependency edges, and SHALL only
  flag — rewrites, supersedes and deletions require human approval; superseded notes
  are kept and linked, never deleted (decision-003).
- WHEN querying, the system SHALL answer from the vault with citations, and MAY file
  synthesized answers back as new notes.
- The system SHALL ingest compliant producer-skill output (e.g. meeting artifacts per
  PR #4's contract) without migration, and producer skills SHALL NOT maintain their
  own derived layers (decision-004).

## Design

- Skill entry point: [`skills/knowledge-management/SKILL.md`](../../skills/knowledge-management/SKILL.md)
- Vault structure: [`reference/vault-layout.md`](../../skills/knowledge-management/reference/vault-layout.md);
  note/source format: [`reference/note-format.md`](../../skills/knowledge-management/reference/note-format.md)
- Provenance model: [`reference/provenance.md`](../../skills/knowledge-management/reference/provenance.md);
  staleness model: [`reference/staleness.md`](../../skills/knowledge-management/reference/staleness.md)
- Indexing tiers: [`reference/indexing.md`](../../skills/knowledge-management/reference/indexing.md);
  per-origin ingestion: [`reference/ingestion.md`](../../skills/knowledge-management/reference/ingestion.md)
- Config: `knowledge.config.yaml` per
  [`config.schema.json`](../../skills/knowledge-management/config.schema.json)

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-5 | Initial knowledge-management skill: vault format, two-layer provenance, staleness lint, tiered indexing, pluggable connectors | [issue #5](https://github.com/MadaraUchiha-314/alter-ego/issues/5), [decision-001](../decisions/decision-001.md), [decision-002](../decisions/decision-002.md), [decision-003](../decisions/decision-003.md), [decision-004](../decisions/decision-004.md) |
