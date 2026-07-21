# Providers (input sources)

The general pattern for any input source this skill pulls from — not meeting-specific;
a future source (chat export, doc system, ...) reuses the same shape. Configured in
`provider` (`config.schema.json`, example in `config.example.yaml`).

## Provider

`provider.name` is a free-form string — the harness interprets it with the `interface`
block; no schema gate (decision-007). Only `zoom` has been exercised (decision-006). A
source with no working interface configured/available: say so and ask; never guess an
integration.

## Interface, in preference order

1. `mcp` — configured MCP server exposing the source. Preferred.
2. `cli` — installed first-party/well-maintained CLI, when no MCP server exists.
3. `api` — direct HTTP, **only** with `apiDocsUrl` pointing at real public docs. Never
   against undocumented/private endpoints. Fallback, not default.

Unconfigured or unreachable → ask the user for a paste or file path.

## Adding a provider

Write its name + an `interface` block in config. No schema change needed.
