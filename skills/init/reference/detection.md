# Detecting which alter-ego skills apply

init offers a repo the skills that fit it, rather than switching everything on. The
plugin is the source of truth for *what exists*; the repo and the user decide *what
applies*.

## Enumerate from the plugin, never from a hardcoded list

Read `skills/*/SKILL.md` under the plugin root at run time. New skills appear here
automatically, so init never needs editing when the plugin grows. Skip the lifecycle
skills themselves (`init`, `upgrade`) — they are not repo-level capabilities.

## Classify each skill

| Class | Rule | Default |
|-------|------|---------|
| **Primitive** | Other skills read from / write into it (the knowledge vault). | Offer in every repo — seed up front. |
| **Producer / workflow** | Turns some input into artifacts (`meeting-to-artifacts`). | Offer; enable when the user confirms the repo does that kind of work. |

Signals that a producer skill applies (use as hints, then confirm — never auto-enable):

- an existing config file for it at the repo root;
- an existing output tree it targets (e.g. `knowledge/meetings/` — or the legacy
  `raw/meetings/` artifact layout — for `meeting-to-artifacts`);
- the skill's origin already registered in `knowledge.config.yaml` `sources`;
- the user naming that workflow when they ask to set the repo up.

## Confirm before enabling

Present the proposed set and let the user drop any of it (`AskUserQuestion` when the
choice is genuinely open). Enabling a skill only writes its config file and a manifest
entry — it costs nothing later if unused — but seeding a vault or registering with
another plugin is a real change, so those get explicit confirmation.

## Record the outcome

Every skill considered lands in the manifest `skills[]`: `enabled: true` with a config
entry, or `enabled: false` if the user declined. A declined skill is remembered so a
later `init`/`upgrade` re-offers it rather than assuming it was never seen.
