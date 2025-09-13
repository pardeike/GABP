# gabp-schemas

JSON Schemas for the Game Agent Bridge Protocol (GABP) - a protocol for communication between game mods and external automation tools.

## Installation

```bash
npm install gabp-schemas
```

## Usage

### Basic Validation

```javascript
const { validateMessage, schemas } = require('gabp-schemas');

// Validate a GABP message
const message = {
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "request",
  "method": "session/hello",
  "params": {
    "token": "abc123...",
    "bridgeVersion": "1.0.0",
    "platform": "windows",
    "launchId": "session-123"
  }
};

const result = validateMessage(message);
if (result.valid) {
  console.log('Message is valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Advanced Usage

```javascript
const { getValidator, schemas } = require('gabp-schemas');

// Get specific validator
const sessionHelloValidator = getValidator('session.hello.request');
const isValid = sessionHelloValidator(message);

// Access raw schemas
console.log(schemas.envelope);
console.log(schemas.methods['session.hello.request']);
```

### TypeScript Support

```typescript
import { validateMessage, GabpMessage, ValidationResult } from 'gabp-schemas';

const message: GabpMessage = {
  v: "gabp/1",
  id: "550e8400-e29b-41d4-a716-446655440000",
  type: "request",
  method: "session/hello",
  params: {
    token: "abc123...",
    bridgeVersion: "1.0.0", 
    platform: "windows",
    launchId: "session-123"
  }
};

const result: ValidationResult = validateMessage(message);
```

## API Reference

### Functions

#### `validateMessage(message: any): ValidationResult`

Validates a GABP message against the envelope schema.

**Parameters:**
- `message` - The message object to validate

**Returns:** `ValidationResult` object with:
- `valid: boolean` - Whether the message is valid
- `errors?: ErrorObject[]` - Validation errors (if invalid)

#### `getValidator(schemaName: string): ValidateFunction`

Gets a compiled validator for a specific schema.

**Parameters:**
- `schemaName` - Schema identifier (e.g., 'envelope', 'session.hello.request')

**Returns:** Compiled AJV validator function

#### `validateWithSchema(schemaName: string, data: any): ValidationResult`

Validates data against a specific schema.

**Parameters:**
- `schemaName` - Schema identifier
- `data` - Data to validate

**Returns:** `ValidationResult` object

### Properties

#### `schemas: SchemaCollection`

Object containing all loaded schemas:

```javascript
{
  envelope: { /* envelope schema */ },
  methods: {
    'session.hello.request': { /* schema */ },
    'session.welcome.response': { /* schema */ },
    // ... other method schemas
  },
  events: {
    'event.message': { /* schema */ }
  },
  common: {
    'error': { /* schema */ },
    'tool': { /* schema */ },
    'capabilities': { /* schema */ }
  }
}
```

## Available Schemas

### Core Schemas

- **envelope** - Base message envelope (request/response/event)
- **common/error** - Error object structure
- **common/tool** - Tool metadata format
- **common/capabilities** - Capability negotiation format

### Method Schemas

#### Session Management
- **session.hello.request** - Session initialization request
- **session.welcome.response** - Session welcome response

#### Tool Management  
- **tools.list.request** - List available tools
- **tools.list.response** - Tools list response
- **tools.call.request** - Invoke tool request
- **tools.call.response** - Tool invocation response

#### Event Management
- **events.subscribe.request** - Subscribe to event channels
- **events.unsubscribe.request** - Unsubscribe from channels

#### Resource Management
- **resources.list.request** - List available resources
- **resources.list.response** - Resource list response  
- **resources.read.request** - Read resource content

### Event Schemas

- **event.message** - Event message format

## Examples

### Session Handshake

```javascript
// Session hello request
const helloRequest = {
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "request",
  "method": "session/hello",
  "params": {
    "token": "a1b2c3d4e5f6789012345678901234567890abcdef",
    "bridgeVersion": "1.0.0",
    "platform": "windows",
    "launchId": "550e8400-e29b-41d4-a716-446655440001"
  }
};

// Session welcome response
const welcomeResponse = {
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
      "methods": ["tools/list", "tools/call"],
      "events": ["player/move"],
      "resources": ["gabp://game/world"]
    },
    "schemaVersion": "1.0"
  }
};
```

### Tool Operations

```javascript
// List tools request
const toolsListRequest = {
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440010", 
  "type": "request",
  "method": "tools/list",
  "params": {}
};

// Call tool request
const toolCallRequest = {
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "type": "request", 
  "method": "tools/call",
  "params": {
    "name": "inventory.get",
    "arguments": {
      "playerId": "steve"
    }
  }
};
```

### Event Messages

```javascript
// Event message
const eventMessage = {
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "type": "event",
  "channel": "player/move",
  "seq": 42,
  "payload": {
    "playerId": "steve", 
    "position": {"x": 100, "y": 64, "z": 200}
  }
};
```

## Error Handling

```javascript
const result = validateMessage(invalidMessage);

if (!result.valid) {
  result.errors.forEach(error => {
    console.log(`Error at ${error.instancePath}: ${error.message}`);
    console.log(`Invalid value:`, error.data);
  });
}
```

## License

Apache-2.0 - see [LICENSE](../../../LICENSES/CODE-LICENSE.txt) for details.

## Links

- [GABP Specification](../../../README.md)
- [GitHub Repository](https://github.com/pardeike/GABP)
- [Issue Tracker](https://github.com/pardeike/GABP/issues)