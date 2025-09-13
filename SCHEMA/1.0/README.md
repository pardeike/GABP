# GABP 1.0 Schemas

This directory contains machine-readable JSON Schema definitions for GABP (Game Agent Bridge Protocol) version 1.0.

## Schema Files

- **[envelope.schema.json](envelope.schema.json)** - Core message envelope structure for all GABP messages
- **[methods/](methods/)** - Schemas for specific method requests and responses
- **[events/](events/)** - Schemas for event message structures  
- **[common/](common/)** - Shared schema definitions used across multiple message types

## Schema Standard

All schemas use JSON Schema Draft 2020-12 and include:
- **$id** - Canonical URL for the schema
- **$schema** - JSON Schema dialect version
- **title** - Human-readable name
- Proper type definitions and validation rules

## Using These Schemas

### With AJV (Node.js)
```bash
npm install -g ajv-cli
ajv -s envelope.schema.json -d 'your-message.json'
```

### With Python jsonschema
```python
import json
import jsonschema

with open('envelope.schema.json') as f:
    schema = json.load(f)
    
with open('your-message.json') as f:
    message = json.load(f)
    
jsonschema.validate(message, schema)
```

### Programmatic Validation
The schemas are designed to be used in applications for:
- Runtime message validation
- Code generation
- Documentation generation
- IDE autocompletion and validation

## Schema Organization

### Envelope Schema
The `envelope.schema.json` defines the basic structure all GABP messages must follow:
- Message versioning (`v: "gabp/1"`)
- Unique message IDs
- Message types (request, response, event)
- Common fields and validation rules

### Method Schemas  
Each method has dedicated request/response schemas that inherit from the envelope structure while adding method-specific validation.

### Event Schemas
Event messages have their own structure with channels, sequence numbers, and payloads.

### Common Schemas
Shared definitions like error objects, tool definitions, and capability structures.

## Validation in CI

These schemas are validated in continuous integration to ensure:
- All example messages conform to schemas
- Schema syntax is valid JSON Schema
- Cross-references between schemas resolve correctly