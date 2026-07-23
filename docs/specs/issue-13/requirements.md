---
type: requirements
phase: requirements-definition
workItem: "issue-13"
status: in-review
approvedBy: []
collaborators: []
overrides: {}
---

# Requirements: retro — extracted artifacts routed to `raw/`, verbatim sources never persisted

> Phase 1 of 3 (requirements → design → tasks). Following the Kiro spec approach
> (https://kiro.dev/docs/specs/). This phase MUST be reviewed and approved by the
> required collaborators before moving to design.

> **Retroactive spec.** PR [#14](https://github.com/MadaraUchiha-314/alter-ego/pull/14)
> was implemented directly from issue
> [#13](https://github.com/MadaraUchiha-314/alter-ego/issues/13) without entering
> the-loop; this spec was backfilled onto the PR at the owner's request so the work is
> documented under the mandated workflow (decision-018). Approval happens via the PR
> review.

## Introduction

The meeting pipeline wrote its *extracted* artifacts (summaries, decisions, tasks)
into `raw/`, while the *verbatim* sources (transcripts, AI summaries) were never
stored — only linked by URL. The user's model is the opposite: `raw/` = verbatim
capture, `knowledge/` = extractions. Sources lived only in ephemeral tool output and
were nearly lost to a scratchpad purge. Issue #13's retro names five root causes and
eight skill updates; these requirements restate those updates as acceptance criteria.

## Requirements

### Requirement 1 — persist verbatim sources at Ingest

**User story:** As the vault owner, I want every transcript/AI summary/agenda written
to durable storage before any drafting, so that extraction is auditable against its
evidence.

#### Acceptance criteria (EARS)

1. WHEN meeting-to-artifacts Ingest obtains a verbatim source THEN the system SHALL
   persist it to the `storage.rawSources` destination (default
   `raw/meetings/{date}-{slug}/`) before drafting begins.
2. IF the source cannot be persisted THEN the system SHALL say why and record the URL
   as an explicit fallback.

### Requirement 2 — `sourceTranscript` is a repo-relative path

**User story:** As a vault consumer, I want each artifact's `sourceTranscript` to
resolve to a file in the repo, so that the derived layer backlinks real evidence.

#### Acceptance criteria (EARS)

1. WHEN an artifact is drafted THEN the system SHALL set `sourceTranscript` to the
   repo-relative path of the persisted source; a URL SHALL appear only when
   persistence failed.

### Requirement 3 — extractions default off `raw/`

**User story:** As a repo reader, I want `raw/` to contain only verbatim capture, so
that directory names mean what humans read them to mean.

#### Acceptance criteria (EARS)

1. The system SHALL default all extracted-artifact destinations (including the
   effectiveness log and radar's processed-sources ledger) to `knowledge/meetings/`,
   and SHALL NOT document extractions as "captured inputs".

### Requirement 4 — review gate shows the resulting file tree

**User story:** As the reviewer, I want to see every path about to be written, so a
layout objection can surface before commit.

#### Acceptance criteria (EARS)

1. WHEN presenting drafts at the review gate THEN the system SHALL also present the
   resulting file tree (persisted sources + artifact destinations).

### Requirement 5 — layout is explicit consent, never a default

**User story:** As the repo owner, I want structural layout decided by me, not by a
skill's fallback defaults.

#### Acceptance criteria (EARS)

1. WHEN `alter-ego:init` offers configs THEN the system SHALL ask the taxonomy
   question and write the chosen paths into config.
2. IF `meeting-artifacts.config.yaml` is missing THEN the system SHALL confirm the
   storage layout with the user before the first route.

### Requirement 6 — consumers follow config paths

**User story:** As a user with a custom layout, I want ingestion and dedup to find
artifacts where my config puts them.

#### Acceptance criteria (EARS)

1. WHEN knowledge-management ingests `meeting-artifact` origins or meeting-radar
   dedups THEN the system SHALL locate the artifact tree via
   `meeting-artifacts.config.yaml`, never a hardcoded `raw/meetings/`.

### Requirement 7 — handoff payloads are durable

**User story:** As the pipeline owner, I want verbatim payloads to survive the
handoff, so a scratchpad purge cannot destroy the only copy.

#### Acceptance criteria (EARS)

1. WHEN meeting-radar hands off a candidate THEN the system SHALL treat the handoff
   record as transport and SHALL consider the handoff complete only once the receiver
   has persisted the payload to its `storage.rawSources`; the ledger row SHALL record
   that path.

### Requirement 8 — upgrade migrates the old layout

**User story:** As a user on the old default, I want an upgrade path that moves my
artifacts and backfills sources without losing anything.

#### Acceptance criteria (EARS)

1. WHEN `alter-ego:upgrade` runs against a repo on the old `raw/meetings/` artifact
   layout THEN the system SHALL stage a review-gated migration: move artifacts,
   backfill recoverable sources, rewrite links, update config paths.
