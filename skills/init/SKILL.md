---
name: init
description: Set up a repo for the whole alter-ego plugin in one pass — detect which alter-ego skills apply, offer each one's config file, seed the shared knowledge vault, and write a manifest of what was created (managed vs user-owned) so upgrades know what exists. Use for "set up alter-ego", "initialize this repo for alter-ego", "add the alter-ego plugin to this project", "alter-ego:init".
---

# alter-ego:init

One pass that makes a repo ready for every alter-ego skill, instead of the user
discovering configs and seeding primitives one skill at a time. Writes
`.alter-ego/manifest.yaml` — the record `alter-ego:upgrade` reads later. Rationale:
issue [#7](https://github.com/MadaraUchiha-314/alter-ego/issues/7).

Idempotent. Re-running never clobbers user content: it fills gaps, reports what already
exists, and leaves filled configs, notes and sources untouched.

## What init owns vs. what it delegates

init is the **plugin-wide setup pass**. It does not re-implement per-skill logic — it
routes to it. Seeding the knowledge vault is the `knowledge-management` skill's `init`
operation; init just decides the vault should exist and delegates. init owns only:
the manifest, the config-offer step, and composition with other plugins.

## Procedure

### 1. Read the plugin version

Read `version` from `.claude-plugin/plugin.json` (source of truth). Every artifact init
stamps in the manifest carries this as its `seededVersion`. See
`reference/manifest.md` for the version-stamping model.

### 2. Detect which skills apply

Enumerate `skills/*/SKILL.md` in the plugin. For each, decide whether it applies to
this repo per `reference/detection.md` — some primitives (the knowledge vault) benefit
every repo; others are opt-in by the kind of work the repo does. Ask the user to
confirm the set; never silently enable everything.

### 3. Offer each applicable skill's config

For every enabled skill that ships a `config.example.yaml`, offer to write its config
file to the repo root (`knowledge.config.yaml`, `meeting-artifacts.config.yaml`, …):

- Read the skill's `config.example.yaml` for structure; write a filled starting config
  with this repo's real name/paths baked in. **Never copy the blank example verbatim**
  (the-loop#36) and never write a config outside the repo root.
- A skill runs fine with no config file (each falls back to documented defaults). Offer,
  don't force — record `present: false` in the manifest when the user declines.
- File already present → validate it against the skill's `config.schema.json`, report,
  leave its values alone.

### 4. Seed shared primitives

The knowledge vault is the primitive worth having up front — producer skills
(`meeting-to-artifacts`) and queries all expect it. Delegate to
`knowledge-management`'s `init` operation (it seeds `schema.md`, `index.md`, `log.md`,
`sources/`, `notes/` from its own templates with real values). If a vault already exists
at the configured `vault.path`, skip and record it. Do not seed a vault in a repo where
no skill will use one.

### 5. Compose with other plugins

If the repo has a `.the-loop/` directory, **compose, don't duplicate** — see
`reference/composition.md`. Register the enabled alter-ego skills in the target repo's
`.the-loop/external-tools.md` (idempotently; skip entries already present) so the-loop
is aware it may use them. Never seed or modify the-loop's own managed files, and never
run `/the-loop:init` from here.

### 6. Write the manifest

Write `.alter-ego/manifest.yaml` from `templates/manifest.yaml`, filled with real
values: the plugin version as `alterEgoVersion`, today's date, and only the
skills/primitives actually set up — each stamped with `seededVersion`, each file marked
`managed` or user-owned per `reference/manifest.md`. Validate against
`manifest.schema.json`. On a re-run, update `updated` and reconcile entries rather than
rewriting history. This file is the contract `upgrade` depends on.

### 7. Report

Summarize what was created, what already existed, what the user declined, and what to do
next (fill the offered configs, run `alter-ego:upgrade` when the plugin releases a new
version). One commit; do not commit secrets — configs hold paths and server names, not
credentials.

## Boundaries

- init sets a repo **up**; it never ingests knowledge, processes meetings, or writes
  code. Those are the individual skills' jobs, run afterward.
- The manifest tracks alter-ego's own artifacts only. User content the skills later
  create (notes, sources, filled config values) is never "managed" — see
  `reference/manifest.md`.
- Everything init writes is plain files. Losing the plugin loses nothing: the vault, the
  configs and the manifest all remain readable and hand-editable.
