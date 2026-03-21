# GABP 1.0 Wire-Model Decisions

This note records the canonical wire-model decisions for GABP 1.0 so that specification text, schemas, examples,
conformance fixtures, and downstream runtime packages stay aligned.

## Scope

These decisions apply to the native GABP wire format.

They do not govern downstream adapter layers such as:

- MCP-facing mirrored tool names
- OpenAI-safe tool name normalization
- implementation-specific API conveniences

Those layers may transform names for external ecosystems, but the native GABP wire format remains canonical.

## Canonical Decisions

### 1. `tools/call` uses `arguments`

The canonical request shape for `tools/call` is:

```json
{
  "method": "tools/call",
  "params": {
    "name": "inventory/get",
    "arguments": {
      "playerId": "steve"
    }
  }
}
```

`parameters` is not the canonical wire field name for `tools/call`.

### 2. Session capabilities use `methods`

The `session/welcome` `capabilities` object advertises supported protocol methods via `capabilities.methods`.

Tool discovery is performed with `tools/list`, not by listing tool names inside `session/welcome`.

### 3. Native tool identifiers use slash-separated names

The canonical native GABP tool naming style is slash-separated, for example:

- `inventory/get`
- `world/place_block`
- `player/teleport`

The expected pattern for native tool identifiers is:

```text
^[a-z][a-z0-9_-]*(/[a-z][a-z0-9_-]*)+$
```

This allows:

- lowercase segments
- digits after the first character in a segment
- underscores within a segment
- hyphens within a segment

This disallows:

- dotted native tool names such as `inventory.get`
- uppercase letters
- leading or trailing slashes

### 4. Protocol methods and native tool names are distinct concepts

Protocol methods such as `session/hello`, `tools/list`, and `events/subscribe` control the wire protocol itself.

Native tool names such as `inventory/get` or `world/place_block` identify implementation-defined tools that are invoked
through the `tools/call` protocol method.

Both use slash-separated namespace-style identifiers, but they occupy different domains.

### 5. Attention uses explicit methods, lifecycle channels, and stable ids

The canonical additive attention surface within `gabp/1` uses:

- protocol methods:
  - `attention/current`
  - `attention/ack`
- lifecycle event channels:
  - `attention/opened`
  - `attention/updated`
  - `attention/cleared`

Attention payloads use a stable `attentionId` so the same item can be referenced consistently across:

- lifecycle events
- attention inspection methods
- implementation-defined blocked-call or related-result flows

Bridges and integrations SHOULD preserve the distinction between:

- a call blocked before dispatch because attention was already open
- a call that executed and then produced or referenced related attention

## Adapter Guidance

Bridges may adapt native tool identifiers for other environments.

Examples:

- native GABP: `inventory/get`
- mirrored MCP: `minecraft.inventory.get`
- OpenAI-safe: `minecraft_inventory_get`

These transformed names are adapter concerns, not canonical GABP wire names.
