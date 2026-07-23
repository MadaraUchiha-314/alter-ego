---
name: meeting-to-artifacts
description: Turn a meeting transcript/recording into durable, human-reviewed knowledge artifacts (summary, decisions, requirements, tasks, open questions, risks, disagreements, design/ADR, context updates) routed to configured storage; also pre-reads. Use for "recap this meeting", "extract decisions/action items from this transcript", "process yesterday's meetings", "generate a pre-read".
---

# Meeting → Artifacts

Transcript in → draft artifacts → human approves → route to durable storage → next
occurrence starts from a pre-read. Rationale: issue
[#2](https://github.com/MadaraUchiha-314/alter-ego/issues/2).

## Config

`meeting-artifacts.config.yaml` at target repo root. Schema: `config.schema.json`;
example + defaults: `config.example.yaml`. Missing file → where things land is a
structural choice that needs explicit consent (issue #13): confirm the storage layout
with the user (or point them at `alter-ego:init`, which asks the taxonomy question)
before the first route — "default + notify" is not consent for layout. Never invent a
destination outside the current repo.

- `provider` — input source (general pattern, not meeting-specific). Free-form `name`
  (only `zoom` exercised so far); interface `mcp` > `cli` > `api` (api needs a public
  `apiDocsUrl`). See `reference/providers.md`.
- `storage` — per-artifact destination: `filesystem` | `filesystem-git` | `mcp` | `cli`.
  See `reference/routing.md`. Two layers, never mixed: `storage.rawSources` holds
  verbatim capture (transcripts, provider AI summaries, agendas; default
  `raw/meetings/`), the other `storage.*` keys hold this skill's extractions (default
  `knowledge/meetings/`).
- `knowledgeBase` — path to the knowledge-management skill's vault root (its
  `vault.path`, default `knowledge/`); resolves vague mentions to concrete repos/people
  and is the `context.md` routing target.
- `series` — recurring-meeting registry (pre-reads, cancellation audit).
- `effectivenessLog` — where per-meeting rows accumulate.

## Process

### 1. Ingest

File path or pasted text: use directly. Recording reference: pull via the configured
`provider` interface. Unconfigured, unsupported platform, or unreachable
interface: say so and ask for a paste/path — never build one-off scraping.

**Persist the verbatim source before anything else** (issue #13): as soon as the
transcript / provider AI summary / agenda is in hand, write it to `storage.rawSources`
(default `raw/meetings/{date}-{slug}/`, stable filenames: `transcript.md`,
`provider-summary.md`, `agenda.md`). The source is a durable deliverable, not
ephemeral tool output — drafting starts only after the source file exists, and every
artifact's `sourceTranscript` points at it.

Capture: title, date, attendees, series + occurrence. If in a `series`, load the
previous occurrence's open items.

### 2. Classify & gather context

Determine meeting type and project/repo. Cross-reference `knowledgeBase` **before**
drafting: owners resolve to handles, services to repos.

### 3. Infer which artifacts apply

Draft only artifacts with real signal — mapping in `reference/artifact-inference.md`.
Small-talk-only meeting → short `summary.md`, nothing else.

### 4. Draft

Templates in `templates/` define each artifact's shape: read for structure, write the
filled-in artifact. **Never copy a blank template into a target repo**
(`the-loop#36`) — only filled artifacts and the opt-in config file leave this skill dir.

Rules:

- Every artifact satisfies `reference/knowledge-base-compat.md` (front-matter keys,
  `meeting/<type>` tags, relative links, vault-pointable tree) — the
  `knowledge-management` skill ingests these as its `meeting-artifact` origin.
- Tasks and open questions **require owner + due/answer-by date**; otherwise demote to
  the summary.
- `sourceTranscript` is the **repo-relative path** of the source persisted at Ingest;
  a URL is a fallback only when persistence genuinely failed (say why in the artifact).
- Decisions record reversibility: `easily-reversible` | `costly-to-reverse`.
- Design/architecture agreements use ADR format (`templates/design.md`).
- Note in `summary.md` which prior open items this meeting resolved.

### 5. Human review gate — never skip

Present drafts **and the resulting file tree** — every path about to be written or
already written (persisted sources under `rawSources`, each artifact's destination) —
so a layout objection can surface before commit, not after (issue #13). The user
approves/edits/rejects each artifact **before** anything is written to its
destination. Transcripts capture what was said, not what was agreed. Use
`AskUserQuestion` on ambiguous tone (sarcasm vs. commitment). User edits are final.

### 6. Route approved artifacts

Per `storage` config (`reference/routing.md`). Defaults:

| Artifact | Default destination |
|---|---|
| verbatim sources (`transcript.md`, `provider-summary.md`, `agenda.md`) — already written at Ingest | `raw/meetings/<date>-<slug>/` |
| `summary.md`, `decisions.md`, `risks.md`, `disagreements.md`, `tasks.md`, `open-questions.md`, `context.md` | `knowledge/meetings/<date>-<slug>/<name>.md` |
| `requirements.md`, `design.md` | `knowledge/meetings/<date>-<slug>/` |
| `decisions.md` (only if `storage.decisions` opts into `style: decision-log`) | one `decision-<nnn>.md` per decision + index row in the configured `dir` |
| `tasks.md` (if `storage.tasks` is `mcp`/`cli`) | one tracker issue per task, owner as assignee |
| `context.md` (if `knowledgeBase` set) | appended to the knowledge base |

`open-questions.md` also registers against the `series` entry for the next pre-read.
One commit, message naming meeting date + title.

### 7. Effectiveness log

Append one `templates/meeting-log-entry.md` row to `effectivenessLog`. Scorecard
(`templates/scorecard.md`, metrics in `reference/metrics-and-scorecard.md`) only on
request or configured cadence.

### 8. Pre-read (on request or series cadence)

`templates/pre-read.md` per `reference/pre-read.md`: previous occurrence's unresolved
questions + incomplete tasks → "the N things to resolve today." Separate output; never
folded into routing.

## Knowledge/code boundary

This skill produces knowledge artifacts and stops there (decision-011). Never chain into
design or implementation work, and never write code where knowledge is maintained. To act
on an artifact, the user points an agent at it as a separate task in the code repo.

## Cancellation candidates

A `series` whose last several occurrences yielded only summary/tasks — no decisions, no
resolved open questions — gets flagged to kill or convert to async. Meta-output: mention
in your reply and the log entry, no per-meeting file.
