# Decision 001: One knowledge format — Obsidian-compatible markdown with OKF-style front matter

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** @MadaraUchiha-314
- **Work item:** issue-5

## Context

Issue #5 asks for a knowledge-management primitive whose storage is Obsidian-compatible
("point the knowledge folder at Obsidian as a vault and it makes sense"), taking
inspiration from Karpathy's LLM-wiki gist and consolidating with Google's Open
Knowledge Format (OKF). Karpathy's gist uses `[[wikilinks]]`; OKF uses plain markdown
links and YAML front matter with a single required `type` field. The two had to be
reconciled into one format, and that format is the public interface every other
alter-ego skill will produce into or consume from.

## Decision

The vault format is the OKF surface applied to Karpathy's architecture: one concept
per markdown file (path = identity), YAML front matter on every file with `type`
always present, `index.md` catalogs per directory, and **relative markdown links
only — no `[[wikilinks]]`** — so every link resolves both on GitHub and in Obsidian.
Standard keys (`title`, `description`, `tags`, `created`/`updated`, `status`,
`verification`, `sources`, `resource`) are defined in
`skills/knowledge-management/reference/note-format.md`; key names are a breaking-change
surface. Producer-defined `type` values are legal (OKF's minimal-opinionation) but
must be registered in the vault's `schema.md`.

## Consequences

- The vault is a format, not a platform: readable in any editor, renderable on GitHub,
  vault-pointable in Obsidian, greppable in shells — no required tooling, no lock-in.
- Obsidian-specific conveniences (graph view, Dataview over properties, aliases) work,
  but nothing depends on them.
- Giving up `[[wikilinks]]` costs Obsidian's auto-rename affordance; in exchange links
  survive outside Obsidian, which matters more for an agent-maintained repo. This also
  matches the contract PR #4 already declared for meeting artifacts.

## Alternatives considered

- Obsidian-native wikilinks (Karpathy verbatim) — links break on GitHub and for every
  non-Obsidian consumer; rejected.
- A database/embedding store as primary — violates "point Obsidian at it"; derived
  search indexes remain optional accelerators only (decision-004's tier model).
- Inventing a bespoke front-matter vocabulary — OKF already defines a minimal,
  vendor-neutral one; adopting it keeps the vault interoperable with OKF tooling.
