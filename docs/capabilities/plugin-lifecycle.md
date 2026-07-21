# Capability: plugin-lifecycle

> How a repo gets set up for the whole alter-ego plugin and stays current as the plugin
> releases. Two skills: [`skills/init/`](../../skills/init/SKILL.md) (`alter-ego:init`)
> and [`skills/upgrade/`](../../skills/upgrade/SKILL.md) (`alter-ego:upgrade`).

## What it is

Before this, a repo got the plugin as a marketplace entry and each skill initialized
itself lazily — no single setup pass, no record of what was created, no upgrade path.
`alter-ego:init` sets a repo up in one pass; `alter-ego:upgrade` carries it forward as
versions release. Both lean on `.alter-ego/manifest.yaml`, which records what the plugin
created, at what version, and which files are managed (reconciled on upgrade) vs.
user-owned (never touched) — so upgrades are safe by construction (issue #7).

## Current behaviour

- WHEN setting a repo up, `alter-ego:init` SHALL enumerate skills from
  `skills/*/SKILL.md` at run time, classify each primitive vs. producer, confirm the set
  with the user, offer each applicable skill's config file from its `config.example.yaml`
  (never the blank example, never outside the repo root), delegate seeding the knowledge
  vault to the knowledge-management skill's own `init`, and write `.alter-ego/manifest.yaml`
  (decision-014).
- The system SHALL treat `plugin.json`'s `version` as the single source of truth and
  record a per-skill/per-primitive `seededVersion` in the manifest for per-artifact
  diffing, rather than stamping the plugin version into user/vault-owned front matter
  (decision-014).
- WHEN both alter-ego and the-loop are present, `alter-ego:init` SHALL compose — register
  the alter-ego skills in the target repo's `.the-loop/external-tools.md` (idempotent,
  append-only) and touch nothing else the-loop owns; the two plugins keep independent
  manifests (decision-014, decision-011).
- WHEN upgrading, `alter-ego:upgrade` SHALL diff the manifest's `alterEgoVersion` against
  `plugin.json`, reconcile only `managed: true` artifacts (vault `schema.md` conventions,
  config schemas), and never rewrite user-owned content (notes, sources, filled config
  values) — config *schema* migrations preserve every user value and report removed keys
  rather than dropping them (decision-014).
- WHEN a vault-format change applies, the system SHALL migrate it review-gated
  (flag → approve → migrate) with one `log.md` entry per migration, using the vault's
  self-describing `schema.md` as the from/to target — the same discipline as the rest of
  the knowledge skill (decision-014, decision-003).
- The system SHALL offer the knowledge-management `validate` lint as a post-migration
  health check, opt-in and never auto-run (decision-014).
- The system SHALL be idempotent and manifest-loss tolerant: re-runs reconcile rather
  than clobber, and `upgrade` can reconstruct a best-effort manifest by inspecting a repo
  whose manifest is missing (decision-014).

## Design

- Skill entry points: [`skills/init/SKILL.md`](../../skills/init/SKILL.md),
  [`skills/upgrade/SKILL.md`](../../skills/upgrade/SKILL.md)
- Manifest format + version-stamping model:
  [`skills/init/reference/manifest.md`](../../skills/init/reference/manifest.md);
  schema [`skills/init/manifest.schema.json`](../../skills/init/manifest.schema.json);
  seed [`skills/init/templates/manifest.yaml`](../../skills/init/templates/manifest.yaml)
- Skill detection: [`skills/init/reference/detection.md`](../../skills/init/reference/detection.md);
  the-loop composition: [`skills/init/reference/composition.md`](../../skills/init/reference/composition.md)
- Managed/user-owned reconciliation:
  [`skills/upgrade/reference/reconciliation.md`](../../skills/upgrade/reference/reconciliation.md);
  vault-format migration:
  [`skills/upgrade/reference/vault-migration.md`](../../skills/upgrade/reference/vault-migration.md)

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-7 | Initial `alter-ego:init` + `alter-ego:upgrade` lifecycle skills: manifest, version stamping via `seededVersion`, managed vs. user-owned reconciliation, review-gated vault migration, the-loop composition | [issue #7](https://github.com/MadaraUchiha-314/alter-ego/issues/7), [decision-014](../decisions/decision-014.md) |
