# Capability: release-automation

> How the plugin version is derived, tagged, and released — automatically, from conventional
> commits, on every merge to `main`. Lives in [`.github/`](../../.github); rationale in
> [decision-016](../decisions/decision-016.md) (issue #8).

## What it is

`.claude-plugin/plugin.json` `version` is the single source of truth (decision-014), but
nothing bumped it. This capability makes the bump a function of the commit history: a
zero-dependency semantic release. On merge to `main` it derives the next version from
conventional commits since the last tag, writes `plugin.json`, updates the changelog, tags
`v<version>`, and cuts a GitHub release. Those tags/releases are the discrete points
`alter-ego:upgrade` walks (issue #7): #7 defines *what* an upgrade does, this defines *when
a version exists* to upgrade to.

It is deliberately **not** `semantic-release` — the plugin ships no `package.json`/node
toolchain, so it owns ~4 small scripts instead of pulling in a release-plugin stack to write
one JSON field (decision-016).

## Current behaviour

- The system SHALL derive the release bump from Conventional Commits since the last `v*`
  tag: `feat:` → **minor**, `fix:`/`perf:`/`revert:` → **patch**, a `!` marker or a
  `BREAKING CHANGE:` footer → **major**, and all other types (`docs:`, `chore:`, `style:`,
  `refactor:`, `test:`, `build:`, `ci:`) → **no release** (decision-016).
- The convention SHALL be stated, not inferred: a new/changed **skill contract**
  (SKILL.md operations, front-matter keys, a `config.schema.json`) is `feat:` — or breaking
  (`!`) when a key is removed or renamed — while prose-only edits are `docs:`.
- WHEN there is no `v*` tag yet, the first run SHALL **seed** the baseline by tagging the
  current `plugin.json` version (`v0.1.0`) rather than jumping to `1.0.0`; subsequent runs
  derive from commits after that tag.
- WHEN a bump is derived, the release job SHALL write `plugin.json` `version`, prepend a
  dated `CHANGELOG.md` section (grouped Features / Bug Fixes / Performance / Reverts, plus a
  BREAKING CHANGES list), commit `chore(release): v<version>`, tag `v<version>`, and create
  the matching GitHub release. WHEN no releasable commit exists, it SHALL do nothing.
- The release commit SHALL be pushed with `GITHUB_TOKEN`, which does not re-trigger
  workflows, so the release cannot loop; a `chore(release):` head-commit guard backs this up.
- At PR time the system SHALL **block** a merge whose PR *title* is not a valid Conventional
  Commit (squash-merge makes the title the commit the derivation later reads), and SHALL
  emit an **advisory, non-blocking** warning when a PR touches a contract file
  (`SKILL.md`, `*.schema.json`, `plugin.json`) under a no-release title (decision-016).

## Operating it

- **Merge method: squash.** The PR title becomes the `main` commit and is what both the
  linter and the release derivation read. Repo settings should default to squash-merge.
- **Branch protection.** `release.yml` pushes the bump commit and tag back to `main`, so
  protection must allow the GitHub Action to push (or the job must be given a PAT). This is
  the one operational prerequisite.
- **Preview locally.** `node .github/scripts/derive-release.mjs --dry-run` prints the bump
  and rendered notes the next push would produce, touching no files.
- **No-op merges are fine.** A `docs:`/`chore:` merge derives no bump and releases nothing.

## Design

- Release workflow: [`.github/workflows/release.yml`](../../.github/workflows/release.yml)
  (push to `main`).
- PR checks: [`.github/workflows/pr-validation.yml`](../../.github/workflows/pr-validation.yml)
  — blocking title lint + advisory contract-drift.
- Bump + changelog derivation:
  [`.github/scripts/derive-release.mjs`](../../.github/scripts/derive-release.mjs), built on
  the shared parser [`.github/scripts/conventional.mjs`](../../.github/scripts/conventional.mjs).
- PR-time enforcement:
  [`.github/scripts/lint-commits.mjs`](../../.github/scripts/lint-commits.mjs) and the
  advisory [`.github/scripts/check-contract-drift.mjs`](../../.github/scripts/check-contract-drift.mjs).
- Consumer side (what tags/releases feed): the plugin-lifecycle capability
  [`plugin-lifecycle.md`](./plugin-lifecycle.md) and `alter-ego:upgrade`.

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-8 | Zero-dependency semantic release on merge to `main`: conventional-commit bump derivation, seed baseline, `plugin.json`/changelog/tag/GitHub-release automation, blocking PR-title lint, advisory contract-drift check | [issue #8](https://github.com/MadaraUchiha-314/alter-ego/issues/8), [decision-016](../decisions/decision-016.md) |
