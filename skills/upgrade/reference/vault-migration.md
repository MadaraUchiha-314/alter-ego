# Vault-format migration

When a plugin release changes the knowledge vault's format — new `schema.md` conventions,
a new or renamed front-matter field, a new registered note type — `upgrade` migrates the
vault the same way the knowledge skill mutates anything: **flag → approve → migrate**,
with one `log.md` entry per migration. The vault's self-describing `schema.md` plus
front-matter versioning give a concrete from/to target.

## From-target and to-target

- **From** — the vault's current `schema.md` (self-describing) and the `seededVersion`
  the manifest records for the `knowledge-vault` primitive. That pair says what
  conventions the vault currently carries.
- **To** — the current plugin's `skills/knowledge-management/templates/schema.md` and
  reference docs. The delta between them is the migration.

## Procedure

1. **Flag.** Compute the format delta and identify every file it affects: always
   `schema.md`; sometimes `notes/`/`sources/` files if a front-matter field was
   added/renamed/made required. Produce a review report — what changes, which files, and
   what each note needs — without editing anything yet. This mirrors the knowledge skill's
   `validate`: flag, never fix silently.
2. **Approve.** Present the report. The user approves, edits, or defers. A migration that
   rewrites many notes gets the same scrutiny as the knowledge skill's `consolidate` — it
   is the same kind of wide, review-gated change.
3. **Migrate.**
   - Update `schema.md` to the new conventions (it is `managed`), keeping the vault's
     real name/dates and any `Local conventions` the user added.
   - For a front-matter change, apply the minimal per-note edit: add the field at its
     default, carry a renamed field's value across, never drop a field's value without
     reporting it. Notes stay user-owned — touch only what the format change strictly
     requires.
   - Preserve the two-layer contract: `sources/` stays immutable (append/refresh
     metadata only, never rewrite a source record's captured content).
4. **Log.** Append **one `log.md` entry per migration** — operation `schema-change` (or
   `repair` for a mechanical front-matter sweep), summary, files touched, and the version
   span. The vault chronicles its own format change; upgrade does not bypass the log.
5. **Stamp.** Raise the `knowledge-vault` primitive's `seededVersion` in the manifest to
   the plugin version just migrated to.

## Front-matter versioning

Notes and source records do **not** carry the plugin version (that lives in the manifest
— see `skills/init/reference/manifest.md`). What they carry is the vault's own contract:
`type`, `status`, `updated`, etc. A format migration that introduces a new required field
adds it here, and `schema.md` — the vault's contract — is updated in the same pass to
register it. `schema.md` is always the authority a future migration reads to know "what
format is this vault in."

## After migrating

Offer the `knowledge-management` `validate` lint as a health check (SKILL step 5): it
re-checks front matter, links, citations and staleness across the migrated vault and
flags anything the sweep disturbed. Opt-in — `validate` can set many notes to
`needs-review`, which is a legitimate outcome to surface, not to suppress.
