---
type: source
title: <human-readable source name>
description: "<one line: what this source is>"
origin: <github-issue | slack | google-doc | meeting-artifact | obsidian-note | web | file | ...>
resource: <canonical upstream URL or identifier>
via: <mcp | cli | api | paste | file>
retrieved: <YYYY-MM-DD>
version: "<updated_at:... | etag:... | sha256:... | rev:... | ts:...>"
status: current
tags: [knowledge/source, source/<origin>]
# capture: ./<source-id>/    # when a raw snapshot was taken
---

# <human-readable source name>

<!--
Template note: read for structure, write a filled-in record — never copy blank.
-->

One paragraph: what this source is, why it was ingested, and what it feeds.

## Retrieval

How it was pulled (interface, any access constraints worth knowing next refresh).
For `via: paste`/`file`: who provided it and when, since there is no live origin to
re-check.

## Derived notes

Maintained list of notes citing this record (the reverse edge of their `sources:`),
kept current by ingest and validate operations:

- <relative links into ../notes/...>
