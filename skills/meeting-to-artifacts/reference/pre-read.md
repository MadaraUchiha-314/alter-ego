# Pre-reads

From the series' previous occurrence: unresolved `open-questions.md` items, incomplete
`tasks.md` items, plus anything relevant the user points at. Fill
`templates/pre-read.md` as "the N things to decide today" — not a recap. Post where
attendees will see it (series `publishChannel`, if set). Generate only on request or the
series' configured cadence.

## Knowledge/code boundary

This skill ends at knowledge artifacts. It never chains into design or implementation
work, and never writes code where knowledge is maintained (decision-011). To act on an
artifact — build what a `requirements.md` describes, implement a `design.md` — the user
points an agent at that artifact and starts the work as a separate task, in the code
repo, with whatever workflow that repo uses. Downstream work that references the artifact
it came from is what powers the downstream-conversion metric; initiating that work is out
of scope here.
