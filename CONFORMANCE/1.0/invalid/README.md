# Invalid Conformance Test Cases

This directory contains GABP messages that should fail validation against the schemas. These represent malformed, incorrect, or prohibited messages that implementations must reject.

## Test Categories

### Schema Violations
- **Missing required fields** - Messages lacking mandatory properties
- **Wrong field types** - Fields with incorrect data types
- **Invalid field values** - Values outside allowed ranges or patterns
- **Extra fields** - Additional properties where not allowed

### Protocol Violations  
- **Conflicting fields** - Messages with mutually exclusive properties
- **Invalid combinations** - Field combinations that violate protocol rules
- **Wrong message structure** - Incorrect envelope format

### Common Error Cases
- **Missing version** - Messages without the required `v` field
- **Wrong version** - Messages with invalid version strings
- **Missing ID** - Messages without unique identifiers
- **Invalid message types** - Unknown or incorrect `type` values
- **Method formatting** - Malformed method names
- **Response errors** - Responses with both `result` and `error` fields

## Expected Behavior

When implementations encounter these messages they should:
- **Reject** the message during parsing or validation
- **Return an error** (if it's a request message)
- **Log the issue** appropriately
- **Not crash** or enter an invalid state

## Validation Testing

Test that these messages fail validation as expected:

```bash
# Test invalid messages (should fail with --invalid flag)
ajv -s ../../../SCHEMA/1.0/envelope.schema.json -d '*.json' --invalid
```

The `--invalid` flag tells AJV that validation failures are expected and desired.

## File Naming

Invalid test files describe what's wrong:
- `invalid-missing-version.json` - Missing required version field
- `invalid-wrong-type.json` - Incorrect message type
- `invalid-both-result-error.json` - Response with both result and error
- `invalid-malformed-method.json` - Improperly formatted method name

## Error Documentation

Each test case should document:
- What makes the message invalid
- What error should be reported
- Which schema rule is being violated

## Implementation Testing

Use these tests to verify your implementation:
1. **Parsing robustness** - Handles malformed JSON gracefully
2. **Validation accuracy** - Catches all schema violations
3. **Error reporting** - Provides clear, actionable error messages
4. **Security** - Doesn't crash or leak information on bad input

These tests help ensure your GABP implementation is robust and secure when handling incorrect or malicious input.