# Decision 016: automate plugin versioning with a zero-dependency semantic release, enforced at PR time

- **Status:** accepted
- **Date:** 2026-07-21
- **Deciders:** @MadaraUchiha-314 (issue #8)
- **Work item:** issue-8

## Context

After #6 the plugin version lives in one place — `.claude-plugin/plugin.json` →
`version` — but nothing bumps it: there was no release automation and the repo had no CI.
The repo already standardises on conventional commits
(`.the-loop/config.yaml` → `hooks.commitConvention: conventional-commits`), so the history
is machine-bumpable in principle. Issue #8 asks for semantic-release-style automation on
merges to `main`, and raises three open questions (enforce commits at PR time? assist
breaking-change detection from the contracts? release every merge or batch?).

Two shaping facts: (1) the plugin ships **no** `package.json` or node toolchain — it is
markdown skills plus a JSON manifest; (2) most "features" land as markdown skills, so the
usual code signals for feat/breaking are absent and the convention has to be *stated*, not
inferred: a new/changed skill contract (SKILL.md operations, front-matter keys, a
`config.schema.json`) is `feat:` (or breaking when a key is removed/renamed); prose-only
edits are `docs:`.

## Decision

Add a **zero-dependency semantic release** driven by GitHub Actions and small owned Node
scripts under `.github/scripts/`, rather than adopting `semantic-release` itself.

- **`release.yml`** — on push to `main`: derive the bump from conventional commits since
  the last `v*` tag (`feat:`→minor, `fix:`/`perf:`/`revert:`→patch, `!`/`BREAKING CHANGE:`
  →major, everything else→no release), write `.claude-plugin/plugin.json` `version`,
  prepend `CHANGELOG.md`, commit `chore(release): v<x>`, tag `v<x>`, and cut the GitHub
  release. The bump commit is pushed with `GITHUB_TOKEN`, which by design does not
  re-trigger workflows, so it cannot loop.
- **Seed release.** With no `v*` tag yet, the first run tags the *current* version
  (`v0.1.0`) as the baseline instead of jumping to `1.0.0`. Later runs derive from commits
  after that tag. Keeps the pre-1.0 line honest.
- **`pr-validation.yml`** — on pull requests: a **blocking** lint that the PR *title* is a
  valid Conventional Commit (the squash-merge uses the title, which is exactly what
  `release.yml` later parses), plus an **advisory** contract-drift check.
- `plugin.json` stays the single source of truth (decision-014); tags/releases are the
  discrete points `alter-ego:upgrade` (#7) walks. #7 defines *what* an upgrade does; this
  defines *when a version exists* to upgrade to.

### Answers to the open questions

- **Enforce conventional commits at PR time? — Yes, on the PR title.** Squash-merge makes
  the PR title the commit the release derivation reads, so linting the title (not every
  intermediate commit) is both sufficient and what actually gates the bump. Blocking, so a
  malformed title can't silently become a no-release merge.
- **Assist breaking-change detection from the contracts? — Yes, but advisory, not
  enforced.** A check warns (a GitHub annotation, never a failure) when a PR touches a
  contract file (`SKILL.md`, any `*.schema.json`, `plugin.json`) under a no-release title,
  prompting the author to confirm the bump. Contract *intent* is a human call; a false
  "you forgot to bump" must not block a legitimately prose-only PR. A hard CI gate that
  diffs schema/front-matter key sets and *demands* a `!` was rejected as too brittle for a
  markdown plugin at this stage — the advisory captures most of the value without the
  false-positive tax, and can harden later if drift proves real.
- **Release cadence? — Every merge to `main`.** Simplest, and it keeps tag granularity
  aligned to `upgrade`'s per-version migration walk. Merges with no releasable commit
  (docs/chore) are no-ops, so this does not spam releases.

## Consequences

- Versioning is automatic and legible: the version, changelog, tag, and GitHub release all
  follow from commit messages, and the whole mechanism is ~4 small owned files a reader can
  audit in one sitting — no `node_modules`, no plugin stack, no lockfile to trust.
- The convention now has teeth: a non-conventional PR title fails the merge, so the bump
  derivation is trustworthy going forward (past merge titles predate the gate and are
  covered by the seed baseline).
- The release job pushes a commit and tag to `main`; branch protection must allow the
  Action to push (or the job needs a PAT). Documented in the capability doc as an operational
  requirement.
- Owning the parser means owning its edge cases; mitigated by keeping it to the
  conventional-commit subset the repo actually uses and by the derivation being
  `--dry-run`-previewable.

## Alternatives considered

- **Adopt `semantic-release` proper** (with `@semantic-release/exec` to write
  `plugin.json`) — rejected: it targets `package.json` natively, and wiring it to a
  markdown plugin means introducing a `package.json`, a lockfile, and a stack of release
  plugins to mutate a single JSON field. That contradicts the repo's minimalism value and
  adds a supply-chain surface disproportionate to the job.
- **A hard contract-diff gate demanding `!` on schema/front-matter changes** — rejected for
  now: brittle against markdown/JSON reshuffles, high false-positive rate, and it puts a
  machine in charge of a semantic judgment. Kept as an advisory that a human resolves.
- **Batched / manual releases** — rejected: reintroduces the "bumped manually (or not at
  all)" gap #8 exists to close, and desyncs tags from `upgrade`'s per-version walk.
- **Enforce every commit on the branch, not just the title** — unnecessary under
  squash-merge and hostile to work-in-progress commits; the title is the only message that
  survives onto `main`.
