# Reconciliation: managed vs. user-owned

Upgrade's whole safety rests on one line: **reconcile what the plugin owns, never what
the user owns.** The manifest's `managed` flags are how that line is drawn per file.

## The two sides

| Side | Examples | Upgrade may… |
|------|----------|--------------|
| **Managed** (`managed: true`) | vault `schema.md`; the plugin-side `config.schema.json` files; the manifest itself | reconcile *conventions* to the new plugin version, review-gated |
| **User-owned** (`managed: false`) | filled config *values* (`knowledge.config.yaml`); vault `index.md`, `log.md`, all `notes/` and `sources/`; free-form `external-tools.md` | never rewrite; only append where the format is append-only (the vault `log.md`) |

The subtle case: a config file. Its **schema** (in the plugin) is managed; its **values**
(in the repo) are user-owned. So upgrade never rewrites the config wholesale — it applies
only the *schema delta* (below) and preserves every value.

## Per-artifact diffing

Granularity comes from `seededVersion`, recorded per skill and per primitive in the
manifest. Upgrade compares each artifact's `seededVersion` to the current plugin version
independently, so a vault seeded at 0.1.0 and a config schema already at 0.2.0 each
migrate (or not) on their own — no all-or-nothing jump. `alterEgoVersion` is only the
repo-wide snapshot; `seededVersion` is the real diff target.

## Config schema migration

When a skill's `config.schema.json` changed between the installed and current version:

1. **Compute the key delta** — added keys (with new defaults), renamed keys, removed
   keys, changed enums/constraints.
2. **Map onto the repo's config**, preserving values: added keys appear commented at
   their default (the user opts in), renamed keys carry the user's existing value across,
   removed keys are **reported, never silently deleted** — the user decides.
3. **Present the exact edits** at the review gate; apply only what's approved.
4. A config file that is absent (skill on defaults) needs no migration — note it and move
   on.

## Vault schema reconciliation

If the plugin's vault conventions advanced past the vault's `seededVersion`, stage a
`schema.md` reconciliation and hand it to `vault-migration.md`. The old `schema.md` is
self-describing, so it is the from-target; the new plugin templates are the to-target.
Content in `notes/`/`sources/` is user-owned and only migrates when the format change
*requires* it (e.g. a new required front-matter field), and then still review-gated and
logged.

## Reconstructing a missing manifest

No `.alter-ego/manifest.yaml` (deleted, or the repo predates it): don't guess blindly.
Rebuild by inspection —

- vault present at a configured `vault.path` → a `knowledge-vault` primitive; read its
  `schema.md` for the conventions version it looks like it carries;
- a `*.config.yaml` at the root → that skill enabled, config `present: true`;
- `.the-loop/` present → set the integration flags.

Write the reconstructed manifest, flag in the report that it was reconstructed (so the
version baseline is best-effort, not authoritative), then proceed with the normal
review-gated upgrade.

## Idempotence

Re-running upgrade at the same version is a no-op that only bumps `updated`. A partially
applied upgrade (user deferred some items) leaves each artifact's `seededVersion` at what
was actually reconciled, so the next run picks up exactly the deferred remainder.
