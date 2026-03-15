# Common Schemas

This directory contains shared JSON Schema definitions used across multiple GABP message types. These schemas define reusable components that maintain consistency across the protocol.

## Schema Files

- **[error.schema.json](error.schema.json)** - Error object structure for response messages
- **[tool.schema.json](tool.schema.json)** - Tool definition structure for tools/list responses
- **[capabilities.schema.json](capabilities.schema.json)** - Capability declaration for session/welcome

## Error Schema

Defines the structure for error objects in response messages:
```json
{
  "code": -32601,
  "message": "Method not found", 
  "data": { /* optional additional error data */ }
}
```

Key properties:
- **code** - Integer error code (follows JSON-RPC conventions)
- **message** - Human-readable error description
- **data** - Optional additional error information

## Tool Schema

Defines the structure for tool definitions in tools/list responses:
```json
{
  "name": "inventory/get_items",
  "title": "Get Player Items",
  "description": "Retrieve items from a player's inventory",
  "inputSchema": { /* JSON Schema for parameters */ },
  "outputSchema": { /* JSON Schema for results */ },
  "tags": ["inventory", "player"]
}
```

Key properties:
- **name** - Unique tool identifier (lowercase with slashes)
- **title** - Human-readable tool name
- **description** - What the tool does
- **inputSchema** - JSON Schema for tool parameters
- **outputSchema** - JSON Schema for tool results  
- **tags** - Optional categorization tags

## Capabilities Schema

Defines the structure for capability declarations in session/welcome:
```json
{
  "tools": ["inventory/get", "world/place_block"],
  "events": ["player/move", "world/block_change"],
  "resources": ["world/schematic", "config/settings"]
}
```

Key properties:
- **tools** - Array of available tool names
- **events** - Array of available event channel names
- **resources** - Array of available resource URI patterns

## Usage in Other Schemas

These common schemas are referenced by other schemas using JSON Schema `$ref`:

```json
{
  "error": { "$ref": "../common/error.schema.json" },
  "capabilities": { "$ref": "../common/capabilities.schema.json" }
}
```

## Validation

Common schemas can be validated independently:
```bash
ajv -s error.schema.json -d 'example-error.json'
ajv -s tool.schema.json -d 'example-tool.json'
```