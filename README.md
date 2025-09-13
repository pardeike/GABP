# GABP (Game Agent Bridge Protocol)

GABP is a JSON-RPC-like protocol that enables communication between game modification frameworks (mods) and external automation tools (bridges). It provides a standardized way for AI agents, testing frameworks, and other external systems to interact with games through a well-defined API.

## Status

**Protocol Version**: 1.0  
**Repository Versioning**: SemVer  
**Wire Protocol Version**: `gabp/1`

The protocol uses semantic versioning for repository releases. The wire protocol version `gabp/1` represents the major version and will only include additive changes within the 1.x series. Breaking changes will require `gabp/2` and new schema folders.

## What is GABP?

GABP defines:
- **Message Format**: JSON-RPC-style messages with request/response/event patterns
- **Transport Layer**: Supports stdio, TCP (127.0.0.1), and named pipes/Unix sockets
- **Security Model**: Token-based authentication with loopback-only connections
- **Method Registry**: Standardized method names and error codes
- **Capability Negotiation**: Handshake process for feature discovery

### Core Concepts

- **Bridge**: The client application that connects to the game mod (external automation tool)
- **Mod**: The server application running within the game (game modification framework)
- **Agent**: The AI or automation system using the bridge to interact with the game

## Documentation

- **[Specification](SPEC/1.0/gabp.md)** - Normative protocol specification
- **[Transport & Framing](SPEC/1.0/transport.md)** - Connection and message framing details
- **[Security Model](SPEC/1.0/security.md)** - Authentication and security considerations
- **[Method Registry](SPEC/1.0/registry.md)** - Standard method names and error codes

## Schemas

Machine-readable JSON Schema definitions are available in the [`SCHEMA/1.0/`](SCHEMA/1.0/) directory:

- [`envelope.schema.json`](SCHEMA/1.0/envelope.schema.json) - Base message envelope
- [`methods/`](SCHEMA/1.0/methods/) - Request/response schemas for standard methods
- [`events/`](SCHEMA/1.0/events/) - Event message schemas
- [`common/`](SCHEMA/1.0/common/) - Shared type definitions

## Examples

Working examples of GABP messages can be found in [`EXAMPLES/1.0/`](EXAMPLES/1.0/):

- **[Handshake](EXAMPLES/1.0/handshake/)** - Session establishment flow
- **[Tools](EXAMPLES/1.0/tools/)** - Tool discovery and invocation
- **[Events](EXAMPLES/1.0/events/)** - Event subscription and messages

## Validation

You can validate GABP messages using [AJV](https://ajv.js.org/):

```bash
npm install -g ajv-cli
ajv -s SCHEMA/1.0/envelope.schema.json -d 'your-message.json'
```

### Conformance Tests

The [`CONFORMANCE/1.0/`](CONFORMANCE/1.0/) directory contains:
- [`valid/`](CONFORMANCE/1.0/valid/) - Messages that should validate successfully
- [`invalid/`](CONFORMANCE/1.0/invalid/) - Messages that should fail validation

## Quick Start

1. **Establish Connection**: Bridge connects to mod via configured transport
2. **Handshake**: Exchange `session/hello` and `session/welcome` messages
3. **Capability Discovery**: Use `tools/list` to discover available functionality
4. **Interaction**: Call methods, subscribe to events, access resources

Example handshake:

```json
// Bridge -> Mod: session/hello
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "request",
  "method": "session/hello",
  "params": {
    "token": "abc123...",
    "bridgeVersion": "1.0.0",
    "platform": "windows",
    "launchId": "game-session-123"
  }
}

// Mod -> Bridge: session/welcome
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "response",
  "result": {
    "agentId": "minecraft-mod-v2.1",
    "app": {
      "name": "Minecraft",
      "version": "1.20.4"
    },
    "capabilities": {
      "tools": ["inventory/get", "world/place_block"],
      "events": ["player/move", "world/block_change"],
      "resources": ["world/schematic"]
    },
    "schemaVersion": "1.0"
  }
}
```

## Packages

### JavaScript/Node.js

Install the schema package for easy validation:

```bash
npm install gabp-schemas
```

```javascript
const { validateMessage } = require('gabp-schemas');

const message = { /* your GABP message */ };
const result = validateMessage(message);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to the GABP specification.

## Versioning

See [VERSIONING.md](VERSIONING.md) for details on how GABP versions are managed.

## License

- **Specification documents** (in `SPEC/`) are licensed under [CC BY 4.0](LICENSES/SPEC-LICENSE.txt)
- **Code, schemas, and examples** are licensed under [Apache 2.0](LICENSES/CODE-LICENSE.txt)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes.