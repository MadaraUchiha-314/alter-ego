# Decision 002: Two-layer vault — immutable source records under `sources/`, derived notes under `notes/`

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314
- **Work item:** issue-5

## Context

Issue #5 asks directly: "How do we deal with provenance?" Knowledge arrives from
volatile, access-gated systems (Slack, Google Docs) and durable ones (GitHub, git
trees). A wiki whose claims can't be traced to their origin can't be trusted, and a
wiki that mutates its own evidence can't be audited.

## Decision

The vault has two layers (Karpathy's layering, with OKF metadata). `sources/` is
**immutable**: one source record per ingested origin capturing `origin`, `resource`,
`via`, `retrieved`, an upstream `version` marker, and optionally a raw capture;
refreshes append, never edit. `notes/` is **derived**: freely maintained entity/topic/
concept pages whose every load-bearing claim cites a source record — front-matter
`sources:` for the machine-readable edge, inline citations for readers. Unsourced
content is permitted but visibly marked `verification: unverified`. Git history plus
the vault's append-only `log.md` chronicle every change to the derived layer. Full
model: `skills/knowledge-management/reference/provenance.md`.

## Consequences

- "Says who?" is always answerable, and the `sources:` edges double as the dependency
  graph that staleness propagation (decision-003) walks — provenance and freshness
  come from the same structure.
- Raw captures cost repo space for volatile origins; accepted, since git-addressable
  origins skip capture and large blobs can move to LFS later without format change.
- The vault must live in git — a synced doc store would lose the audit backbone.

## Alternatives considered

- Single-layer wiki with citation URLs only — dead links to mutated/deleted origins
  destroy provenance exactly when it's needed; rejected.
- Full snapshot of every origin every time — wasteful for durable origins; capture is
  per-origin-kind judgement instead (`reference/ingestion.md`).
- External provenance database — breaks the files-only portability contract
  (decision-001); rejected.
