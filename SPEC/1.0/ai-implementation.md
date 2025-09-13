# GABP AI Implementation Guide

This guide is specifically designed for AI assistants, automated tools, and developers using AI to implement
GABP-compliant bridges (clients) and mods (servers).

## Quick Reference for AI Context

### Protocol Summary

GABP (Game Agent Bridge Protocol) enables AI tools to communicate with game modifications using JSON messages
over local connections. Think of it as a standardized API for AI-game interaction.

**Core Pattern**: Client (bridge/AI tool) ↔ Server (mod/game)

**Message Structure**: All messages are JSON with LSP-style framing:

```text
Content-Length: <bytes>\r\n\r\n
{"v":"gabp/1","id":"<uuid>","type":"request|response|event",...}
```

**Authentication**: Shared token from local config file, connections restricted to localhost only.

### Essential Message Types

1. **Request**: `{"v":"gabp/1","id":"uuid","type":"request","method":"session/hello","params":{...}}`
2. **Response**: `{"v":"gabp/1","id":"uuid","type":"response","result":{...} OR "error":{...}}`
3. **Event**: `{"v":"gabp/1","id":"uuid","type":"event","channel":"player/move","seq":0,"payload":{...}}`

## AI Prompt Templates

### For Building a Bridge (AI Client)

```text
I need to build a GABP bridge client. Here are the requirements:

PROTOCOL: GABP 1.0 - JSON-RPC-like protocol for AI-game communication
ROLE: Bridge (client) connecting to game mod (server)
TRANSPORT: Choose stdio, TCP localhost, or named pipes with LSP framing
AUTH: Token-based using shared config file

IMPLEMENTATION STEPS:

1. CONNECTION:
   - Read token from config: ~/.config/gabp/bridge.json (Linux), %APPDATA%\gabp\bridge.json (Windows)
   - Connect via chosen transport
   - Frame messages with LSP headers: "Content-Length: N\r\n\r\n{json}"

2. HANDSHAKE:
   Send: {"v":"gabp/1","id":"<uuid>","type":"request","method":"session/hello","params":{"token":"...","bridgeVersion":"1.0.0","platform":"linux","launchId":"session-123"}}
   Expect: {"v":"gabp/1","id":"<same>","type":"response","result":{"agentId":"...","capabilities":{...}}}

3. CAPABILITIES:
   Parse capabilities.tools, capabilities.events, capabilities.resources from welcome response

4. OPERATIONS:
   - List tools: {"method":"tools/list","params":{}}
   - Call tool: {"method":"tools/call","params":{"name":"inventory/get","parameters":{...}}}
   - Subscribe events: {"method":"events/subscribe","params":{"channels":["player/move"]}}
   - Handle events: {"type":"event","channel":"player/move","seq":0,"payload":{...}}

5. ERROR HANDLING:
   - Check response.error field 
   - Handle JSON-RPC error codes: -32601 (method not found), -32602 (invalid params), etc.

VALIDATION:
- All messages must have v="gabp/1", valid UUID id, correct type
- Requests need method, responses need result OR error, events need channel/seq/payload
- Use JSON Schema validation against schemas in SCHEMA/1.0/

CODE STRUCTURE:
class GABPBridge {
  async connect(transport) { /* setup connection */ }
  async hello(token) { /* handshake */ }
  async listTools() { /* discover tools */ }
  async callTool(name, params) { /* execute tool */ }
  async subscribe(channels) { /* subscribe to events */ }
  on(event, handler) { /* event handling */ }
}
```

### For Building a Mod (Game Server)

```text
I need to build a GABP mod server inside a game. Here are the requirements:

PROTOCOL: GABP 1.0 - JSON-RPC-like protocol for AI-game communication  
ROLE: Mod (server) exposing game functionality to AI bridges (clients)
TRANSPORT: Listen on stdio, TCP localhost, or named pipes with LSP framing
AUTH: Validate tokens against bridge config file

IMPLEMENTATION STEPS:

1. SERVER SETUP:
   - Listen on chosen transport (stdio/TCP/pipes)
   - Parse LSP-framed messages: "Content-Length: N\r\n\r\n{json}"
   - Validate tokens against bridge config file

2. SESSION HANDLING:
   Receive: {"method":"session/hello","params":{"token":"...","bridgeVersion":"...","platform":"...","launchId":"..."}}
   Send: {"type":"response","result":{"agentId":"my-game-mod-v1.0","app":{"name":"MyGame","version":"1.2.0"},"capabilities":{"tools":[...],"events":[...],"resources":[...]},"schemaVersion":"1.0"}}

3. TOOL SYSTEM:
   - Implement tools/list: Return available tools with input/output schemas
   - Implement tools/call: Execute named tool with parameters, return result
   - Map tools to actual game functions (inventory access, world modification, etc.)

4. EVENT SYSTEM: 
   - Implement events/subscribe: Track which channels each connection wants
   - Hook into game's event system 
   - Emit events: {"type":"event","channel":"player/move","seq":N,"payload":{...}}
   - Maintain sequence numbers per channel

5. RESOURCE SYSTEM:
   - Implement resources/list: Expose game data as URI-addressable resources
   - Implement resources/read: Return resource content by URI
   - Support game state queries: gabp://game/world, gabp://game/players, etc.

GAME INTEGRATION POINTS:
- Player events: movement, actions, chat
- World events: block changes, entity spawns, weather  
- Inventory tools: get/set player inventory
- World tools: place/break blocks, spawn entities
- Query tools: get player info, world state

ERROR HANDLING:
- Use JSON-RPC error codes
- Validate tool parameters against schemas
- Handle game state errors gracefully

CODE STRUCTURE:
class GABPMod {
  constructor(game) { /* integrate with game */ }
  listen(transport) { /* start server */ }
  handleRequest(msg) { /* route method calls */ }
  registerTool(name, schema, handler) { /* add tool */ }
  emitEvent(channel, payload) { /* broadcast event */ }
  addResource(uri, provider) { /* expose resource */ }
}
```

### For Integration Testing

```text
Create comprehensive GABP integration tests:

TEST SCENARIOS:
1. Connection and handshake flow
2. Tool discovery and execution
3. Event subscription and delivery
4. Resource listing and reading  
5. Error handling for invalid messages
6. Concurrent request handling
7. Connection drop/reconnect behavior

TEST STRUCTURE:
- Use examples from CONFORMANCE/1.0/valid/ as test cases
- Validate against JSON schemas in SCHEMA/1.0/
- Test with invalid messages from CONFORMANCE/1.0/invalid/
- Verify error codes match JSON-RPC standards

VALIDATION CHECKLIST:
□ All messages have correct envelope (v, id, type)
□ Requests have method, responses have result OR error  
□ Events have channel, seq, payload
□ UUIDs are properly formatted
□ Error codes follow JSON-RPC convention
□ Event sequence numbers increment correctly per channel
□ Tools execute and return expected results
□ Resources are accessible via URI patterns
```

## Implementation Patterns

### Message Validation

```javascript
function validateMessage(msg) {
  if (!msg.v || msg.v !== "gabp/1") throw new Error("Invalid version");
  if (!msg.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(msg.id)) 
    throw new Error("Invalid UUID");
  if (!["request","response","event"].includes(msg.type)) 
    throw new Error("Invalid type");
    
  switch(msg.type) {
    case "request":
      if (!msg.method) throw new Error("Request missing method");
      break;
    case "response": 
      if (!msg.result && !msg.error) throw new Error("Response missing result/error");
      if (msg.result && msg.error) throw new Error("Response has both result and error");
      break;
    case "event":
      if (!msg.channel || typeof msg.seq !== "number" || !msg.payload) 
        throw new Error("Invalid event structure");
      break;
  }
}
```

### LSP Message Framing

```javascript
// Send LSP-framed message
function sendMessage(socket, obj) {
  const json = JSON.stringify(obj);
  const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
  socket.write(header + json);
}

// Parse LSP-framed messages
class LSPParser {
  constructor() {
    this.buffer = "";
    this.expecting = null;
  }
  
  parse(data) {
    this.buffer += data;
    const messages = [];
    
    while (this.buffer.length > 0) {
      if (!this.expecting) {
        const headerEnd = this.buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) break;
        
        const header = this.buffer.slice(0, headerEnd);
        const match = header.match(/Content-Length: (\d+)/);
        if (!match) throw new Error("Invalid LSP header");
        
        this.expecting = parseInt(match[1]);
        this.buffer = this.buffer.slice(headerEnd + 4);
      }
      
      if (this.buffer.length >= this.expecting) {
        const json = this.buffer.slice(0, this.expecting);
        messages.push(JSON.parse(json));
        this.buffer = this.buffer.slice(this.expecting);
        this.expecting = null;
      } else {
        break;
      }
    }
    
    return messages;
  }
}
```

### Error Response Helper

```javascript
function createError(requestId, code, message, data = null) {
  return {
    "v": "gabp/1",
    "id": requestId,
    "type": "response", 
    "error": {
      "code": code,
      "message": message,
      ...(data && { "data": data })
    }
  };
}

// Standard error codes
const ERRORS = {
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601, 
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  PARSE_ERROR: -32700
};
```

### Event Management

```javascript
class EventManager {
  constructor() {
    this.sequences = new Map(); // channel -> sequence number
    this.subscriptions = new Map(); // connection -> Set<channels>
  }
  
  subscribe(connection, channels) {
    if (!this.subscriptions.has(connection)) {
      this.subscriptions.set(connection, new Set());
    }
    channels.forEach(ch => this.subscriptions.get(connection).add(ch));
  }
  
  emit(channel, payload) {
    const seq = this.sequences.get(channel) || 0;
    this.sequences.set(channel, seq + 1);
    
    const event = {
      "v": "gabp/1",
      "id": crypto.randomUUID(),
      "type": "event",
      "channel": channel, 
      "seq": seq,
      "payload": payload
    };
    
    // Send to subscribers
    for (let [conn, channels] of this.subscriptions) {
      if (channels.has(channel)) {
        this.sendMessage(conn, event);
      }
    }
  }
}
```

## Common Implementation Mistakes

1. **Wrong Version**: Must use `"gabp/1"`, not `"1.0"` or `"gabp/1.0"`
2. **UUID Format**: Must be valid UUID v4, not just random string
3. **Response Structure**: Must have exactly one of `result` or `error`, not both or neither
4. **Event Sequencing**: Events must have incrementing `seq` per channel
5. **Method Names**: Must use lowercase with forward slashes: `"tools/list"` not `"toolsList"`
6. **LSP Framing**: Must use CRLF (`\r\n`) line endings in headers
7. **Error Codes**: Should use JSON-RPC standard codes, not HTTP status codes
8. **Transport Security**: TCP connections must bind to localhost only, never 0.0.0.0

## Schema Locations

All JSON schemas are in `SCHEMA/1.0/` directory:

- `envelope.schema.json` - Main message envelope
- `methods/session.hello.request.json` - Hello request format
- `methods/session.welcome.response.json` - Welcome response format
- `methods/tools.list.*.json` - Tool listing methods
- `methods/tools.call.*.json` - Tool execution methods
- `methods/events.subscribe.request.json` - Event subscription
- `events/event.message.json` - Event message format
- `common/` - Shared definitions (error, tool, capabilities schemas)

## Testing Resources

- `EXAMPLES/1.0/` - Working message examples for all methods
- `CONFORMANCE/1.0/valid/` - Messages that should validate successfully  
- `CONFORMANCE/1.0/invalid/` - Messages that should fail validation

Use these for comprehensive testing of your implementation.
