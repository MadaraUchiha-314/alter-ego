# CLAUDE.md

## Mandatory workflow: the-loop

Every work item in this repo — feature, fix, retro follow-up, docs change — goes
through **the-loop** (config: `.the-loop/config.yaml`; workflow `kiro-3-phase`,
decision-018). Do not implement directly from an issue:

1. **Spec first.** Write `requirements.md` → `design.md` → `tasks.md` under
   `docs/specs/<work-item>/`, from the templates in `.the-loop/templates/`, each
   phase human-reviewed before the next (`requireHumanReviewPerPhase: true`).
2. **Then implement**, following the approved tasks DAG.
3. **A PR is incomplete without its spec artifacts.** If work somehow shipped
   without them, backfill the spec onto the PR before merge.

Scope note (decision-011): the-loop governs work *on* this repo — building alter-ego
itself. The alter-ego skills this repo ships remain independent of the-loop when they
run in target repos, and never chain into it.

## Conventions

- Conventional commits; the PR title is commitlint-gated and becomes the release
  commit on squash-merge (`feat:`/`fix:` drive semantic-release, decision-016).
- Durable choices get a record in `docs/decisions/` (+ index row); capability changes
  update `docs/capabilities/` behaviour bullets and history tables.
- Learnings from user/system feedback land in `learnings/` (+ index row).
