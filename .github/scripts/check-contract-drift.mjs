#!/usr/bin/env node
// Advisory contract-drift check (decision-016, open question 2).
//
// The plugin's "features" are markdown, so the usual code signals for a
// breaking change are absent. This assists — it does not enforce. When a PR
// touches a skill *contract* file (a SKILL.md, or any config.schema.json /
// *.schema.json) but the PR title declares a no-release type (docs/chore/...),
// it emits a GitHub warning annotation asking the author to confirm the bump.
// It never fails the build: contract intent is a human call, and a false
// "you forgot to bump" must not block a legitimately prose-only PR.
//
// Inputs: $PR_TITLE, and $CHANGED_FILES (newline-separated paths).

import { parseCommit, RELEASE_TYPES } from "./conventional.mjs";

const title = process.env.PR_TITLE ?? "";
const changed = (process.env.CHANGED_FILES ?? "")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const CONTRACT = [
  /(^|\/)SKILL\.md$/,
  /\.schema\.json$/,
  /(^|\/)plugin\.json$/,
];

const contractFiles = changed.filter((f) => CONTRACT.some((re) => re.test(f)));
if (!contractFiles.length) {
  console.log("No contract files changed; nothing to advise.");
  process.exit(0);
}

const parsed = parseCommit(title);
const declaresRelease = parsed && (parsed.breaking || RELEASE_TYPES[parsed.type]);

if (declaresRelease) {
  console.log(
    `Contract files changed and the PR declares a release (${parsed.breaking ? "major" : RELEASE_TYPES[parsed.type]}). Looks consistent.`,
  );
  process.exit(0);
}

const list = contractFiles.map((f) => `  - ${f}`).join("%0A");
console.log(
  `::warning title=Possible contract change without a release bump::` +
    `This PR changes skill-contract files but its title (%22${title}%22) declares no release.%0A` +
    `If a SKILL.md operation, front-matter key, or config schema changed, use feat: ` +
    `(or add %60!%60 / a BREAKING CHANGE footer when a key is removed or renamed). ` +
    `If the edits are prose-only, docs: is correct and you can ignore this.%0A` +
    `Contract files touched:%0A${list}`,
);
// Advisory only — always succeed.
process.exit(0);
