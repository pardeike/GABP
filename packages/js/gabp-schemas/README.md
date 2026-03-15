# gabp-schemas

Versioned GABP JSON Schemas for Node.js and TypeScript.

The package bundles the canonical `SCHEMA/1.0` tree from this repository and preloads those schemas into AJV, so consumers validate against the same artifacts used by the protocol release.

## Install

```bash
npm install gabp-schemas
```

## API Surface

- `validateMessage(message)` validates the shared envelope schema only.
- `validateRequest(message)` validates a request against the envelope and, when available, the matching `*.request` method schema.
- `validateResponse(message)` validates response envelopes.
- `validateEvent(message)` validates an event against the envelope and `event.message`.
- `validateWithSchema(schemaName, data)` validates against a specific schema name.
- `getValidator(schemaName)` returns the compiled AJV validator.
- `schemas` exposes the loaded raw schemas.
- `ajv` exposes the configured AJV instance.

## Schema Names

Use these schema names with `getValidator()` and `validateWithSchema()`:

- `envelope`
- `session.hello.request`
- `tools.call.response`
- `event.message`
- `tool`, `error`, `capabilities`

## Usage

```javascript
const {
  validateRequest,
  validateWithSchema,
  schemas,
} = require('gabp-schemas');

const helloRequest = {
  v: 'gabp/1',
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'request',
  method: 'session/hello',
  params: {
    token: 'abc123...',
    bridgeVersion: '1.0.0',
    platform: 'windows',
    launchId: 'session-123'
  }
};

const requestResult = validateRequest(helloRequest);
if (!requestResult.valid) {
  console.error(requestResult.errors);
}

const stateGetResult = validateWithSchema('state.get.request', {
  v: 'gabp/1',
  id: '550e8400-e29b-41d4-a716-446655440010',
  type: 'request',
  method: 'state/get',
  params: {
    components: ['player', 'inventory']
  }
});

console.log(stateGetResult.valid);
console.log(schemas.envelope.$id);
```

## TypeScript

Type declarations are bundled with the package:

```typescript
import {
  validateRequest,
  type GabpMessage,
  type ValidationResult,
} from 'gabp-schemas';

const message: GabpMessage = {
  v: 'gabp/1',
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'request',
  method: 'session/hello',
  params: {
    token: 'abc123...',
    bridgeVersion: '1.0.0',
    platform: 'windows',
    launchId: 'session-123'
  }
};

const result: ValidationResult = validateRequest(message);
```

## Included Assets

The published tarball includes:

- `index.js`
- `index.d.ts`
- `schemas/`
- `README.md`
