/**
 * Stamp a version into .claude-plugin/plugin.json — the plugin's single source
 * of truth for its version (decision-014).
 *
 * semantic-release computes the next version from Conventional Commits but has
 * no built-in writer for a non-package.json file, so it invokes this via
 * @semantic-release/exec's prepareCmd (bun runs TypeScript natively):
 *
 *   bun scripts/set-version.ts <version>
 *
 * @semantic-release/git then commits the changed plugin.json alongside the
 * changelog. This is the only bespoke code in the release path; everything else
 * is off-the-shelf semantic-release plugins (decision-016).
 */
import { readFileSync, writeFileSync } from "node:fs";

const PLUGIN_JSON = ".claude-plugin/plugin.json";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`set-version: expected a semver argument, got "${version ?? ""}"`);
  process.exit(1);
}

const raw = readFileSync(PLUGIN_JSON, "utf8");
const manifest = JSON.parse(raw) as { version?: string; [key: string]: unknown };
manifest.version = version;

// Preserve 2-space indentation and a trailing newline to match the file.
const trailingNewline = raw.endsWith("\n") ? "\n" : "";
writeFileSync(PLUGIN_JSON, `${JSON.stringify(manifest, null, 2)}${trailingNewline}`);

console.log(`set-version: ${PLUGIN_JSON} version -> ${version}`);
