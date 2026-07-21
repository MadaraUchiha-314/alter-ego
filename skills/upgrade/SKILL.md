---
name: upgrade
description: Bring a repo current with the alter-ego plugin as new versions release — diff the installed manifest against the current plugin version, reconcile managed files (config schemas, vault schema.md conventions) while never touching user-owned content (notes, sources, filled configs), and migrate vault-format changes review-gated with a log entry per migration. Use for "upgrade alter-ego", "update the alter-ego plugin in this repo", "migrate the vault to the new format", "alter-ego:upgrade".
---

# alter-ego:upgrade

The path forward as the plugin releases. Reads `.alter-ego/manifest.yaml`, compares the
installed version to the current `plugin.json` version, and reconciles what the plugin
owns — **never** what the user owns. Rationale: issue
[#7](https://github.com/MadaraUchiha-314/alter-ego/issues/7).

Same discipline as the knowledge skill it upgrades: **flag → approve → migrate**, one
`log.md` entry per vault migration. Nothing destructive happens without a review gate.

## Preconditions

- `.alter-ego/manifest.yaml` present. Missing → the repo was never `init`-ed (or the
  manifest was deleted); offer to run `alter-ego:init` first, or reconstruct a manifest
  by inspecting the repo (see `reference/reconciliation.md`), then upgrade.
- A clean-ish working tree, so the reconciliation diff is reviewable and revertable.

## Procedure

### 1. Diff versions

Read `alterEgoVersion` from the manifest and `version` from `.claude-plugin/plugin.json`.
Equal → report "already current," stop. Installed newer than plugin → warn (downgrade),
do nothing without explicit confirmation. Otherwise gather every version between the two
and plan the reconciliation. Per-artifact granularity comes from `seededVersion` on each
skill/primitive — see `reference/reconciliation.md`.

### 2. Plan the reconciliation (managed only)

Walk the manifest and build a plan touching **only `managed: true` artifacts**:

- **Config schemas** — the plugin-side `config.schema.json` files. If a schema changed
  (key added/renamed/removed), the repo's config *values* may need a migration; stage it
  but do not apply yet.
- **Vault `schema.md`** — if the current plugin's vault conventions differ from the
  `seededVersion` the vault carries, stage a `schema.md` reconciliation.
- **The manifest** — new skills the plugin now ships get offered (delegating to
  `alter-ego:init`'s offer step); `alterEgoVersion`/`updated` get bumped at the end.

Everything `managed: false` — notes, source records, filled config values, free-form
`external-tools.md` — is **off-limits to reconciliation**. See
`reference/reconciliation.md` for the full managed/user-owned boundary and how config
*schema* migrations touch a user's config file safely.

### 3. Review gate — never skip

Present the plan: what changes, which files, why (which version introduced it), and for
config migrations the exact key-level edits. The user approves, edits, or rejects each
item. This is the same gate the knowledge skill uses for content changes — upgrade
inherits it.

### 4. Migrate

Apply approved items:

- **Vault-format changes** — follow `reference/vault-migration.md`: migrate `schema.md`
  to the new conventions and any front-matter/version fields it introduces, from the
  self-describing old `schema.md` as the from-target. Append **one `log.md` entry per
  migration** (`schema-change`/`repair` operation) so the vault chronicles it, exactly
  as any other vault mutation.
- **Config schema migrations** — apply the staged key-level edits to the repo's config,
  preserving every user value; a removed key is reported, never silently dropped.
- **New skills** — run the offer step for anything the user accepts.

### 5. Health check (offer, don't force)

Offer to run the `knowledge-management` `validate` lint as a post-migration health check
— it confirms the migrated vault still satisfies its contract (front matter, links,
citations, staleness) and surfaces anything the migration disturbed. Opt-in, because
`validate` can flag many notes for review; never auto-run it as part of upgrade.

### 6. Update the manifest and report

Bump `alterEgoVersion` to the plugin version, set `updated` to today, raise each
reconciled artifact's `seededVersion`. Report what migrated, what the user deferred, and
any `needs-review` flags the health check raised. One commit, message naming the
version span (e.g. `alter-ego 0.1.0 → 0.2.0`).

## Boundaries

- upgrade reconciles **plugin-owned conventions**. It never edits knowledge, config
  *values*, or code. Filled configs, notes and sources survive every upgrade untouched.
- No silent migrations. Every content-affecting change is reviewed; every vault change is
  logged. A migration you cannot explain at the review gate is one you do not apply.
- Losing the manifest is recoverable, not fatal — `reference/reconciliation.md` covers
  reconstructing state from the repo when the manifest is absent or stale.
