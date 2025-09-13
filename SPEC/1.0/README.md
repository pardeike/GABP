# GABP 1.0 Specification

This directory contains the normative specification documents for GABP (Game Agent Bridge Protocol) version 1.0.

## Specification Documents

- **[gabp.md](gabp.md)** - Core protocol specification (wire format, methods, errors)
- **[transport.md](transport.md)** - Transport layer details (framing, connections, loopback)  
- **[security.md](security.md)** - Security model and threat analysis
- **[registry.md](registry.md)** - Method names, error codes, and URI schemes
- **[ai-implementation.md](ai-implementation.md)** - AI implementer guide with prompts and patterns

## Reading Order

For implementers, we recommend reading the documents in this order:

1. **gabp.md** - Start here to understand the basic message format and core methods
2. **transport.md** - Learn how messages are sent over the wire  
3. **security.md** - Understand the security model and authentication
4. **registry.md** - Reference for method names, error codes, and extensibility rules
5. **ai-implementation.md** - AI-specific implementation guidance (for AI-assisted development)

## Implementation Requirements

These documents use RFC 2119 keywords (MUST, SHOULD, MAY) to specify requirements:

- **MUST** / **REQUIRED** - Mandatory for compliance
- **SHOULD** / **RECOMMENDED** - Strongly recommended
- **MAY** / **OPTIONAL** - Implementation choice

## Protocol Roles

GABP defines two roles:

- **Bridge** - The client that connects to the game mod (your AI tool/agent)
- **Mod** - The server running inside the game (the game modification)

## Companion Resources

While reading these specifications, refer to:

- **[../../SCHEMA/1.0/](../../SCHEMA/1.0/)** - Machine-readable JSON schemas
- **[../../EXAMPLES/1.0/](../../EXAMPLES/1.0/)** - Working message examples
- **[../../CONFORMANCE/1.0/](../../CONFORMANCE/1.0/)** - Conformance test cases

## Extensibility

GABP 1.0 allows extensions through:

- Custom methods (following naming conventions in registry.md)
- Custom error codes (in designated ranges)
- Custom event channels
- Custom resource URIs

Extensions MUST NOT conflict with core protocol behavior and SHOULD follow the patterns established by standard methods.
