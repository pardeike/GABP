# GABP Implementation Guide for AI Agents

## Your Mission

You are working on the **GABP (Game Agent Bridge Protocol)** repository. This
protocol enables AI tools to communicate with games through a standardized bridge
interface.

Your job is to implement and maintain the complete GABP specification, which consists of three main deliverables:

1. **Human-readable specification** (Markdown documentation)
2. **Machine-readable schemas** (JSON Schema files)
3. **Conformance tests** (Example messages and validation)

This repository follows industry standards: Markdown + JSON Schema for
specifications, optional AsyncAPI for events, and CI workflows that validate all
examples.

## Repository Overview

The repository is structured to provide developers with:

- **Markdown documentation** to read and understand the protocol
- **JSON Schemas** to validate message formats
- **Rendered event documentation** via AsyncAPI
- **CI validation** that proves all examples conform to schemas

## Required Repository Structure

```text
README.md
LICENSES/
  SPEC-LICENSE.txt        # CC BY 4.0
  CODE-LICENSE.txt        # Apache 2.0
CODE_OF_CONDUCT.md
CONTRIBUTING.md
CHANGELOG.md
VERSIONING.md
SPEC/
  1.0/
    gabp.md               # Normative spec (wire format, methods, errors)
    transport.md          # Framing, loopback, tokens
    security.md           # Threat model, token handling
    registry.md           # Method names, error code ranges, URI scheme
SCHEMA/
  1.0/
    envelope.schema.json
    common/
      error.schema.json
      tool.schema.json
      capabilities.schema.json
    methods/
      session.hello.request.json
      session.welcome.response.json
      tools.list.request.json
      tools.list.response.json
      tools.call.request.json
      tools.call.response.json
      events.subscribe.request.json
      events.unsubscribe.request.json
      resources.list.request.json
      resources.list.response.json
      resources.read.request.json
    events/
      event.message.json   # {channel,seq,payload}
EXAMPLES/
  1.0/
    handshake/
      001_session-hello.json
      002_session-welcome.json
    tools/
      010_tools-list.req.json
      011_tools-list.res.json
    events/
      020_subscribe.req.json
      021_event.msg.json
CONFORMANCE/
  1.0/
    valid/*.json
    invalid/*.json
.github/workflows/validate.yml
packages/
  js/gabp-schemas/        # Optional npm package exporting SCHEMA/1.0
    package.json
    README.md
```

## README.md Requirements

The README should clearly communicate:

- **What GABP is**: A communication protocol for AI tools to interact with games
- **Current status**: "Protocol v1.0. Repo versioning uses SemVer. 'gabp/1' is the wire major."
- **Navigation links**: Direct links to SPEC, SCHEMA, and EXAMPLES directories
- **Validation instructions**: How to validate messages using AJV
- **Getting started guide**: Basic usage examples

## Licensing Strategy

This mirrors the approach used by OpenAPI, AsyncAPI, and other major specifications:

- **Specification documents** (text/spec): CC BY 4.0
- **Schemas, examples, and helper code**: Apache 2.0

## Core Specification Structure

### SPEC/1.0/gabp.md - Normative Specification

The main specification document must:

- Use RFC 2119 MUST/SHOULD wording for requirements
- Define protocol roles: **bridge** (client) and **mod** (server)
- Specify LSP-style framing for message streams:

```
Content-Length: <bytes>\r\n
Content-Type: application/json\r\n
\r\n
{ ...envelope... }
```

- Define envelope structure and union types
- Describe handshake flow: `session/hello` → `session/welcome`
- Establish method registry and extensibility rules
- Document error handling and codes
- Cover security model: loopback + token from bridge config

### Minimal Envelope Specification

```markdown
# GABP 1.0

## Envelope

A message is a JSON object with `v`, `id`, and a `type` of `request`, `response`, or `event`.

```json
{
  "v":"gabp/1",
  "id":"<uuid>",
  "type":"request|response|event",
  "method":"...",
  "params":{},
  "result":{},
  "error":{"code":0,"message":""}
}
```

### Request

- `type:"request"` MUST include `method` and MAY include `params`

### Response

- `type:"response"` MUST include exactly one of `result` or `error`

### Event

- `type:"event"` MUST include top-level `channel`, `seq`, and `payload`
- MUST NOT include `method`, `params`, `result`, or `error`

```text

## JSON Schema Implementation

Use JSON Schema Draft 2020-12 with `oneOf` for the three envelope variants. Keep numbers safe for JavaScript.

### SCHEMA/1.0/envelope.schema.json

```json
{
  "$id": "https://gabp.dev/schema/1.0/envelope.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GABP Envelope 1.0",
  "type": "object",
  "oneOf": [
    { "$ref": "#/$defs/request" },
    { "$ref": "#/$defs/response" },
    { "$ref": "#/$defs/event" }
  ],
  "$defs": {
    "uuid": { "type": "string", "format": "uuid" },
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": { "type": "integer" },
        "message": { "type": "string", "minLength": 1 },
        "data": {}
      },
      "additionalProperties": false
    },
    "request": {
      "type": "object",
      "required": ["v", "id", "type", "method"],
      "properties": {
        "v": { "const": "gabp/1" },
        "id": { "$ref": "#/$defs/uuid" },
        "type": { "const": "request" },
        "method": { "type": "string", "pattern": "^[a-z]+(/[a-z]+)+$" },
        "params": { "type": "object", "default": {} }
      },
      "additionalProperties": false
    },
    "response": {
      "type": "object",
      "required": ["v", "id", "type"],
      "properties": {
        "v": { "const": "gabp/1" },
        "id": { "$ref": "#/$defs/uuid" },
        "type": { "const": "response" },
        "result": {},
        "error": { "$ref": "#/$defs/error" }
      },
      "allOf": [
        { "not": { "required": ["result", "error"] } },
        { "anyOf": [{ "required": ["result"] }, { "required": ["error"] }] }
      ],
      "additionalProperties": false
    },
    "event": {
      "type": "object",
      "required": ["v", "id", "type", "channel", "seq", "payload"],
      "properties": {
        "v": { "const": "gabp/1" },
        "id": { "$ref": "#/$defs/uuid" },
        "type": { "const": "event" },
        "channel": { "type": "string", "minLength": 1 },
        "seq": { "type": "integer", "minimum": 0 },
        "payload": {}
      },
      "additionalProperties": false
    }
  }
}
```

### SCHEMA/1.0/methods/session.hello.request.json

```json
{
  "$id": "https://gabp.dev/schema/1.0/methods/session.hello.request.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["v", "id", "type", "method", "params"],
  "properties": {
    "v": { "const": "gabp/1" },
    "id": { "type": "string", "format": "uuid" },
    "type": { "const": "request" },
    "method": { "const": "session/hello" },
    "params": {
      "type": "object",
      "required": ["token", "bridgeVersion", "platform", "launchId"],
      "properties": {
        "token": { "type": "string", "minLength": 1 },
        "bridgeVersion": { "type": "string" },
        "platform": { "type": "string", "enum": ["windows", "macos", "linux"] },
        "launchId": { "type": "string" }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### SCHEMA/1.0/methods/session.welcome.response.json

```json
{
  "$id": "https://gabp.dev/schema/1.0/methods/session.welcome.response.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["v", "id", "type", "result"],
  "properties": {
    "v": { "const": "gabp/1" },
    "id": { "type": "string", "format": "uuid" },
    "type": { "const": "response" },
    "result": {
      "type": "object",
      "required": ["agentId", "app", "capabilities", "schemaVersion"],
      "properties": {
        "agentId": { "type": "string" },
        "app": {
          "type": "object",
          "required": ["name", "version"],
          "properties": {
            "name": { "type": "string" },
            "version": { "type": "string" }
          },
          "additionalProperties": false
        },
        "capabilities": {
          "$ref": "../common/capabilities.schema.json"
        },
        "schemaVersion": { "type": "string", "pattern": "^1\\.\\d+(?:\\.\\d+)?$" }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### SCHEMA/1.0/common/tool.schema.json

```json
{
  "$id": "https://gabp.dev/schema/1.0/common/tool.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["name", "title", "description", "inputSchema", "outputSchema"],
  "properties": {
    "name": { "type": "string", "pattern": "^[a-z0-9_.-]+$" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "inputSchema": { "type": "object" },
    "outputSchema": { "type": "object" },
    "tags": { "type": "array", "items": { "type": "string" }, "uniqueItems": true }
  },
  "additionalProperties": false
}
```

## AsyncAPI Implementation (Optional)

Publish a minimal AsyncAPI file so tooling can render event channels:

```yaml
asyncapi: 3.0.0
info:
  title: GABP Events
  version: 1.0.0
channels:
  events/{channel}:
    address: events/{channel}
    messages:
      eventMessage:
        payload:
          $ref: https://gabp.dev/schema/1.0/events/event.message.json
```

## Transport and Security Specifications

### SPEC/1.0/transport.md

Document the supported transport methods:

- **Allowed transports**: stdio, TCP 127.0.0.1, or named pipe/Unix socket
- **Default framing**: LSP headers
- **Default TCP bind**: 127.0.0.1, ephemeral port
- **Authentication**: Shared token read-only from config file written by bridge

### Platform-Specific Config Locations

- **Windows**: `%APPDATA%\gabp\bridge.json`
- **macOS**: `~/Library/Application Support/gabp/bridge.json`
- **Linux**: `~/.config/gabp/bridge.json`

File mode MUST restrict access to the user. Token rotates per launch unless configured otherwise.

### Example Config File

```json
{
  "token": "<random-128-bit-hex>",
  "port": 38917
}
```

## Versioning Policy (VERSIONING.md)

- `v:"gabp/1"` is the wire major version
- Only additive fields and new methods allowed in 1.x series
- Breaking changes require `gabp/2` and new schema folder
- Repository uses SemVer for releases
- Tag `v1.0.0` for the first stable release

## CI Validation (.github/workflows/validate.yml)

Implement automated validation:

- Run AJV over EXAMPLES and CONFORMANCE directories
- Fail if any example violates its schema
- Optionally run Spectral rules for consistency checking

### Minimal CI Workflow

```yaml
name: validate
on: [push, pull_request]
jobs:
  ajv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm i -g ajv-cli@5
      - run: |
          ajv -s SCHEMA/1.0/envelope.schema.json -d 'EXAMPLES/1.0/**/*.json'
          ajv -s SCHEMA/1.0/envelope.schema.json -d 'CONFORMANCE/1.0/valid/*.json'
          ajv -s SCHEMA/1.0/envelope.schema.json -d 'CONFORMANCE/1.0/invalid/*.json' --invalid
```

## Conformance Test Suite

### Valid Examples

- Complete handshake sequences
- Tool call examples
- Event stream samples

### Invalid Examples

- Missing required `id` field
- Both `result` and `error` in response
- Event messages with `method` field
- Other documented failure cases

## Method and Error Registry (SPEC/1.0/registry.md)

### Method Naming Convention

- Format: `segment/segment` (lowercase)
- Reserved core methods as specified

### Error Code Alignment

Follow JSON-RPC conventions for familiarity:

- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000` to `-32099`: Server errors reserved for bridge/mod

### URI Scheme

- Format: `gabp://<namespace>/<resource>`
- Maintain table of reserved namespaces

## Distribution and Packaging

### NPM Package

- Publish `packages/js/gabp-schemas` to npm for easy import
- Optionally add `gabp-examples` package for test fixtures

### GitHub Pages

- Enable GitHub Pages to host schemas at stable URLs matching `$id` values

## Release Process Checklist

1. **Freeze** SPEC/1.0 content
2. **Tag** repository with `v1.0.0`
3. **Create** GitHub Release bundling `/SCHEMA/1.0` and `/EXAMPLES/1.0`
4. **Announce** registry and contribution rules

## Important Implementation Notes

- **Always verify** which parts of the repository structure already exist before creating new content
- **Validate** all JSON files for syntax correctness
- **Ensure** all schema `$id` values use consistent URL patterns
- **Test** that examples conform to their respective schemas
- **Maintain** backward compatibility within major versions
- **Follow** the existing code style and formatting conventions

## Getting Help

When implementing GABP specifications:

1. Start by examining existing repository structure
2. Check current validation status with CI workflows
3. Review existing schemas and examples for patterns
4. Ensure all changes maintain specification consistency
5. Validate new content against existing schemas before committing
