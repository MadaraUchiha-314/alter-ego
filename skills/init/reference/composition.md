# Composing with other plugins (the-loop)

Some repos run both alter-ego and the-loop. The rule is **compose, don't duplicate**
(decision-011: knowledge and code stay separate; the-loop is reserved for building
alter-ego itself, but a *different* repo may run the-loop for its own workflow and
alter-ego for its knowledge).

## What init does when `.the-loop/` exists

1. **Detect** the `.the-loop/` directory. Record `integrations.the-loop.present: true`
   in the manifest.
2. **Register, don't re-init.** Append the enabled alter-ego skills to the target repo's
   `.the-loop/external-tools.md` under `## Skills / plugins`, so the-loop's harness knows
   it may use them. This file is user-owned free-form (the-loop marks it
   `managed: false`): append only, idempotently — skip any skill already listed, never
   rewrite the user's prose. Set `integrations.the-loop.registered: true`.
3. **Stay out of the-loop's files.** Never seed or edit the-loop's managed files
   (`config.yaml`, `config.schema.json`, `manifest.yaml`, templates), and never invoke
   `/the-loop:init` or `/the-loop:upgrade-the-loop`. Each plugin owns its own manifest
   and lifecycle.

## Registration entry shape

Mirror the entries the-loop's own `external-tools.md` already uses — name, where the
skill lives, one line on what it's for and its boundary. Example:

```
- `knowledge-management` (alter-ego, `skills/knowledge-management/`) — maintains the
  Obsidian-compatible knowledge vault; use it to ingest/query/validate knowledge rather
  than inventing ad-hoc note structures.
```

## Why two manifests, not one

alter-ego's `.alter-ego/manifest.yaml` and the-loop's `.the-loop/manifest.yaml` track
different things and version independently. Merging them would couple two release
cadences and re-entangle the knowledge/code boundary decision-011 draws. The only
crossing point is the one-line registration in `external-tools.md`; everything else stays
in each plugin's own lane.

## When the-loop is absent

Nothing to compose. Record `integrations.the-loop.present: false` and move on — the
alter-ego skills are still discoverable directly as plugin skills.
