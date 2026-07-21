# Decision 014: plugin lifecycle skills — `alter-ego:init` seeds, `alter-ego:upgrade` reconciles

- **Status:** accepted
- **Date:** 2026-07-21
- **Deciders:** @MadaraUchiha-314 (issue #7)
- **Work item:** issue-7

## Context

After #6, a repo got the plugin by adding it as a Claude Code marketplace entry, and each
skill initialized itself lazily (knowledge-management seeds its vault on first use; every
skill reads an optional config with defaults). That works but leaves gaps the-loop already
covers with `/the-loop:init` + `/the-loop:upgrade-the-loop`: no single setup pass, no
record of what the plugin created, and no path to carry a repo forward as the plugin
releases new versions. Issue #7 asks for both, and raises three open questions.

## Decision

1. **`alter-ego:init`** — one plugin-wide setup pass: detect which skills apply
   (enumerated from `skills/*/SKILL.md` at run time, classified primitive vs.
   producer per `skills/init/reference/detection.md`), offer each applicable skill's
   config from its `config.example.yaml`, delegate seeding the knowledge vault to the
   knowledge-management skill's own `init`, and write `.alter-ego/manifest.yaml`. init
   owns the manifest, the config-offer step, and composition — it routes to per-skill
   logic rather than re-implementing it. Idempotent.
2. **`alter-ego:upgrade`** — diff the manifest's `alterEgoVersion` against `plugin.json`,
   reconcile only `managed: true` artifacts (vault `schema.md` conventions, config
   *schemas*), never user-owned content (notes, sources, filled config values), and
   migrate vault-format changes review-gated with one `log.md` entry per migration —
   the same flag → approve → migrate discipline as the rest of the knowledge skill.

### Answers to the open questions

- **Version stamping.** `plugin.json`'s `version` is the single source of truth. Seeded
  artifacts do **not** each carry the plugin version in their front matter; the manifest
  records a `seededVersion` per skill and per primitive, giving `upgrade` per-artifact
  diffing from one place without leaking plugin bookkeeping into user/vault-owned data.
  The vault's self-describing `schema.md` stays the migration target. (Full rationale:
  `skills/init/reference/manifest.md`.)
- **Overlap with `/the-loop:init`.** Compose, don't duplicate. When `.the-loop/` exists,
  `alter-ego:init` registers the alter-ego skills in the target repo's
  `.the-loop/external-tools.md` (idempotent, append-only) and touches nothing else the-loop
  owns. Two manifests, versioned independently — merging them would recouple the
  knowledge/code boundary of decision-011. (`skills/init/reference/composition.md`.)
- **Post-migration `validate`.** Yes, but opt-in: `upgrade` *offers* the
  knowledge-management `validate` lint as a health check, never auto-runs it, because
  `validate` can legitimately flag many notes for review.

## Consequences

- A repo has one setup command and one upgrade command, and a manifest that makes both
  safe: `upgrade` knows exactly what is managed vs. user-owned, so filled configs, notes
  and sources survive every upgrade untouched.
- The manifest is a convenience, not a lock: a repo whose `.alter-ego/manifest.yaml` is
  deleted still works, and `upgrade` can reconstruct a best-effort manifest by inspecting
  the repo (`skills/upgrade/reference/reconciliation.md`).
- Two independent manifests (alter-ego, the-loop) is slightly more surface than one, but
  keeps release cadences and the knowledge/code boundary decoupled. Accepted trade.

## Alternatives considered

- **Per-artifact version stamps in every note's front matter** — rejected: pollutes
  user/vault-owned data with plugin bookkeeping and fights the vault's own contract; the
  manifest's `seededVersion` gives the same per-artifact granularity centrally.
- **A single merged manifest with the-loop** — rejected: couples two plugins' release
  cadences and re-entangles decision-011's knowledge/code separation.
- **Auto-running `validate` after every upgrade** — rejected: it can flag many notes and
  turn a routine version bump into a large review; offered instead.
- **Keeping lazy per-skill init only (no plugin-wide pass)** — rejected: it is what #7
  set out to fix; no setup record means no safe upgrade path.
