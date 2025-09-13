# GABP 1.0 Conformance Tests

This directory contains conformance test cases for validating GABP implementations. These tests ensure that implementations correctly handle valid and invalid messages.

## Test Categories

- **[valid/](valid/)** - Messages that should validate successfully and be accepted
- **[invalid/](invalid/)** - Messages that should be rejected due to schema violations

## Purpose

Conformance tests serve multiple purposes:

### For Implementers
- Verify your implementation handles edge cases correctly
- Test error handling for malformed messages
- Ensure compatibility with the GABP specification

### For Protocol Development
- Validate schema definitions catch expected errors
- Document expected behavior for corner cases
- Regression testing during protocol evolution

### For Continuous Integration
- Automated validation that examples conform to schemas
- Prevent accidental breaking changes to schemas
- Ensure consistency between specification and implementation

## Running Conformance Tests

### Valid Messages
All messages in `valid/` should validate against their respective schemas:

```bash
# Test all valid messages against envelope schema
ajv -s ../../SCHEMA/1.0/envelope.schema.json -d 'valid/*.json'

# Test specific method messages
ajv -s ../../SCHEMA/1.0/methods/session.hello.request.json -d 'valid/session-hello-*.json'
```

### Invalid Messages  
All messages in `invalid/` should fail validation:

```bash
# Test invalid messages (should fail)
ajv -s ../../SCHEMA/1.0/envelope.schema.json -d 'invalid/*.json' --invalid
```

The `--invalid` flag tells AJV that validation failures are expected.

## Test Organization

Test files are named to indicate what they test:
- `valid-session-hello-basic.json` - Basic valid session/hello message
- `invalid-missing-version.json` - Message missing required version field
- `invalid-wrong-type.json` - Message with invalid type field

## CI Integration

These tests run automatically in GitHub Actions to ensure:
- All valid messages pass schema validation
- All invalid messages fail schema validation as expected
- Schema changes don't break existing valid messages
- New invalid cases are properly caught

## Adding New Tests

When adding conformance tests:
1. Include both positive and negative test cases
2. Test edge cases and boundary conditions  
3. Document what each test validates in comments
4. Follow the naming convention for discoverability