#!/usr/bin/env node
// Derive the next plugin release from conventional commits since the last tag.
//
// Zero-dependency. Run by .github/workflows/release.yml on push to main, and
// runnable locally with --dry-run to preview what the next push would release.
//
// Behaviour (decision-016):
//   * No `v*` tag yet  -> SEED: tag the current plugin.json version as the
//     baseline (v<current>), no bump, no file edits. Bootstraps tag history.
//   * Tag exists       -> parse commits in <lastTag>..HEAD, derive the bump
//     (feat->minor, fix/perf/revert->patch, BREAKING / `!` ->major, others
//     ->no release). No releasable commit -> exit 0, no release.
//
// Outputs (when not --dry-run and not seeding): rewrites plugin.json `version`,
// prepends a CHANGELOG.md section, writes a release-notes file, and appends
// key=value lines to $GITHUB_OUTPUT.
//
// Flags:
//   --dry-run   compute and print only; touch no files, emit no outputs.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import {
  parseCommit,
  bumpFrom,
  nextVersion,
  CHANGELOG_SECTIONS,
} from "./conventional.mjs";

const PLUGIN_JSON = ".claude-plugin/plugin.json";
const CHANGELOG = "CHANGELOG.md";
const dryRun = process.argv.includes("--dry-run");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

// Repo web URL for changelog compare/commit links.
function repoUrl() {
  const server = process.env.GITHUB_SERVER_URL || "https://github.com";
  const slug = process.env.GITHUB_REPOSITORY;
  if (slug) return `${server}/${slug}`;
  try {
    const remote = git(["remote", "get-url", "origin"]);
    const m = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    if (m) return `https://github.com/${m[1]}`;
  } catch {
    /* no remote locally — links degrade gracefully to plain text */
  }
  return null;
}

// Latest v* tag by semver, or null.
function lastTag() {
  const out = git(["tag", "--list", "v*", "--sort=-v:refname"]);
  return out ? out.split("\n")[0].trim() : null;
}

// Parsed commits in range, newest first, excluding release commits.
function commitsSince(tag) {
  const RS = "\x1e"; // record separator between commits
  const range = tag ? `${tag}..HEAD` : "HEAD";
  const raw = git(["log", `--format=%H%x00%B${RS}`, range]);
  if (!raw) return [];
  return raw
    .split(RS)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((rec) => {
      const nul = rec.indexOf("\x00");
      const hash = rec.slice(0, nul);
      const message = rec.slice(nul + 1);
      return { hash, message, parsed: parseCommit(message) };
    })
    .filter((c) => !c.message.startsWith("chore(release):"));
}

function readVersion() {
  const pkg = JSON.parse(readFileSync(PLUGIN_JSON, "utf8"));
  return pkg.version;
}

function writeVersion(version) {
  const text = readFileSync(PLUGIN_JSON, "utf8");
  const pkg = JSON.parse(text);
  pkg.version = version;
  // Preserve a trailing newline like the existing file.
  const trailing = text.endsWith("\n") ? "\n" : "";
  writeFileSync(PLUGIN_JSON, JSON.stringify(pkg, null, 2) + trailing);
}

function renderNotes(version, prevTag, commits, url) {
  const today = new Date().toISOString().slice(0, 10);
  const heading =
    url && prevTag
      ? `## [${version}](${url}/compare/${prevTag}...v${version}) (${today})`
      : `## ${version} (${today})`;

  const lines = [heading, ""];
  const shortHash = (h) => (url ? `([${h.slice(0, 7)}](${url}/commit/${h}))` : `(${h.slice(0, 7)})`);

  for (const [type, title] of CHANGELOG_SECTIONS) {
    const matches = commits.filter((c) => c.parsed && c.parsed.type === type);
    if (!matches.length) continue;
    lines.push(`### ${title}`, "");
    for (const c of matches) {
      const scope = c.parsed.scope ? `**${c.parsed.scope}:** ` : "";
      lines.push(`- ${scope}${c.parsed.subject} ${shortHash(c.hash)}`);
    }
    lines.push("");
  }

  const breaking = commits.filter((c) => c.parsed && c.parsed.breaking);
  if (breaking.length) {
    lines.push("### ⚠ BREAKING CHANGES", "");
    for (const c of breaking) {
      lines.push(`- ${c.parsed.breakingText || c.parsed.subject} ${shortHash(c.hash)}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function prependChangelog(section) {
  const header = "# Changelog\n\nAll notable changes to the alter-ego plugin, derived automatically from\nconventional commits on merges to `main`. See\n[docs/capabilities/release-automation.md](docs/capabilities/release-automation.md).\n";
  let body = "";
  if (existsSync(CHANGELOG)) {
    const existing = readFileSync(CHANGELOG, "utf8");
    // Drop the managed header if present; we re-emit it.
    const idx = existing.indexOf("\n## ");
    body = idx === -1 ? "" : existing.slice(idx + 1);
  }
  writeFileSync(CHANGELOG, `${header}\n${section}\n${body}`.replace(/\n{3,}$/,"\n"));
}

function emit(outputs) {
  const gh = process.env.GITHUB_OUTPUT;
  const text = Object.entries(outputs)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  if (gh) appendFileSync(gh, text + "\n");
  console.log(text);
}

function main() {
  const current = readVersion();
  const prevTag = lastTag();
  const url = repoUrl();

  // SEED: no tag history yet — establish the baseline at the current version.
  if (!prevTag) {
    console.log(`No existing tag. Seeding baseline release v${current}.`);
    if (!dryRun) {
      const notes =
        `## ${current} (${new Date().toISOString().slice(0, 10)})\n\n` +
        `Baseline release. Establishes tag history; future releases are derived\n` +
        `from conventional commits since this tag.\n`;
      if (!existsSync(CHANGELOG)) prependChangelog(notes);
      writeFileSync(notesFile(), notes);
      emit({ released: "true", version: current, tag: `v${current}`, bump: "seed", previous_tag: "" });
    }
    return;
  }

  const commits = commitsSince(prevTag);
  const bump = bumpFrom(commits.map((c) => c.parsed));

  if (!bump) {
    console.log(`No releasable commits since ${prevTag}. Nothing to release.`);
    if (!dryRun) emit({ released: "false" });
    return;
  }

  const version = nextVersion(current, bump);
  const notes = renderNotes(version, prevTag, commits, url);
  console.log(`${prevTag} -> v${version} (${bump})`);

  if (dryRun) {
    console.log("\n--- release notes (dry run) ---\n" + notes);
    return;
  }

  writeVersion(version);
  prependChangelog(notes);
  writeFileSync(notesFile(), notes);
  emit({ released: "true", version, tag: `v${version}`, bump, previous_tag: prevTag });
}

function notesFile() {
  return process.env.RELEASE_NOTES_FILE || "release-notes.md";
}

main();
