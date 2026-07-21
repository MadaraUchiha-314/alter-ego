// Conventional-commit parsing + semantic-version derivation.
//
// Zero-dependency. Shared by derive-release.mjs (release bump) and
// lint-commits.mjs (PR-time enforcement). The plugin ships no package.json /
// node toolchain, so this owns the small amount of logic semantic-release
// would otherwise pull a plugin stack in to do (decision-016).
//
// Convention for this repo (issue #8): a new or changed *skill contract*
// (SKILL.md operations / front-matter keys, a config.schema.json, a
// config schema) is `feat:` — or breaking when it removes/renames a key.
// Prose-only edits are `docs:`. See docs/capabilities/release-automation.md.

// type -> the release it triggers. Types absent here (docs, chore, style,
// refactor, test, build, ci) are valid commits but trigger no release,
// matching semantic-release's default behaviour.
export const RELEASE_TYPES = {
  feat: "minor",
  fix: "patch",
  perf: "patch",
  revert: "patch",
};

// Every type accepted by the PR-time linter. Superset of RELEASE_TYPES.
export const KNOWN_TYPES = [
  "feat",
  "fix",
  "perf",
  "revert",
  "docs",
  "chore",
  "style",
  "refactor",
  "test",
  "build",
  "ci",
];

// Changelog section titles, in the order they should appear.
export const CHANGELOG_SECTIONS = [
  ["feat", "Features"],
  ["fix", "Bug Fixes"],
  ["perf", "Performance"],
  ["revert", "Reverts"],
];

const HEADER = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/;
const BREAKING_NOTE = /^BREAKING[ -]CHANGE:\s*(?<text>.+)$/im;

/**
 * Parse one commit message.
 * @param {string} message full commit message (subject + body)
 * @returns {{type,scope,breaking,subject,breakingText}|null} null if the
 *   header is not a conventional-commit header.
 */
export function parseCommit(message) {
  const lines = String(message).replace(/\r\n/g, "\n").split("\n");
  const header = lines[0] ?? "";
  const m = header.match(HEADER);
  if (!m) return null;

  const body = lines.slice(1).join("\n");
  const noteMatch = body.match(BREAKING_NOTE);
  const breaking = Boolean(m.groups.breaking) || Boolean(noteMatch);
  const breakingText = noteMatch?.groups.text?.trim() || (m.groups.breaking ? m.groups.subject.trim() : "");

  return {
    type: m.groups.type,
    scope: m.groups.scope ?? null,
    breaking,
    subject: m.groups.subject.trim(),
    breakingText,
  };
}

/**
 * Highest-precedence release implied by a set of parsed commits.
 * @param {Array} commits output of parseCommit (nulls ignored)
 * @returns {"major"|"minor"|"patch"|null}
 */
export function bumpFrom(commits) {
  let bump = null;
  const rank = { patch: 1, minor: 2, major: 3 };
  const raise = (level) => {
    if (bump === null || rank[level] > rank[bump]) bump = level;
  };
  for (const c of commits) {
    if (!c) continue;
    if (c.breaking) raise("major");
    else if (RELEASE_TYPES[c.type]) raise(RELEASE_TYPES[c.type]);
  }
  return bump;
}

/**
 * Apply a bump to a semver string. Pre-1.0 is treated like any other range:
 * a breaking change still moves the major (0.x -> 1.0.0). That is deliberate
 * for this plugin — a removed skill-contract key is a real break and should
 * read as one (decision-016).
 * @param {string} version e.g. "0.1.0"
 * @param {"major"|"minor"|"patch"} bump
 * @returns {string}
 */
export function nextVersion(version, bump) {
  const m = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`not a plain semver version: "${version}"`);
  let [major, minor, patch] = m.slice(1).map(Number);
  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else if (bump === "patch") {
    patch += 1;
  } else {
    throw new Error(`unknown bump: "${bump}"`);
  }
  return `${major}.${minor}.${patch}`;
}
