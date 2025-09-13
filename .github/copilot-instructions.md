# GABP Repository - AI Agent Instructions

## Purpose

You are working on the **GABP (Game Agent Bridge Protocol)** repository. GABP is a
communication protocol that enables AI tools to interact with games through a
standardized interface, similar to how Language Server Protocol (LSP) enables code
editors to work with language servers.

## Quick Context

GABP defines:

- **Message Format**: JSON-RPC-like protocol with requests, responses, and events
- **Transport Layer**: Local connections via stdio, TCP, or pipes/sockets
- **Security Model**: Token-based authentication for local-only access
- **Protocol Roles**: Bridge (client/AI tool) and Mod (server/game extension)

## Comprehensive Instructions

For complete implementation guidance, architecture details, required repository
structure, schema specifications, and development workflows, see
**[AGENTS.md](../AGENTS.md)**.

The AGENTS.md file contains:

- Complete repository structure requirements
- JSON Schema implementation details
- Specification writing guidelines
- CI/CD validation setup instructions
- Distribution and packaging requirements
- Release process checklist

## Key Implementation Notes

- Always verify existing repository structure before making changes
- Maintain backward compatibility within major protocol versions
- Follow JSON Schema Draft 2020-12 for all schemas
- Use RFC 2119 language (MUST/SHOULD) in specifications
- Validate all examples against schemas via CI workflows
