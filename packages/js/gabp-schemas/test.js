const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const {
  getValidator,
  schemas,
  validateMessage,
  validateWithSchema
} = require('./index.js');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
}

function listSchemaNames(collection) {
  return Object.keys(collection).sort();
}

function expectedNamesFor(dirPath, suffixToRemove) {
  return fs
    .readdirSync(dirPath)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace(suffixToRemove, ''))
    .sort();
}

function verifySchemaInventory() {
  assert.ok(schemas.envelope, 'Envelope schema should be loaded');

  const methodsDir = path.join(__dirname, 'schemas', 'methods');
  const eventsDir = path.join(__dirname, 'schemas', 'events');
  const commonDir = path.join(__dirname, 'schemas', 'common');

  assert.deepStrictEqual(
    listSchemaNames(schemas.methods),
    expectedNamesFor(methodsDir, '.json'),
    'Method schemas should mirror the bundled schema directory'
  );
  assert.deepStrictEqual(
    listSchemaNames(schemas.events),
    expectedNamesFor(eventsDir, '.json'),
    'Event schemas should mirror the bundled schema directory'
  );
  assert.deepStrictEqual(
    listSchemaNames(schemas.common),
    expectedNamesFor(commonDir, '.schema.json'),
    'Common schemas should mirror the bundled schema directory'
  );
}

function verifyValidatorsCompile() {
  getValidator('envelope');

  for (const schemaName of listSchemaNames(schemas.common)) {
    getValidator(schemaName);
  }

  for (const schemaName of listSchemaNames(schemas.events)) {
    getValidator(schemaName);
  }

  for (const schemaName of listSchemaNames(schemas.methods)) {
    getValidator(schemaName);
  }
}

function verifyValidationFlows() {
  const helloRequest = {
    v: 'gabp/1',
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'request',
    method: 'session/hello',
    params: {
      token: 'a1b2c3d4e5f6789012345678901234567890abcdef',
      bridgeVersion: '1.0.0',
      platform: 'windows',
      launchId: '550e8400-e29b-41d4-a716-446655440001'
    }
  };

  const welcomeResponse = {
    v: 'gabp/1',
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'response',
    result: {
      agentId: 'minecraft-mod-v2.1',
      app: {
        name: 'Minecraft',
        version: '1.20.4'
      },
      capabilities: {
        methods: ['tools/list', 'tools/call', 'state/get'],
        events: ['player/move'],
        resources: ['gabp://game/world']
      },
      schemaVersion: '1.0'
    }
  };

  const stateGetRequest = {
    v: 'gabp/1',
    id: '550e8400-e29b-41d4-a716-446655440010',
    type: 'request',
    method: 'state/get',
    params: {
      components: ['player', 'inventory']
    }
  };

  const invalidEnvelope = {
    v: 'gabp/1',
    id: 'not-a-uuid',
    type: 'response',
    result: {}
  };

  assert.equal(validateMessage(helloRequest).valid, true, 'Envelope validation should accept a valid request');
  assert.equal(
    validateWithSchema('session.hello.request', helloRequest).valid,
    true,
    'session.hello.request should validate a valid hello message'
  );
  assert.equal(
    validateWithSchema('session.welcome.response', welcomeResponse).valid,
    true,
    'session.welcome.response should compile and validate referenced capabilities schema'
  );
  assert.equal(
    validateWithSchema('state.get.request', stateGetRequest).valid,
    true,
    'state.get.request should be bundled and validated'
  );
  assert.equal(
    validateMessage(invalidEnvelope).valid,
    false,
    'Envelope validation should reject malformed messages'
  );
}

function verifyBundledSchemasMatchRepository() {
  const repoSchemaDir = path.resolve(__dirname, '..', '..', '..', 'SCHEMA', '1.0');
  if (!fs.existsSync(repoSchemaDir)) {
    return;
  }

  const rootEnvelope = readJson(path.join('..', '..', '..', 'SCHEMA', '1.0', 'envelope.schema.json'));
  const bundledEnvelope = readJson(path.join('schemas', 'envelope.schema.json'));

  assert.deepStrictEqual(
    bundledEnvelope,
    rootEnvelope,
    'Bundled envelope schema should match the canonical repo schema'
  );
}

verifySchemaInventory();
verifyValidatorsCompile();
verifyValidationFlows();
verifyBundledSchemasMatchRepository();

console.log('gabp-schemas package checks passed.');
