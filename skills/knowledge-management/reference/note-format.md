# Note format

One concept per file: markdown body + YAML front matter. This is the OKF consolidation
(decision-001): front matter is the queryable structured surface (Obsidian properties,
Dataview, `grep`), the body is the human/LLM-readable knowledge. Key names are a
public interface — renaming one is a breaking change to every consumer.

## Front matter — notes (`notes/**`)

```yaml
---
type: entity            # required, the only universally required key (OKF)
title: Auth Service
description: One-line summary shown in index.md.
tags: [knowledge/entity, auth]
created: 2026-07-18
updated: 2026-07-18
status: current         # current | needs-review | stale | superseded
verification: verified  # verified | unverified
sources:
  - ../../sources/github-alter-ego-issue-5.md
resource: https://github.com/org/auth-service    # optional: canonical upstream URL
review_after: 2027-01-18                         # optional: overrides the type TTL
superseded_by: ./auth-service-v2.md              # only when status: superseded
aliases: [authn-service]                         # optional: Obsidian aliases
---
```

- `type` — `entity` | `topic` | `concept` are the defaults this skill maintains;
  producer-defined types are legal (OKF is minimally opinionated) but must be recorded
  in the vault's `schema.md` when introduced.
- `tags` — always include the `knowledge/<type>` nested tag; free domain tags after.
- `status` + `verification` — the staleness surface; semantics in `staleness.md`.
  A claim with no source is `verification: unverified` — visible, never hidden.
- `sources` — relative links to source records; the provenance chain (`provenance.md`).
  Empty `sources` on a `verified` note is a lint error.
- Dates are `YYYY-MM-DD`; `updated` is bumped on every content change (not on
  status-only flips, which `log.md` records).

## Front matter — source records (`sources/*.md`)

```yaml
---
type: source
title: "alter-ego#5: Knowledge Management Skill"
description: GitHub issue defining the knowledge-management requirements.
origin: github-issue     # github-issue | slack | google-doc | meeting-artifact | obsidian-note | web | file | ...
resource: https://github.com/MadaraUchiha-314/alter-ego/issues/5
via: mcp                 # mcp | cli | api | paste | file
retrieved: 2026-07-18
version: "updated_at:2026-07-18T18:19:48Z"   # upstream version marker, see provenance.md
capture: ./github-alter-ego-issue-5/         # optional: raw snapshot dir, when origin is volatile
tags: [knowledge/source, source/github-issue]
---
```

## Body conventions

- Start with a short narrative (what/why), then structured sections. Tables for
  enumerable facts, prose for meaning.
- **Links**: relative markdown links only — `[customers](../entities/customers.md)` —
  resolving both on GitHub and in Obsidian. No `[[wikilinks]]`, no absolute paths, no
  links that escape the vault root.
- **Citations**: load-bearing claims cite inline —
  `…decided to prioritize the primitive first ([source](../../sources/github-alter-ego-issue-5.md))` —
  in addition to the front-matter `sources` list.
- **Contradictions** are content, not errors: record both positions with their sources
  under a `## Contradictions` section and flag per `staleness.md`.
- Mermaid diagrams allowed; HTML-only content not.
