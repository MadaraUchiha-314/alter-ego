# Capability: release-automation

> How the plugin version is derived, tagged, and released — automatically, with
> [semantic-release](https://semantic-release.gitbook.io/), from Conventional Commits on
> every merge to `main`. Config lives in `.releaserc.json` / `.commitlintrc.json` /
> `package.json`; rationale in [decision-016](../decisions/decision-016.md) (issue #8).

## What it is

`.claude-plugin/plugin.json` `version` is the single source of truth (decision-014), but
nothing bumped it. This capability makes the bump a function of the commit history using the
standard off-the-shelf toolchain: **semantic-release** for the release, **commitlint** for
enforcement, **commitizen** for authoring. On merge to `main` it derives the next version,
writes `plugin.json` and the changelog, tags `v<version>`, and cuts a GitHub release. Those
tags/releases are the discrete points `alter-ego:upgrade` walks (issue #7): #7 defines *what*
an upgrade does, this defines *when a version exists* to upgrade to.

The only bespoke code is `scripts/set-version.ts` — a small TypeScript script that stamps the
computed version into `plugin.json`, because semantic-release has no native writer for a
non-`package.json` version file. Everything else is off-the-shelf plugins configured as data.

## Current behaviour

- The system SHALL derive the release bump with `@semantic-release/commit-analyzer` from
  Conventional Commits since the last tag: `feat:` → **minor**, `fix:`/`perf:` → **patch**,
  a `!` marker or a `BREAKING CHANGE:` footer → **major**, and other types (`docs:`,
  `chore:`, `style:`, `refactor:`, `test:`, `build:`, `ci:`) → **no release**.
- The convention SHALL be stated, not inferred: a new/changed **skill contract**
  (SKILL.md operations, front-matter keys, a `config.schema.json`) is `feat:` — or breaking
  (`!`) when a key is removed or renamed — while prose-only edits are `docs:`.
- WHEN a bump is derived, `release.yml` SHALL: stamp `plugin.json` `version` (via
  `@semantic-release/exec` → `scripts/set-version.ts`), update `CHANGELOG.md` (via
  `@semantic-release/changelog`), commit both (via `@semantic-release/git`), tag
  `v<version>`, and create the matching GitHub release (via `@semantic-release/github`).
  WHEN no releasable commit exists, semantic-release SHALL do nothing.
- The release commit SHALL be pushed with `GITHUB_TOKEN` (which does not re-trigger
  workflows) and carry `[skip ci]`, so the release cannot loop.
- At PR time `pr-validation.yml` SHALL **block** a merge whose PR *title* is not a valid
  Conventional Commit, enforced with `@commitlint/cli` — squash-merge makes the title the
  commit semantic-release later reads.
- The system SHALL NOT publish to any package registry (`@semantic-release/npm` is not used);
  `plugin.json` is the only version artifact.

## Operating it

- **One-time bootstrap.** semantic-release, seeing no tag, would start the first release at
  `1.0.0`. To keep the plugin on its pre-1.0 line, create the anchor tag once after this
  merges:

  ```sh
  git tag v0.1.0 <merge-commit-sha> && git push origin v0.1.0
  ```

  Subsequent releases derive from commits after it.
- **Merge method: squash.** The PR title becomes the `main` commit that both commitlint and
  semantic-release read. Repo settings should default to squash-merge.
- **Branch protection.** `release.yml` pushes the bump commit and tag back to `main`, so
  protection must allow the Action to push (or the job must be given a PAT). This is the one
  operational prerequisite.
- **Authoring commits.** `npm run commit` launches commitizen for a guided Conventional
  Commit; `npm run commitlint` lints locally.
- **Preview locally.** `npx semantic-release --dry-run --no-ci` prints what a release from
  `main` would produce, publishing nothing.
- **No-op merges are fine.** A `docs:`/`chore:` merge derives no bump and releases nothing.

## Design

- Release workflow: [`.github/workflows/release.yml`](../../.github/workflows/release.yml)
  (push to `main`, runs `semantic-release`).
- PR check: [`.github/workflows/pr-validation.yml`](../../.github/workflows/pr-validation.yml)
  (blocking commitlint over the PR title).
- semantic-release config: [`.releaserc.json`](../../.releaserc.json); commitlint config:
  [`.commitlintrc.json`](../../.commitlintrc.json); toolchain + commitizen config:
  [`package.json`](../../package.json).
- Version writer: [`scripts/set-version.ts`](../../scripts/set-version.ts).
- Consumer side (what tags/releases feed): the plugin-lifecycle capability
  [`plugin-lifecycle.md`](./plugin-lifecycle.md) and `alter-ego:upgrade`.

## History

| Work item | What changed | Links |
|-----------|--------------|-------|
| issue-8 | Semantic release on merge to `main` via off-the-shelf tooling: `semantic-release` (bump, changelog, `plugin.json` stamp, tag, GitHub release), blocking `commitlint` PR-title check, `commitizen` authoring; TypeScript `set-version.ts` as the only glue | [issue #8](https://github.com/MadaraUchiha-314/alter-ego/issues/8), [PR #12](https://github.com/MadaraUchiha-314/alter-ego/pull/12), [decision-016](../decisions/decision-016.md) |
