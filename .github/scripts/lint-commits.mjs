#!/usr/bin/env node
// PR-time conventional-commit enforcement (decision-016, open question 1).
//
// Because merges to `main` are squashed and the PR title becomes the squash
// commit subject, the PR *title* is what the release derivation later parses —
// so that is what we gate. Validates the header shape and that the type is one
// this repo recognises. Zero-dependency.
//
// Input: PR title via $PR_TITLE (or first CLI arg). Exit non-zero on failure so
// the check blocks the merge.

import { parseCommit, KNOWN_TYPES, RELEASE_TYPES } from "./conventional.mjs";

const title = process.env.PR_TITLE ?? process.argv[2] ?? "";

function fail(msg) {
  console.error(`::error::${msg}`);
  console.error(
    [
      "",
      "PR titles must be Conventional Commits — the squash-merge uses the title,",
      "and release automation derives the version bump from it.",
      "",
      "  <type>[optional scope][optional !]: <subject>",
      "",
      `  types: ${KNOWN_TYPES.join(", ")}`,
      "  releasing types:",
      "    feat:            -> minor",
      "    fix: / perf:     -> patch",
      "    <type>!  or a `BREAKING CHANGE:` footer -> major",
      "    docs:/chore:/... -> no release",
      "",
      "  Convention: a new/changed skill contract (SKILL.md operations,",
      "  front-matter keys, config.schema.json) is feat: (or `!` when a key is",
      "  removed/renamed). Prose-only edits are docs:.",
      "",
      "  e.g.  feat(knowledge-management): add staleness lint",
      "        fix(meeting-radar): dedup calendar + email occurrences",
      "        feat(init)!: rename manifest key seededVersion -> pinnedVersion",
    ].join("\n"),
  );
  process.exit(1);
}

if (!title.trim()) fail("empty PR title.");

const parsed = parseCommit(title);
if (!parsed) fail(`"${title}" is not a valid Conventional Commit header.`);
if (!KNOWN_TYPES.includes(parsed.type)) {
  fail(`unknown type "${parsed.type}" in "${title}".`);
}

const effect = parsed.breaking ? "major" : RELEASE_TYPES[parsed.type] ? `${RELEASE_TYPES[parsed.type]} release` : "no release";
console.log(`OK: "${title}" -> ${effect}.`);
