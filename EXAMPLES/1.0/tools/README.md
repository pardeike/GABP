# Tool Examples

This directory contains examples of GABP tool discovery and invocation. Tools are functions that the mod exposes to allow the bridge to interact with the game.

## Files

- **[010_tools-list.req.json](010_tools-list.req.json)** - Request to list all available tools
- **[011_tools-list.res.json](011_tools-list.res.json)** - Response with tool definitions

## Tool Discovery Flow

After completing the handshake, the bridge typically discovers available tools:

1. **Bridge → Mod**: `tools/list` request (optionally with filters)
2. **Mod → Bridge**: `tools/list` response with array of tool definitions

## Tool Definition Structure

Each tool in the response includes:
- **name** - Unique identifier for the tool (e.g., "inventory/get_items")
- **title** - Human-readable name
- **description** - What the tool does
- **inputSchema** - JSON schema for tool parameters
- **outputSchema** - JSON schema for tool results
- **tags** - Optional categorization tags

## Tool Invocation

Once you know what tools are available, you can call them using `tools/call`:

```json
{
  "v": "gabp/1",
  "id": "uuid-here",
  "type": "request", 
  "method": "tools/call",
  "params": {
    "name": "inventory/get_items",
    "arguments": {
      "player": "steve"
    }
  }
}
```

## Common Tool Categories

Tools are typically organized by functionality:
- **inventory/** - Player inventory management
- **world/** - World manipulation (blocks, entities)
- **player/** - Player actions and status
- **game/** - Game mechanics and rules

## Validation

These examples validate against:
- `../../../SCHEMA/1.0/envelope.schema.json`
- `../../../SCHEMA/1.0/methods/tools.list.request.json`
- `../../../SCHEMA/1.0/methods/tools.list.response.json`