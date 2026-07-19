---
type: schema
title: <vault name> — schema
description: Self-describing conventions for this knowledge vault. Read me first.
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
status: current
tags: [knowledge/schema]
---

# <vault name> — schema

<!--
Template note (do not copy this comment into a vault): seed this file via the init
operation with real values. This file is the vault's LAYER 3 — its public contract.
Any agent or human pointed at the vault reads this first and needs no other tooling
to make sense of it. Changes to this file are reviewed decisions, not casual edits.
-->

This directory is a knowledge vault: an Obsidian-compatible wiki of markdown notes
maintained by LLM agents and reviewed by humans. Point Obsidian (or any markdown
tool) at this folder and it just works.

## Layout

- `sources/` — **immutable** raw material and provenance records. Never edit; only
  append new records/captures or refresh version metadata.
- `notes/` — derived knowledge: `entities/` (people, teams, systems), `topics/`
  (syntheses), `concepts/` (ideas, terms). Maintained freely, cites everything.
- `index.md` — catalog of every note; read this first when searching.
- `log.md` — append-only chronicle of every operation; never rewrite history.
- `schema.md` — this file.

## Note contract

Every file: YAML front matter + markdown body. `type` is always present. Notes carry
`title`, `description`, `tags` (including nested `knowledge/<type>`), `created`,
`updated`, `status` (`current` | `needs-review` | `stale` | `superseded`),
`verification` (`verified` | `unverified`), and `sources` (relative links to
`sources/*.md` records). Source records carry `origin`, `resource`, `via`,
`retrieved`, `version`, optional `capture`.

## Link contract

Relative markdown links only, resolving both on GitHub and in Obsidian. No
`[[wikilinks]]`, no absolute paths, no links out of the vault root.

## Registered note types

| type | lives in | meaning |
|---|---|---|
| `entity` | `notes/entities/` | a person, team, system, repo or service |
| `topic` | `notes/topics/` | a synthesis across entities and sources |
| `concept` | `notes/concepts/` | an idea, term, pattern or glossary entry |
| `source` | `sources/` | provenance record for ingested material |

New types must be registered here before first use.

## Local conventions

<!-- Record vault-specific judgement calls here as they accrue: naming choices,
subfolder splits, tag taxonomy beyond knowledge/<type>, TTL tuning rationale. -->

_None yet._
