# GABP 1.0 Transport Specification

**Version**: 1.0  
**Status**: Draft  
**Date**: 2025-01-02

## Abstract

This document explains how GABP (Game Agent Bridge Protocol) connections work. It covers the different ways to connect, how messages are sent, and how connections are established.

## 1. Connection Methods

GABP implementations must support at least one of these connection methods:

### 1.1 Standard Input/Output (stdio)

The game mod reads from standard input and writes to standard output. The bridge starts the mod process and talks to it through pipes.

**How it works**: Bridge starts mod process and inherits stdin/stdout
**Address**: Not needed (process-based)  
**Security**: Process separation and token authentication
**Best for**: Local development and testing

### 1.2 TCP Socket

TCP connections using the local computer only (127.0.0.1).

**How it works**: Mod listens on 127.0.0.1 on an available port
**Address**: `127.0.0.1:<port>` where port is set in configuration
**Security**: Local-only connections + token authentication  
**Best for**: When the game and AI agent need to run separately

### 1.3 Named Pipes (Windows) / Unix Sockets

Platform-specific communication methods.

**Windows**: Named pipes like `\\.\pipe\gabp-<identifier>`
**Unix/Linux/macOS**: Unix sockets like `/tmp/gabp-<identifier>.sock`

**How it works**: Mod creates the pipe/socket, bridge connects to it
**Address**: Platform-specific path
**Security**: File system permissions + token authentication
**Best for**: High-performance local communication

## 2. Message Framing

GABP uses LSP (Language Server Protocol) style framing for all transport methods:

```
Content-Length: <number-of-bytes>\r\n
Content-Type: application/json\r\n
\r\n
<json-message>
```

### 2.1 Framing Rules

1. Each message MUST be prefixed with HTTP-style headers
2. The `Content-Length` header MUST specify the byte length of the JSON message
3. The `Content-Type` header MUST be `application/json`
4. Headers MUST be terminated with `\r\n\r\n`
5. The JSON message MUST immediately follow the headers
6. The JSON message MUST be valid UTF-8

### 2.2 Example Framed Message

```
Content-Length: 156\r\n
Content-Type: application/json\r\n
\r\n
{"v":"gabp/1","id":"550e8400-e29b-41d4-a716-446655440000","type":"request","method":"session/hello","params":{"token":"abc123","bridgeVersion":"1.0.0"}}
```

### 2.3 Parsing Algorithm

Implementations MUST parse messages as follows:

1. Read until `\r\n\r\n` is encountered
2. Parse headers to extract `Content-Length`
3. Read exactly `Content-Length` bytes
4. Parse the bytes as UTF-8 encoded JSON
5. Validate the JSON against the GABP envelope schema

## 3. Connection Establishment

### 3.1 TCP Connection

For TCP transport, the connection establishment process is:

1. **Configuration**: Bridge reads configuration to get port number and token
2. **Connection**: Bridge connects to `127.0.0.1:<port>`
3. **Handshake**: Bridge sends `session/hello` with authentication token
4. **Authentication**: Mod validates token and responds with `session/welcome`

### 3.2 stdio Connection

For stdio transport:

1. **Launch**: Bridge spawns mod process with appropriate command line
2. **Pipe Setup**: Bridge connects to mod's stdin/stdout
3. **Handshake**: Bridge sends `session/hello` with authentication token
4. **Authentication**: Mod validates token and responds with `session/welcome`

### 3.3 Named Pipe/Unix Socket Connection

For named pipe/Unix socket transport:

1. **Creation**: Mod creates named pipe/socket at known location
2. **Configuration**: Location is communicated via configuration file
3. **Connection**: Bridge connects to the named pipe/socket
4. **Handshake**: Bridge sends `session/hello` with authentication token
5. **Authentication**: Mod validates token and responds with `session/welcome`

## 4. AI Agent Development Workflow

### 4.1 Typical AI Agent Session

A typical AI agent development session follows this pattern:

1. **Game Launch**: AI tool starts the game/application with mod loaded
2. **Connection Setup**: Bridge establishes connection using one of the transport methods
3. **Authentication**: Secure handshake using token-based authentication  
4. **Discovery**: Agent discovers available game functionality via `tools/list` and `resources/list`
5. **Interaction Loop**: Agent reads game state, executes actions, and monitors events
6. **Cleanup**: Connection is terminated when session ends

### 4.2 Development Use Case

This workflow enables AI agents to work like human developers:

- **Code Testing**: AI can start the game to test code changes
- **State Inspection**: Real-time monitoring of game state during development
- **Automated Testing**: AI can run test scenarios and verify results
- **Debugging**: Event monitoring and state queries help identify issues
- **Rapid Iteration**: Fast connection setup enables quick development cycles

### 4.3 Connection Lifecycle Management

For AI agent development workflows:

- **Automatic Reconnection**: Bridge should reconnect if game restarts during development
- **Session Persistence**: Configuration and state should survive brief disconnections  
- **Resource Cleanup**: Proper cleanup when development session ends
- **Error Recovery**: Graceful handling of game crashes or network issues

## 5. Configuration

### 5.1 Configuration File Location

The bridge MUST write configuration to a platform-specific location:

- **Windows**: `%APPDATA%\gabp\bridge.json`
- **macOS**: `~/Library/Application Support/gabp/bridge.json`
- **Linux**: `~/.config/gabp/bridge.json`

### 5.2 Configuration File Format

The configuration file MUST be a JSON object with the following structure:

```json
{
  "token": "<authentication-token>",
  "transport": {
    "type": "tcp|stdio|pipe",
    "address": "<transport-specific-address>"
  },
  "metadata": {
    "pid": 12345,
    "startTime": "2025-01-02T10:30:00Z",
    "launchId": "session-uuid"
  }
}
```

### 5.3 Configuration Fields

- `token` (string, required): Authentication token for this session
- `transport.type` (string, required): Transport method ("tcp", "stdio", or "pipe")
- `transport.address` (string, conditional): Transport-specific address
  - For TCP: port number as string (e.g., "38917")
  - For pipes: pipe/socket path
  - Not used for stdio
- `metadata` (object, optional): Additional session information

### 5.4 Configuration Security

- Configuration file MUST have permissions restricting access to the current user only
- Configuration file MUST be created atomically to prevent race conditions
- Token MUST be cryptographically random (minimum 128 bits entropy)
- Token SHOULD rotate per session unless explicitly configured otherwise

## 6. Error Handling

### 6.1 Transport Errors

Common transport-level errors and handling:

- **Connection Refused**: Mod not running or port not available
- **Connection Lost**: Network error or process termination
- **Framing Error**: Invalid header format or content length mismatch
- **JSON Parse Error**: Invalid JSON in message body

### 6.2 Recovery Behavior

- Bridges SHOULD implement reconnection logic with exponential backoff
- Mods SHOULD continue accepting new connections after client disconnection
- Both parties MUST handle partial reads/writes gracefully

## 7. Performance Considerations

### 7.1 Message Size Limits

- Implementations SHOULD support messages up to 1MB in size
- Implementations MAY reject messages exceeding configured limits
- Large payloads SHOULD be transferred via resource URIs when possible

### 7.2 Connection Limits

- Mods MAY limit the number of concurrent connections
- Recommended limit: 10 concurrent bridge connections
- Mods SHOULD implement fair queuing for multiple clients

### 7.3 Buffering

- Implementations SHOULD buffer outgoing messages to avoid blocking
- Buffer size SHOULD be configurable with reasonable defaults
- Implementations MUST handle buffer overflow gracefully

## 8. Platform-Specific Considerations

### 8.1 Windows

- Named pipes: Use `\\.\pipe\gabp-<launchId>` format
- File permissions: Use Windows ACLs to restrict access
- Process spawning: Use appropriate Windows APIs for stdio redirection

### 7.2 macOS/Linux

- Unix sockets: Use `/tmp/gabp-<launchId>.sock` format
- File permissions: Set mode to 0600 (owner read/write only)
- Process spawning: Use fork/exec with proper pipe setup

### 7.3 Cross-Platform Libraries

Implementations SHOULD use established cross-platform libraries for:
- JSON parsing and generation
- UUID generation
- File system operations with proper permissions
- Network socket operations

## 8. Examples

### 8.1 TCP Configuration Example

```json
{
  "token": "a1b2c3d4e5f6789012345678901234567890abcdef",
  "transport": {
    "type": "tcp",
    "address": "38917"
  },
  "metadata": {
    "pid": 12345,
    "startTime": "2025-01-02T10:30:00Z",
    "launchId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 8.2 Named Pipe Configuration Example (Windows)

```json
{
  "token": "a1b2c3d4e5f6789012345678901234567890abcdef",
  "transport": {
    "type": "pipe",
    "address": "\\\\.\\pipe\\gabp-550e8400-e29b-41d4-a716-446655440000"
  },
  "metadata": {
    "pid": 12345,
    "startTime": "2025-01-02T10:30:00Z",
    "launchId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 8.3 Unix Socket Configuration Example

```json
{
  "token": "a1b2c3d4e5f6789012345678901234567890abcdef",
  "transport": {
    "type": "pipe",
    "address": "/tmp/gabp-550e8400-e29b-41d4-a716-446655440000.sock"
  },
  "metadata": {
    "pid": 12345,
    "startTime": "2025-01-02T10:30:00Z",
    "launchId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```