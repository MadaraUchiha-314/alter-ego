# Decision 007: `meetingProvider.provider` is free-form, not a fixed enum

- **Status:** accepted — supersedes point 1 of decision-006
- **Date:** 2026-07-17
- **Deciders:** @MadaraUchiha-314 (PR review comment)
- **Work item:** issue-2 / PR #4

## Context

Decision-006 made `meetingProvider.provider` a JSON Schema enum containing only `"zoom"`,
reasoning that an enum makes "not supported yet" an explicit, checkable state. Follow-up
review feedback on PR #4 pushed back: "No need to keep fixed enums. Just provide a way to
specify it so that the agent harness (claude/cursor) can make sense of it." The premise of
decision-006's enum choice was that schema validation should be the gate; the correction
is that the harness — the agent actually running the skill — is the right place to apply
judgement about what's supported, not a closed schema list.

## Decision

`meetingProvider.provider` is a plain `string` with no `enum` constraint. The harness
reads whatever value is there (paired with the `interface` block) and decides how to
proceed: if it recognizes the platform and the configured interface is reachable, use it;
if not, say so plainly and ask the user, rather than the config file itself refusing an
unrecognized value. `provider`'s `default` stays `"zoom"` and the docs continue to say
only Zoom has actually been exercised — that hasn't changed, only the enforcement
mechanism has (harness judgement instead of schema).

This does not revisit decision-006's other two points (the `mcp`/`cli`/`api` interface
preference, and the generalized `filesystem`/`filesystem-git`/`mcp`/`cli` storage kinds) —
those remain structural discriminators that determine which fields a config object needs,
which is a legitimate use of a fixed enum (unlike `provider`, which was just a label).

## Consequences

- Positive: adding a second meeting platform (or any future provider-like field) is
  writing a config value, not touching `config.schema.json`. Consistent with treating this
  skill's instructions, not its schema, as the place where judgement calls get made.
- Negative: a typo'd or genuinely unsupported provider name no longer fails config
  validation on its own — the harness has to notice and say so at run time instead. This
  is an explicit trade named in the decision, not an oversight.

## Alternatives considered

- Leaving the enum in place and just adding more values as providers are proven out —
  rejected per the explicit review feedback: it still puts the gate in the schema instead
  of the harness, and requires a schema edit for every new provider.
- A hybrid (enum of "known" values plus an escape hatch like `"other"`) — rejected as
  unnecessary complexity; a plain string with a documented default already gets the same
  outcome more simply.
