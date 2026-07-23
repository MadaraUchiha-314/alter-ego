# Capability: meeting-to-artifacts

> Turns a meeting transcript into durable, reviewed artifacts and routes them to
> configured storage, instead of letting meeting output evaporate once the call ends.

## What it is

A Claude Code skill (`skills/meeting-to-artifacts/`) that treats a meeting as a
production process with defined outputs: transcript in → inferred, drafted artifacts
(summary, decisions, requirements, tasks, open questions, risks, disagreements,
design/ADR, context/glossary updates) → mandatory human review → approved artifacts
routed to their configured durable home (filesystem, filesystem+git, or an MCP/CLI-backed
system such as an issue tracker, Notion, or Google Docs). It can also generate a pre-read
from a recurring meeting's prior open items, and maintains a per-meeting effectiveness
log rolled up into a periodic scorecard. It produces knowledge only — it never chains
into design/implementation work, and stays independent of `the-loop`, which is reserved
for building alter-ego itself (decision-011).

## Current behaviour

- The system SHALL infer which artifact types to draft from transcript content rather
  than always producing the full set (`reference/artifact-inference.md`).
- The system SHALL persist the verbatim source (transcript, provider AI summary,
  agenda) to the `storage.rawSources` destination (default `raw/meetings/`) at Ingest,
  before any drafting, and SHALL set each artifact's `sourceTranscript` to the
  repo-relative path of that persisted file, falling back to a URL only when
  persistence failed (issue #13, decision-017).
- The system SHALL require an explicit human approval step before any drafted artifact
  is written to its durable destination, and SHALL present the resulting file tree —
  every path to be written — alongside the drafts at that gate (`SKILL.md` step 5,
  decision-017).
- WHEN no `meeting-artifacts.config.yaml` exists THEN the system SHALL confirm the
  storage layout with the user before the first route rather than silently applying
  defaults — layout is a structural choice needing explicit consent (issue #13,
  decision-017).
- WHEN an action item or open question lacks an owner or a due/answer-by date THEN the
  system SHALL exclude it from `tasks.md`/`open-questions.md` rather than record it as
  actionable.
- The system SHALL ingest from the input source named in `provider` (a general provider
  pattern, not meeting-specific; free-form `name`, harness-interpreted — today, only Zoom
  is actually exercised) via MCP or CLI in preference to a raw API call, and SHALL only
  use a raw API call against a well-documented, public API (`reference/providers.md`).
- The system SHALL route each artifact type to a configurable destination
  (`meeting-artifacts.config.yaml`, kinds: `filesystem`, `filesystem-git`, `mcp`, `cli`)
  rather than a single hardcoded location, with the same MCP/CLI-preferred interface
  ordering as ingest (`reference/routing.md`).
- The system SHALL produce knowledge artifacts only: it SHALL NOT chain into design or
  implementation work, SHALL NOT write code where knowledge is maintained, and SHALL NOT
  integrate with `the-loop` (reserved for building alter-ego itself). Acting on an
  artifact is a separate, user-initiated task (decision-011).
- The system SHALL NOT copy its own `templates/*.md` into a target repo — only the
  filled-in, meeting-specific artifact and the one-time `meeting-artifacts.config.yaml`
  a repo opts into ever leave the skill directory (`SKILL.md` step 4, decision-008).
- Every routed artifact SHALL satisfy the Obsidian-compatible knowledge-base contract
  (`reference/knowledge-base-compat.md`): plain markdown with required YAML front matter
  and `meeting/<type>` tags, relative cross-links, a vault-pointable tree, persisted
  transcripts treated as immutable sources — the `knowledge-management` skill ingests these without
  migration as its `meeting-artifact` origin (decision-009,
  `skills/knowledge-management/reference/ingestion.md`).
- The system SHALL append one entry per meeting to a configured effectiveness log and
  roll it up into a scorecard only on request or per a configured cadence
  (`reference/metrics-and-scorecard.md`).
- The system SHALL generate a pre-read for a recurring meeting on request (or per its
  configured cadence) from the previous occurrence's unresolved open questions and
  incomplete tasks, and SHALL keep this separate from post-meeting artifact routing
  (`reference/pre-read.md`).

## Design

`skills/meeting-to-artifacts/SKILL.md` (process), `reference/artifact-inference.md`,
`reference/routing.md`, `reference/providers.md`, `reference/metrics-and-scorecard.md`,
`reference/pre-read.md`, `reference/knowledge-base-compat.md`, `templates/*.md`,
`config.schema.json`, `config.example.yaml`. Decisions: 005 routing/review gate, 006
MCP/CLI/API interface model, 007 free-form provider name, 008 templates stay internal,
009 knowledge-base contract, 010 minimal docs + caveman/ponytail, 011 knowledge/code
boundary, 012 `raw/`/`knowledge/`/`docs/` layout, 013 `docs/` untouched by default, 017
`raw/` verbatim-only with sources persisted at Ingest. The
vault contract itself is owned by the knowledge-management skill (decisions 001–004).

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-13 | Retro fix: verbatim sources persisted at Ingest (`storage.rawSources`, default `raw/meetings/`), extracted artifacts default moved `raw/meetings/` → `knowledge/meetings/`, `sourceTranscript` is a repo-relative path, review gate shows the file tree, missing config asks instead of defaulting; `upgrade` ships the layout migration | [decision](../decisions/decision-017.md), issue [#13](https://github.com/MadaraUchiha-314/alter-ego/issues/13) |
| issue-2 | Decisions no longer default into `docs/decisions/` — all artifacts default under `raw/meetings/`; ADR routing is opt-in with an explicit `dir` | [decision](../decisions/decision-013.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Default routing tree moved `docs/meetings/` → `raw/meetings/`: `raw/` = captured inputs, `knowledge/` = derived vault, `docs/` = repo-development docs | [decision](../decisions/decision-012.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Knowledge/code boundary: removed implementation chaining and all the-loop coupling; generalized `meetingProvider` → `provider` (input sources aren't meeting-specific) | [decision](../decisions/decision-011.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Compressed all skill docs (~50% fewer tokens, rules unchanged); installed caveman + ponytail plugins | [decision](../decisions/decision-010.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Obsidian-compatible knowledge-base contract (`reference/knowledge-base-compat.md`) + `meeting/<type>` tags in every template, for forward-compatibility with issue #5 | [decision](../decisions/decision-009.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Confirmed/documented that `templates/*.md` stay internal to the skill and are never copied into a target repo, avoiding the-loop's template-duplication mistake | [decision](../decisions/decision-008.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | `meetingProvider.provider` changed from a fixed enum to a free-form string, per PR review feedback | [decision](../decisions/decision-007.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Zoom-scoped ingest provider config and MCP/CLI/API-preferred interface model for both ingest and storage, per PR review feedback | [decision](../decisions/decision-006.md), PR [#4](https://github.com/MadaraUchiha-314/alter-ego/pull/4) |
| issue-2 | Initial `meeting-to-artifacts` skill: inference, human review gate, pluggable routing, pre-reads, chaining, effectiveness scorecard | [decision](../decisions/decision-005.md), issue [#2](https://github.com/MadaraUchiha-314/alter-ego/issues/2) |
