# GABP 1.0 Examples

This directory contains working examples of GABP (Game Agent Bridge Protocol) messages that demonstrate the protocol in action.

## Directory Structure

- **[handshake/](handshake/)** - Session initiation examples showing the hello/welcome exchange
- **[tools/](tools/)** - Tool discovery and invocation examples
- **[events/](events/)** - Event subscription and notification examples  
- **[state/](state/)** - State management examples for getting and setting game state

## Using These Examples

Each example file shows a complete GABP message in JSON format. These can be used to:

- Understand the protocol message structure
- Test your GABP implementation
- Validate against the schemas in `../../SCHEMA/1.0/`
- Learn the expected flow of communications

## Message Naming Convention

Files are numbered to show typical interaction flows:
- `001_`, `002_`, etc. - Sequential messages in a conversation
- `.req.json` - Request messages (from bridge to mod)
- `.res.json` - Response messages (from mod to bridge)
- `.msg.json` - Event messages

## Validation

You can validate these examples against the GABP schemas:

```bash
npm install -g ajv-cli
ajv -s ../../SCHEMA/1.0/envelope.schema.json -d '**/*.json'
```

All examples in this directory should validate successfully against the envelope schema and their specific method schemas.