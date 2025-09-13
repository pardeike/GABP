const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// Initialize AJV with formats
const ajv = new Ajv({ 
  allErrors: true,
  verbose: true,
  strict: false 
});
addFormats(ajv);

// Load schemas from the schema directory
function loadSchemas() {
  const schemasDir = path.join(__dirname, 'schemas');
  const schemas = {
    envelope: null,
    methods: {},
    events: {},
    common: {}
  };

  // Load envelope schema
  const envelopePath = path.join(schemasDir, 'envelope.schema.json');
  if (fs.existsSync(envelopePath)) {
    schemas.envelope = JSON.parse(fs.readFileSync(envelopePath, 'utf8'));
  }

  // Load method schemas
  const methodsDir = path.join(schemasDir, 'methods');
  if (fs.existsSync(methodsDir)) {
    const methodFiles = fs.readdirSync(methodsDir);
    methodFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const name = file.replace('.json', '');
        const filePath = path.join(methodsDir, file);
        schemas.methods[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    });
  }

  // Load event schemas
  const eventsDir = path.join(schemasDir, 'events');
  if (fs.existsSync(eventsDir)) {
    const eventFiles = fs.readdirSync(eventsDir);
    eventFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const name = file.replace('.json', '');
        const filePath = path.join(eventsDir, file);
        schemas.events[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    });
  }

  // Load common schemas
  const commonDir = path.join(schemasDir, 'common');
  if (fs.existsSync(commonDir)) {
    const commonFiles = fs.readdirSync(commonDir);
    commonFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const name = file.replace('.schema.json', '');
        const filePath = path.join(commonDir, file);
        schemas.common[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    });
  }

  return schemas;
}

// Load all schemas
const schemas = loadSchemas();

// Compile validators
const validators = new Map();

function getValidator(schemaName) {
  if (validators.has(schemaName)) {
    return validators.get(schemaName);
  }

  let schema;
  if (schemaName === 'envelope') {
    schema = schemas.envelope;
  } else if (schemas.methods[schemaName]) {
    schema = schemas.methods[schemaName];
  } else if (schemas.events[schemaName]) {
    schema = schemas.events[schemaName];
  } else if (schemas.common[schemaName]) {
    schema = schemas.common[schemaName];
  } else {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  if (!schema) {
    throw new Error(`Schema not found: ${schemaName}`);
  }

  const validator = ajv.compile(schema);
  validators.set(schemaName, validator);
  return validator;
}

function validateMessage(message) {
  const validator = getValidator('envelope');
  const valid = validator(message);
  
  return {
    valid,
    errors: valid ? undefined : validator.errors
  };
}

function validateWithSchema(schemaName, data) {
  const validator = getValidator(schemaName);
  const valid = validator(data);
  
  return {
    valid,
    errors: valid ? undefined : validator.errors
  };
}

// Validate specific message types
function validateRequest(message) {
  if (!message || message.type !== 'request') {
    return {
      valid: false,
      errors: [{ message: 'Message must be a request type' }]
    };
  }

  // First validate against envelope
  const envelopeResult = validateMessage(message);
  if (!envelopeResult.valid) {
    return envelopeResult;
  }

  // Try to validate against specific method schema
  const methodName = message.method;
  if (methodName) {
    const schemaName = `${methodName.replace('/', '.')}.request`;
    try {
      return validateWithSchema(schemaName, message);
    } catch (e) {
      // Method-specific schema not found, envelope validation is sufficient
    }
  }

  return envelopeResult;
}

function validateResponse(message) {
  if (!message || message.type !== 'response') {
    return {
      valid: false,
      errors: [{ message: 'Message must be a response type' }]
    };
  }

  return validateMessage(message);
}

function validateEvent(message) {
  if (!message || message.type !== 'event') {
    return {
      valid: false,
      errors: [{ message: 'Message must be an event type' }]
    };
  }

  // First validate against envelope
  const envelopeResult = validateMessage(message);
  if (!envelopeResult.valid) {
    return envelopeResult;
  }

  // Validate against event message schema
  try {
    return validateWithSchema('event.message', message);
  } catch (e) {
    // Event message schema not found, envelope validation is sufficient
    return envelopeResult;
  }
}

module.exports = {
  // Core validation functions
  validateMessage,
  validateWithSchema,
  getValidator,
  
  // Type-specific validators
  validateRequest,
  validateResponse,
  validateEvent,
  
  // Schema access
  schemas,
  
  // AJV instance for advanced usage
  ajv
};