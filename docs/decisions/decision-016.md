# Decision 016: automate plugin versioning with semantic-release, enforced at PR time with commitlint

- **Status:** accepted
- **Date:** 2026-07-21
- **Deciders:** @MadaraUchiha-314 (issue #8, PR #12 review)
- **Work item:** issue-8

## Context

After #6 the plugin version lives in one place — `.claude-plugin/plugin.json` →
`version` — but nothing bumps it: there was no release automation and the repo had no CI.
The repo already standardises on conventional commits
(`.the-loop/config.yaml` → `hooks.commitConvention: conventional-commits`), so the history
is machine-bumpable. Issue #8 asks for semantic-release-style automation on merges to
`main`, and raises three open questions (enforce commits at PR time? assist breaking-change
detection from the contracts? release every merge or batch?).

The first cut of this work hand-rolled the bump derivation and commit linting as custom
Node scripts, to avoid pulling a node toolchain into a markdown plugin. The maintainer
rejected that on review (PR #12): prefer an **out-of-the-box** solution (commitlint /
commitizen), and **prefer TypeScript** over hand-written JS. This decision records the
resulting approach.

## Decision

Adopt the standard off-the-shelf toolchain, configured declaratively, with the one
unavoidable piece of glue written in TypeScript:

- **Releases — `semantic-release`.** On push to `main`, `release.yml` runs
  `semantic-release`, which derives the bump from Conventional Commits since the last tag
  (`feat:`→minor, `fix:`/`perf:`→patch, `!`/`BREAKING CHANGE:`→major, others→no release),
  generates release notes, updates `CHANGELOG.md` (`@semantic-release/changelog`), stamps
  `.claude-plugin/plugin.json` (`@semantic-release/exec` → `scripts/set-version.ts`),
  commits both (`@semantic-release/git`), and tags + publishes the GitHub release
  (`@semantic-release/github`). No `@semantic-release/npm` — nothing is published to a
  registry; `plugin.json` stays the single source of truth (decision-014).
- **`plugin.json` writer — `scripts/set-version.ts`.** semantic-release has no native
  writer for a non-`package.json` version file, so `@semantic-release/exec` invokes a small
  TypeScript script to stamp it. This is the only bespoke code in the release path.
- **Commit convention — `commitlint` + `commitizen`.** `pr-validation.yml` runs
  `@commitlint/cli` (config `@commitlint/config-conventional`) over the **PR title**;
  `commitizen` (`npm run commit`) is offered for authoring. Config is declarative
  (`.releaserc.json`, `.commitlintrc.json`) — no hand-written JS.
- The bump commit is pushed with `GITHUB_TOKEN` (which does not re-trigger workflows) and
  carries `[skip ci]`, so the release cannot loop.

### Answers to the open questions

- **Enforce conventional commits at PR time? — Yes, on the PR title, via commitlint.**
  Squash-merge makes the PR title the commit semantic-release later parses, so linting the
  title is both sufficient and exactly what gates the bump. Blocking.
- **Assist breaking-change detection from the contracts? — Deferred.** The first cut
  included a bespoke advisory check that warned when a `SKILL.md`/schema changed under a
  no-release title. It was dropped to honour the "why custom code" review point: there is no
  off-the-shelf equivalent, and the value did not justify carrying custom code against the
  maintainer's stated preference. The convention that a changed skill contract is
  `feat:`/breaking is documented (capability doc) and enforced socially, not by a CI gate.
  Can be revisited if drift proves real.
- **Release cadence? — Every merge to `main`.** semantic-release's default; no-op for
  docs/chore merges, and it keeps tag granularity aligned to `alter-ego:upgrade`'s
  per-version migration walk (#7).

### Pre-1.0 baseline

semantic-release, finding no prior tag, would make the first release `1.0.0`. To keep the
plugin on its pre-1.0 line, a one-time anchor tag `v0.1.0` is created on `main` (matching
the current `plugin.json`) before the first automated release; subsequent releases derive
from commits after it. Documented as an operational step in the capability doc.

## Consequences

- Versioning is automatic and built on a maintained, widely-audited toolchain rather than
  bespoke parsing: less code to own, standard behaviour contributors already know.
- The plugin now carries a `package.json` + `package-lock.json` and a `node_modules` dev
  install in CI — a toolchain footprint the markdown plugin did not previously have. Scoped
  to `devDependencies` and CI; the shipped plugin is unaffected.
- The release job pushes a commit and tag to `main`, so branch protection must allow the
  Action (or `semantic-release`'s bot) to push. Documented as a prerequisite.
- Open question 2 (contract-drift assist) is intentionally unshipped; the breaking-change
  convention rests on author discipline plus the commitlint-gated title.

## Alternatives considered

- **Hand-rolled Node scripts** (the first cut of this PR) — rejected on review: reimplements
  what semantic-release/commitlint already do, and runs against the maintainer's preference
  for off-the-shelf tools and TypeScript over bespoke JS.
- **`release-please`** — viable (release-PR flow, native non-`package.json` version files via
  `extra-files`). Not chosen: issue #8 frames the automation as firing *on merge to `main`*,
  which is semantic-release's model; release-please's accumulate-then-merge PR adds a step
  the issue did not ask for. Reasonable to revisit if a reviewable release PR is later
  wanted.
- **A hard contract-diff gate demanding `!` on schema/front-matter changes** — rejected:
  brittle for a markdown plugin and puts a machine in charge of a semantic judgment. See
  open question 2 above.
- **Batched / manual releases** — rejected: reintroduces the "bumped manually (or not at
  all)" gap #8 exists to close, and desyncs tags from `upgrade`'s per-version walk.
