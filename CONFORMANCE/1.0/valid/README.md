# Valid Conformance Test Cases

This directory contains GABP messages that should validate successfully against the schemas. These represent correct, well-formed messages that implementations should accept.

## Test Categories

### Basic Message Types
- **Request messages** - Properly formatted method calls from bridge to mod
- **Response messages** - Valid responses from mod to bridge (success and error cases)
- **Event messages** - Well-formed event notifications from mod to bridge

### Method Coverage
Tests cover all standard GABP methods:
- Session management (`session/hello`, `session/welcome`)
- Tool operations (`tools/list`, `tools/call`) 
- Event management (`events/subscribe`, `events/unsubscribe`)
- Resource access (`resources/list`, `resources/read`)
- State management (`state/get`, `state/set`)

### Edge Cases
Valid tests also cover acceptable edge cases:
- **Minimal messages** - Messages with only required fields
- **Maximal messages** - Messages with all optional fields populated
- **Empty collections** - Empty arrays, objects where allowed
- **Boundary values** - Minimum/maximum allowed values
- **Unicode handling** - Non-ASCII characters in strings

## Message Validation

All messages in this directory should:
- Pass validation against `../../../SCHEMA/1.0/envelope.schema.json`
- Pass validation against their specific method schemas
- Demonstrate correct GABP protocol usage

## Running Tests

Validate all messages in this directory:

```bash
# Basic envelope validation
ajv -s ../../../SCHEMA/1.0/envelope.schema.json -d '*.json'

# Method-specific validation (example)
ajv -s ../../../SCHEMA/1.0/methods/session.hello.request.json -d 'session-hello-*.json'
```

## File Naming

Valid test files follow naming patterns:
- `valid-<method>-<case>.json` - e.g., `valid-session-hello-basic.json`
- `valid-<type>-<case>.json` - e.g., `valid-event-player-move.json`
- `valid-envelope-<case>.json` - General envelope structure tests

## Expected Behavior

When an implementation encounters messages like these:
- **Parsing** should succeed without errors
- **Schema validation** should pass
- **Protocol handling** should process the message appropriately
- **Responses** should be generated as specified in the protocol

These tests represent the "happy path" scenarios that all GABP implementations must handle correctly.