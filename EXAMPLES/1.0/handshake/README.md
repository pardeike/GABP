# Handshake Examples

This directory contains examples of the GABP session handshake process - the initial exchange between a bridge (client) and mod (server) to establish a connection.

## Files

- **[001_session-hello.json](001_session-hello.json)** - Initial hello request from bridge to mod
- **[002_session-welcome.json](002_session-welcome.json)** - Welcome response from mod to bridge

## Handshake Flow

The handshake is always initiated by the bridge and follows this pattern:

1. **Bridge → Mod**: `session/hello` request with authentication token and bridge information
2. **Mod → Bridge**: `session/welcome` response with mod capabilities and session details

## Key Information Exchanged

### In session/hello (Bridge → Mod):
- **token** - Authentication token for security
- **bridgeVersion** - Version of the bridge software
- **platform** - Operating system (windows, macos, linux)
- **launchId** - Unique identifier for this game session

### In session/welcome (Mod → Bridge):
- **agentId** - Unique identifier for this mod instance
- **app** - Game information (name and version)
- **capabilities** - Available tools, events, and resources
- **schemaVersion** - GABP schema version supported

## What Happens Next

After a successful handshake, the bridge can:
- List available tools with `tools/list`
- Subscribe to events with `events/subscribe`
- List available resources with `resources/list`
- Call specific tools and read resources as needed

## Validation

These examples validate against:
- `../../../SCHEMA/1.0/envelope.schema.json`
- `../../../SCHEMA/1.0/methods/session.hello.request.json`
- `../../../SCHEMA/1.0/methods/session.welcome.response.json`