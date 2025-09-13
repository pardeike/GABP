# GABP 1.0 Specification

**Version**: 1.0  
**Status**: Draft  
**Date**: 2025-01-02

## Abstract

The Game Agent Bridge Protocol (GABP) is a JSON-RPC-inspired protocol that enables communication between game modification frameworks and external automation tools. This specification defines the message format, core methods, error handling, and extensibility rules for GABP version 1.0.

## 1. Introduction

GABP facilitates communication between two primary roles:

- **Bridge**: The client application that connects to a game mod (external automation tool)
- **Mod**: The server application running within a game (game modification framework)

The protocol is designed to support AI agents, testing frameworks, and other automation systems that need to interact with games in a structured, reliable manner.

## 2. Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

## 3. Message Format

### 3.1 Envelope

All GABP messages are JSON objects that conform to a common envelope structure. A message MUST be a JSON object with the following properties:

- `v` (string, required): Protocol version identifier. MUST be `"gabp/1"` for version 1.x
- `id` (string, required): Unique identifier for the message, formatted as a UUID
- `type` (string, required): Message type, one of `"request"`, `"response"`, or `"event"`

### 3.2 Request Messages

A request message has `type` of `"request"` and MUST include:

- `method` (string, required): The method name being invoked
- `params` (object, optional): Parameters for the method call

Request messages MUST NOT include `result`, `error`, `channel`, `seq`, or `payload` properties.

Example:
```json
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "request",
  "method": "tools/list",
  "params": {}
}
```

### 3.3 Response Messages

A response message has `type` of `"response"` and MUST include exactly one of:

- `result` (any type): The successful result of the method call
- `error` (object): Error information if the method call failed

Response messages MUST NOT include `method`, `params`, `channel`, `seq`, or `payload` properties.

The `error` object, when present, MUST contain:
- `code` (integer, required): Numeric error code
- `message` (string, required): Human-readable error description
- `data` (any type, optional): Additional error-specific data

Example success:
```json
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "response",
  "result": {
    "tools": ["inventory/get", "world/place_block"]
  }
}
```

Example error:
```json
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "response",
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": {"method": "unknown/method"}
  }
}
```

### 3.4 Event Messages

An event message has `type` of `"event"` and MUST include:

- `channel` (string, required): Event channel name
- `seq` (integer, required): Sequence number for the event (≥ 0)
- `payload` (any type, required): Event data

Event messages MUST NOT include `method`, `params`, `result`, or `error` properties.

Example:
```json
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "event",
  "channel": "player/move",
  "seq": 42,
  "payload": {
    "playerId": "steve",
    "position": {"x": 100, "y": 64, "z": 200}
  }
}
```

## 4. Core Methods

GABP defines several core methods that compliant implementations SHOULD support:

### 4.1 Session Management

#### session/hello

Initiates a connection from bridge to mod.

**Request Parameters**:
- `token` (string, required): Authentication token
- `bridgeVersion` (string, required): Bridge software version
- `platform` (string, required): Operating system ("windows", "macos", or "linux")
- `launchId` (string, required): Unique identifier for this session

#### session/welcome

Response to `session/hello` indicating successful authentication.

**Response Result**:
- `agentId` (string, required): Unique identifier for the mod instance
- `app` (object, required): Application information
  - `name` (string, required): Game or application name
  - `version` (string, required): Game or application version
- `capabilities` (object, required): Supported features (see capabilities schema)
- `schemaVersion` (string, required): GABP schema version (pattern: `^1\.\d+(?:\.\d+)?$`)

### 4.2 Tool Management

#### tools/list

Lists available tools/methods provided by the mod.

**Request Parameters**: None

**Response Result**:
- `tools` (array, required): Array of tool objects (see tool schema)

#### tools/call

Invokes a specific tool with parameters.

**Request Parameters**:
- `name` (string, required): Tool name to invoke
- `arguments` (object, optional): Arguments for the tool

**Response Result**: Tool-specific result data

### 4.3 Event Management

#### events/subscribe

Subscribes to one or more event channels.

**Request Parameters**:
- `channels` (array, required): Array of channel name strings

**Response Result**:
- `subscribed` (array, required): Array of successfully subscribed channel names

#### events/unsubscribe

Unsubscribes from one or more event channels.

**Request Parameters**:
- `channels` (array, required): Array of channel name strings

**Response Result**:
- `unsubscribed` (array, required): Array of successfully unsubscribed channel names

### 4.4 Resource Management

#### resources/list

Lists available resources.

**Request Parameters**:
- `pattern` (string, optional): Glob pattern to filter resources

**Response Result**:
- `resources` (array, required): Array of resource URIs

#### resources/read

Reads a specific resource.

**Request Parameters**:
- `uri` (string, required): Resource URI to read

**Response Result**:
- `content` (any type, required): Resource content
- `mimeType` (string, optional): MIME type of the content

## 5. Method Names

Method names MUST follow the pattern `^[a-z]+(/[a-z]+)+$` (lowercase segments separated by forward slashes). The first segment typically represents a namespace or category.

Reserved method namespaces:
- `session/*` - Session management
- `tools/*` - Tool discovery and invocation
- `events/*` - Event subscription management
- `resources/*` - Resource access

## 6. Error Codes

GABP uses JSON-RPC-compatible error codes:

- `-32600`: Invalid Request - The JSON sent is not a valid request object
- `-32601`: Method Not Found - The method does not exist or is not available
- `-32602`: Invalid Params - Invalid method parameter(s)
- `-32603`: Internal Error - Internal JSON-RPC error
- `-32000` to `-32099`: Server Error - Reserved for implementation-defined server errors

Custom error codes SHOULD use ranges outside of the JSON-RPC reserved ranges.

## 7. Extensibility

### 7.1 Custom Methods

Implementations MAY define custom methods beyond the core set. Custom method names MUST follow the naming pattern and SHOULD use implementation-specific namespaces to avoid conflicts.

### 7.2 Protocol Versioning

The protocol version `gabp/1` allows for additive changes only:
- New optional fields in existing messages
- New methods
- New error codes

Breaking changes require a new major version (e.g., `gabp/2`).

### 7.3 Capability Negotiation

Implementations MUST use the `capabilities` object in the `session/welcome` response to advertise supported features. Bridges SHOULD check capabilities before attempting to use optional features.

## 8. Message Ordering

- Request-response pairs are matched by the `id` field
- Multiple outstanding requests are allowed (asynchronous operation)
- Events are delivered in sequence order per channel (using the `seq` field)
- No ordering guarantees exist between different channels

## 9. Connection Lifecycle

1. **Establishment**: Bridge establishes transport connection
2. **Authentication**: Bridge sends `session/hello` with token
3. **Welcome**: Mod responds with `session/welcome` and capabilities
4. **Operation**: Normal request/response and event flow
5. **Termination**: Either party may close the connection

## 10. Compliance

A compliant GABP implementation MUST:

- Support the envelope format defined in Section 3
- Implement the `session/hello` and `session/welcome` methods
- Use the error codes defined in Section 6 for standard error conditions
- Validate message structure according to the JSON schemas
- Support at least one transport method (see transport.md)

A compliant implementation SHOULD:
- Implement the core methods defined in Section 4
- Support event subscriptions and delivery
- Provide meaningful error messages
- Implement proper capability negotiation

## 11. Security Considerations

See [security.md](security.md) for detailed security considerations including:
- Token-based authentication
- Transport security
- Threat model analysis

## 12. References

- [RFC 2119](https://tools.ietf.org/html/rfc2119) - Key words for use in RFCs to Indicate Requirement Levels
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification) - JSON-RPC 2.0 Specification
- [JSON Schema](https://json-schema.org/) - JSON Schema specification