# GABP (Game Agent Bridge Protocol)

GABP is a communication protocol that lets AI tools talk to games. It works like a bridge between AI agents and game modifications. This allows AI systems, testing tools, and other programs to control and interact with games in a standard way.

## Status

**Protocol Version**: 1.0  
**Repository Versioning**: SemVer  
**Wire Protocol Version**: `gabp/1`

The protocol uses semantic versioning for repository releases. The wire protocol version `gabp/1` represents the major version and will only include additive changes within the 1.x series. Breaking changes will require `gabp/2` and new schema folders.

## What is GABP?

GABP defines these key parts:
- **Message Format**: JSON messages that look like JSON-RPC with requests, responses, and events
- **Transport Layer**: Works with stdio, TCP connections (local only), and pipes/sockets
- **Security Model**: Uses tokens for authentication and only allows local connections  
- **Method Registry**: Standard names for methods and error codes
- **Capability Negotiation**: Handshake process to discover what features are available

### Key Terms

- **Bridge**: The client program that connects to the game mod (this is your AI tool)
- **Mod**: The server program running inside the game (the game modification)
- **Agent**: The AI or automation system that uses the bridge to control the game

## Documentation

- **[Main Specification](SPEC/1.0/gabp.md)** - Complete protocol rules and requirements
- **[Transport & Connections](SPEC/1.0/transport.md)** - How to connect and send messages  
- **[Security Guide](SPEC/1.0/security.md)** - Authentication and safety rules
- **[Method Registry](SPEC/1.0/registry.md)** - Standard method names and error codes
- **[Wire-Model Decisions](SPEC/1.0/wire-model-decisions.md)** - Canonical 1.0 wire naming and field choices
- **[AI Implementation Guide](SPEC/1.0/ai-implementation.md)** - AI-assisted development prompts and patterns

## Schemas

Computer-readable definitions are in the [`SCHEMA/1.0/`](SCHEMA/1.0/) directory:

- [`envelope.schema.json`](SCHEMA/1.0/envelope.schema.json) - Basic message structure
- [`methods/`](SCHEMA/1.0/methods/) - Schemas for standard method calls
- [`events/`](SCHEMA/1.0/events/) - Schemas for event messages
- [`common/`](SCHEMA/1.0/common/) - Shared definitions used everywhere

## Examples

Working examples of GABP messages are in [`EXAMPLES/1.0/`](EXAMPLES/1.0/):

- **[Handshake](EXAMPLES/1.0/handshake/)** - How to start a session
- **[Tools](EXAMPLES/1.0/tools/)** - How to find and use tools
- **[Events](EXAMPLES/1.0/events/)** - How to subscribe to and receive events

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

## Getting Started

1. **Connect**: Bridge connects to mod using one of the transport methods
2. **Handshake**: Send `session/hello` and receive `session/welcome` messages
3. **Discover**: Use `tools/list` to see what the game can do
4. **Interact**: Call methods, subscribe to events, and read resources

Basic handshake example:

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
      "methods": [
        "tools/list",
        "tools/call",
        "events/subscribe",
        "events/unsubscribe",
        "resources/list",
        "resources/read"
      ],
      "events": ["player/move", "world/block_change"],
      "resources": ["gabp://game/world/schematic"]
    },
    "schemaVersion": "1.0"
  }
}
```

## Packages

The repository includes three versioned schema packages, all sourced from the canonical [`SCHEMA/1.0/`](SCHEMA/1.0/) tree.

### JavaScript/Node.js

The [`gabp-schemas`](packages/js/gabp-schemas/README.md) package bundles the schema tree and exposes preloaded validators for Node.js and TypeScript consumers.

```bash
npm install gabp-schemas
```

```javascript
const { validateRequest } = require('gabp-schemas');

const message = { /* your GABP request */ };
const result = validateRequest(message);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### .NET

The [`Gabp.Schemas`](packages/dotnet/Gabp.Schemas/README.md) package embeds the same schema assets and exposes them through the `SchemaAssets` API for .NET consumers.

NuGet package ID: `Gabp.Schemas`

### Go

The [`github.com/pardeike/GABP/packages/go/schemas`](packages/go/schemas/README.md) module embeds the same versioned schema assets for Go consumers.

Module path: `github.com/pardeike/GABP/packages/go/schemas`

Repository releases for the npm package and NuGet package use top-level tags such as `v1.0.3`. The Go module uses subdirectory-prefixed tags such as `packages/go/schemas/v1.0.3`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to the GABP specification.

## Versioning

See [VERSIONING.md](VERSIONING.md) for details on how GABP versions are managed.

## License

- **Specification documents** (in `SPEC/`) are licensed under [CC BY 4.0](LICENSES/SPEC-LICENSE.txt)
- **Code, schemas, and examples** are licensed under [Apache 2.0](LICENSES/CODE-LICENSE.txt)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes.
