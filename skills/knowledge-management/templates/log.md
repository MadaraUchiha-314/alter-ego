---
type: log
title: <vault name> — log
description: Append-only chronicle of every operation on this vault.
tags: [knowledge/log]
---

# Log

Append-only. One entry per operation, newest last; entries are never edited or
removed. Grep-friendly: `grep "^## \[" log.md | tail -5`.

Entry format:

```
## [YYYY-MM-DD] <operation> | <one-line summary>

- files: <files created/updated/flagged>
- why: <trigger — what was ingested / what the lint found / what was approved>
```

Operations: `init`, `ingest`, `query-filed`, `validate`, `repair`, `consolidate`,
`schema-change`.

## [<YYYY-MM-DD>] init | vault seeded

- files: schema.md, index.md, log.md, sources/index.md
- why: vault initialized by the knowledge-management skill
