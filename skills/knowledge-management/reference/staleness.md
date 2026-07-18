# Staleness

The issue's second hard question — "how do we deal with data sources changing, and how
do we keep updating our data?" — is handled by two detection mechanisms feeding one
review-gated repair loop. The invariant: **agents flag, humans approve, then agents
fix.** A wiki that silently rewrites itself can't be trusted; one that silently rots
can't be used.

## States

`status` on every note and source record:

- `current` — believed accurate.
- `needs-review` — a detector flagged it; the *claim of accuracy* is suspended until a
  human (or a human-approved refresh) clears it. The content itself is untouched.
- `stale` — reviewed and confirmed out of date, not yet repaired (kept visible rather
  than deleted; still useful as history).
- `superseded` — replaced; `superseded_by` points at the successor. Never delete the
  predecessor — links to it must keep resolving.

`verification` is orthogonal: `verified` (human has reviewed the content against its
sources) vs `unverified` (machine-derived or unsourced). Fresh ingests default to
`unverified`; review flips them.

## Detector 1 — pull (time-based lint)

Runs on request or the `staleness.cadence` from config:

1. For every `current` note: flag `needs-review` when `today > review_after`, or when
   no `review_after` is set and `today - updated > ttlDays` for its `type`
   (`staleness.ttlDays.<type>`, falling back to `staleness.defaultTtlDays`).
2. TTL defaults lean on volatility: entities rot slower than topics, topics slower
   than task-shaped knowledge. Tune per vault in config.

## Detector 2 — push (source-change propagation)

The `sources:` front matter is a dependency graph; walk it:

1. For each source record with a live origin (`resource` + configured interface),
   fetch the current upstream version marker and diff against the recorded `version`.
   Origin unreachable → note that in the report; unreachable is not "unchanged".
2. Marker changed → flag the **source record** `needs-review` and propagate: every
   note listing that record in `sources:` flips to `needs-review` too. Propagation is
   transitive through notes-citing-notes.
3. `via: paste`/`file` records with no live origin can only age out via Detector 1 —
   say so in the report so the human knows those corners are dark.

## Graph lint (structural health)

Alongside both detectors: orphan notes (nothing links to them, they're not in
`index.md`), dead relative links, `verified` notes with empty `sources`, duplicate
concepts (two notes, one identity), unresolved `## Contradictions` sections, index
rows whose `updated` disagrees with the note.

## The repair loop

1. **Report** — one review report per validate run: what flagged, why (which detector,
   which marker diff), suggested action per item (refresh / rewrite / supersede /
   confirm-still-current / drop).
2. **Review gate** — the human disposes each item. Bulk-approve is fine; skipping the
   gate is not. Status flips to `needs-review` and the report itself need no approval
   — they *are* the flag.
3. **Repair** — approved refreshes re-ingest from the origin (new capture, bumped
   `version`), then update the derived notes citing it; approved supersedes write the
   successor and link both ways. `updated` bumps, `verification: verified` (a human
   just reviewed it), `index.md` rows refresh.
4. **Chronicle** — every flip and repair is a `log.md` entry. Reversal data ("this was
   flagged stale but confirmed current") is kept — it tunes the TTLs.
