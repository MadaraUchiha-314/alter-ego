# The manifest and the version-stamping model

`.alter-ego/manifest.yaml` is the plugin's state in a repo: what it created, at what
version, and which files it may reconcile later. `alter-ego:init` writes it;
`alter-ego:upgrade` reads and updates it. Schema: `manifest.schema.json`; seed:
`templates/manifest.yaml`.

## Version stamping — the decision

**`plugin.json`'s `version` is the single source of truth for "current plugin
version."** Seeded artifacts do **not** each carry the plugin version in their own front
matter. Instead the manifest records a `seededVersion` per skill and per primitive, so
`upgrade` can diff *per artifact* from one place — without polluting every note, source
record or config with a plugin-version field that the vault's own contract does not own.

Why not stamp every artifact:

- Notes and source records are user/skill-owned content; the knowledge vault's
  `schema.md` governs their front matter, not this plugin. Adding an `alterEgoVersion`
  to each would leak plugin bookkeeping into user data and fight the vault contract.
- The vault's `schema.md` is already self-describing and is the natural migration
  target; the manifest records which plugin version last reconciled it. That is enough
  granularity for `upgrade` to know what to migrate, per-primitive, without touching
  content it doesn't own.

So: one plugin version in `plugin.json`; one `alterEgoVersion` snapshot in the manifest
per pass; one `seededVersion` per managed artifact for per-artifact diffing.

## Managed vs. user-owned

The single most important distinction — it is what lets `upgrade` be safe.

- **`managed: true`** — the plugin authored this and may reconcile its *conventions* on
  upgrade (review-gated): the vault `schema.md`, config *schemas* (the `.json`, which
  live in the plugin, not the repo), the manifest itself.
- **`managed: false`** — user/skill-owned. `upgrade` never rewrites it: filled config
  *values* (`knowledge.config.yaml`), vault `index.md`/`log.md`, notes, source records,
  `external-tools.md` free-form content. A config's values are user-owned even though
  its schema is managed — only a schema *migration* (adding/renaming a key) touches the
  file, and only after review.

## What goes in the manifest

- `manifestVersion` — schema version of the manifest file.
- `alterEgoVersion` — `plugin.json` version at the last init/upgrade.
- `initialized` / `updated` — first-init date, last-pass date.
- `skills[]` — each considered skill, `enabled`, its config (path, `present`, `managed:
  false`, and the plugin-side `schema`), and `seededVersion`.
- `primitives[]` — seeded primitives (the vault), each with `root`, `seededVersion`, and
  a `files[]` list marking each seeded file `managed` or not.
- `integrations` — composition state (`the-loop.present`, `the-loop.registered`).

## Rules

- **Idempotent writes.** Re-running init reconciles entries and bumps `updated`; it never
  rewrites `initialized` or drops a user's declined-skill record.
- **Truthful.** If a file was skipped because it already existed, the manifest still
  lists it (with its real `managed` flag) — the manifest describes reality, not intent.
- **Never a lock.** The manifest is a convenience for `upgrade`; a repo whose manifest is
  deleted still works. `upgrade` can rebuild one by inspecting the repo, just less
  precisely.
