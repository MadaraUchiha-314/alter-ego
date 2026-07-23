# Layout migration

When a release moves a **structural default** — where a skill's output lands, not how
a file is formatted — repos initialized on the old default need a migration, not just
new docs. Same discipline as everything else upgrade does: **flag → approve →
migrate**, review-gated, nothing silent.

The first such migration is issue #13's taxonomy fix: extracted meeting artifacts
moved off `raw/meetings/` (which humans read as "verbatim capture") to
`knowledge/meetings/`, and verbatim sources became a first-class persisted layer under
`raw/meetings/` (`storage.rawSources`).

## Detecting an affected repo

- Meeting artifacts sitting under `raw/meetings/` — either no
  `meeting-artifacts.config.yaml` (the repo ran on the old defaults) or one whose
  `storage.*` `pathPattern`s point into `raw/meetings/`.
- `effectivenessLog` / meeting-radar `processedLog` under `raw/meetings/`.
- Artifacts whose `sourceTranscript` is a URL or empty, with no persisted source file
  beside them.

## The migration (issue #13: `raw/` artifacts → `knowledge/meetings/`)

Plan all of it, show the full before/after file tree at the review gate, then apply
what's approved:

1. **Move extracted artifacts** — `git mv` each `raw/meetings/<date>-<slug>/` artifact
   tree to `knowledge/meetings/<date>-<slug>/`, plus `effectiveness-log.md` and
   `processed-sources.md`, so history survives the move. Relative links *between*
   artifacts survive unchanged (same tree shape).
2. **Backfill verbatim sources** — for each moved meeting, if the source is still
   retrievable (a `sourceTranscript` URL the configured provider can pull, or a
   transcript file elsewhere in the repo), persist it to
   `raw/meetings/<date>-<slug>/` (`transcript.md` / `provider-summary.md`). Report
   irrecoverable sources; never fabricate one.
3. **Rewrite links** — `sourceTranscript` values become repo-relative paths to the
   backfilled sources (URL stays only where backfill failed); any vault source records
   or notes pointing at `raw/meetings/...` artifact paths are rewritten to
   `knowledge/meetings/...`. A vault touched this way gets one `log.md` entry
   (`repair`), like any other vault mutation.
4. **Update configs** — apply the key-level edits to the repo's
   `meeting-artifacts.config.yaml` (new `storage.rawSources` key, artifact
   `pathPattern`s and `effectivenessLog` onto `knowledge/meetings/`) and
   `meeting-radar.config.yaml` (`handoff.processedLog`), preserving every other user
   value per `reconciliation.md`. A repo that deliberately keeps the old layout may
   decline — then write its current paths into the config explicitly, so the layout is
   a recorded choice rather than a stale default.
5. **Stamp** — raise the affected skills' `seededVersion` in the manifest.

## Boundaries

- Artifact *content* is user-owned: the migration moves files and rewrites only the
  path-valued fields it names (`sourceTranscript`, links to moved files) — never
  bodies.
- Nothing is deleted: sources are added, artifacts are moved, and every rewrite is in
  the reviewed diff.
