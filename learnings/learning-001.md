# Learning 001: structural defaults need consent; `raw/` reads as verbatim; persist evidence first

- **Source:** user feedback — retro in issue
  [#13](https://github.com/MadaraUchiha-314/alter-ego/issues/13)
- **Date:** 2026-07-22
- **Applied by:** [decision-017](../docs/decisions/decision-017.md)

## What happened

The meeting pipeline wrote its *extracted* artifacts into `raw/`, while the *verbatim*
sources (transcripts, AI summaries) were never persisted — only linked by URL, living
in ephemeral tool output that a scratchpad purge nearly destroyed. The user's model is
the opposite: `raw/` = verbatim capture, `knowledge/` = extractions.

## Learnings

1. **Structural defaults deserve explicit consent, not "default + notify".** A missing
   config is a reason to ask, not to run — where things land is a decision the user
   makes, at `init` (the taxonomy question) or before a skill's first route.
2. **Directory names are an interface.** The plugin meant "raw" as "input to the next
   pipeline stage"; humans will always read `raw/` as "verbatim capture". Name trees
   for the human reading, not the pipeline's.
3. **Persist evidence first, derive second.** A layer contract that exists only in
   docs never materializes; extraction without durable sources is unauditable. Verbatim
   payloads are deliverables, not tool output — write them to disk before drafting, and
   treat inline text in temp records as transport, not storage.
4. **Review gates must cover layout, not just content.** Destinations named in passing
   don't surface objections; show the resulting file tree before commit.
