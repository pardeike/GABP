# GABP Implementation Guide for AI Agents

## Your Mission

You are working on the **GABP (Game Agent Bridge Protocol)** repository. This protocol enables AI tools to communicate with games through a standardized bridge interface.

Your job is to implement and maintain the complete GABP specification, which consists of three main deliverables:

1. **Human-readable specification** (Markdown documentation)
2. **Machine-readable schemas** (JSON Schema files)
3. **Conformance tests** (Example messages and validation)

This repository follows industry standards: Markdown + JSON Schema for specifications, optional AsyncAPI for events, and CI workflows that validate all examples.

## Repository Overview

The repository is structured to provide developers with:

- **Markdown documentation** to read and understand the protocol
- **JSON Schemas** to validate message formats
- **Rendered event documentation** via AsyncAPI
- **CI validation** that proves all examples conform to schemas

## Required Repository Structure

```text
README.md
LICENSES/
  SPEC-LICENSE.txt        # CC BY 4.0
  CODE-LICENSE.txt        # Apache 2.0
CODE_OF_CONDUCT.md
CONTRIBUTING.md
CHANGELOG.md
VERSIONING.md
SPEC/
  1.0/
    gabp.md               # Normative spec (wire format, methods, errors)
    transport.md          # Framing, loopback, tokens
    security.md           # Threat model, token handling
    registry.md           # Method names, error code ranges, URI scheme
SCHEMA/
  1.0/
    envelope.schema.json
    common/
      error.schema.json
      tool.schema.json
      capabilities.schema.json
    methods/
      session.hello.request.json
      session.welcome.response.json
      tools.list.request.json
      tools.list.response.json
      tools.call.request.json
      tools.call.response.json
      events.subscribe.request.json
      events.unsubscribe.request.json
      resources.list.request.json
      resources.list.response.json
      resources.read.request.json
    events/
      event.message.json   # {channel,seq,payload}
EXAMPLES/
  1.0/
    handshake/
      001_session-hello.json
      002_session-welcome.json
    tools/
      010_tools-list.req.json
      011_tools-list.res.json
    events/
      020_subscribe.req.json
      021_event.msg.json
CONFORMANCE/
  1.0/
    valid/*.json
    invalid/*.json
.github/workflows/validate.yml
packages/
  js/gabp-schemas/        # Optional npm package exporting SCHEMA/1.0
    package.json
    README.md
```

## README.md Requirements

The README should clearly communicate:

- **What GABP is**: A communication protocol for AI tools to interact with games
- **Current status**: "Protocol v1.0. Repo versioning uses SemVer. 'gabp/1' is the wire major."
- **Navigation links**: Direct links to SPEC, SCHEMA, and EXAMPLES directories
- **Validation instructions**: How to validate messages using AJV
- **Getting started guide**: Basic usage examples

## Licensing Strategy

This mirrors the approach used by OpenAPI, AsyncAPI, and other major specifications:

- **Specification documents** (text/spec): CC BY 4.0
- **Schemas, examples, and helper code**: Apache 2.0

## Core Specification Structure

### SPEC/1.0/gabp.md - Normative Specification

The main specification document must:

- Use RFC 2119 MUST/SHOULD wording for requirements
- Define protocol roles: **bridge** (client) and **mod** (server)
- Specify LSP-style framing for message streams

See [SPEC/1.0/gabp.md](SPEC/1.0/gabp.md) for normative protocol details.

### Envelope Specification

Canonical specification and schema can be found at:
- [SCHEMA/1.0/envelope.schema.json](SCHEMA/1.0/envelope.schema.json)

The envelope schema defines the union types for requests, responses, and events. Consult the file directly for up-to-date structure and requirements.

### Method Schemas

All method schemas are maintained in the [SCHEMA/1.0/methods/](SCHEMA/1.0/methods/) directory.  
For example:
- [session.hello.request.json](SCHEMA/1.0/methods/session.hello.request.json)
- [session.welcome.response.json](SCHEMA/1.0/methods/session.welcome.response.json)

Refer to these files for current field requirements and formats.

### Common Schemas

Reusable schema definitions (such as `tool`, `capabilities`, and `error`) are in [SCHEMA/1.0/common/](SCHEMA/1.0/common/).  
See:
- [tool.schema.json](SCHEMA/1.0/common/tool.schema.json)
- [error.schema.json](SCHEMA/1.0/common/error.schema.json)
- [capabilities.schema.json](SCHEMA/1.0/common/capabilities.schema.json)

### Event Schemas

Event message schemas are in [SCHEMA/1.0/events/](SCHEMA/1.0/events/).

## AsyncAPI Implementation (Optional)

If AsyncAPI documentation is provided, refer to the canonical file (e.g. `asyncapi.yaml`) at the root or docs directory for the latest event channel definitions.

## Transport and Security Specifications

See [SPEC/1.0/transport.md](SPEC/1.0/transport.md) for details.  
Platform-specific bridge configuration examples are kept in the documentation and config files—refer to those for current formats.

## Versioning Policy

Consult [VERSIONING.md](VERSIONING.md) for up-to-date versioning policy.

## CI Validation

Validation workflow is defined in [.github/workflows/validate.yml](.github/workflows/validate.yml).  
Always refer to the workflow file for current validation logic.

## Conformance Test Suite

Valid and invalid examples are maintained in:
- [EXAMPLES/1.0/](EXAMPLES/1.0/) for protocol message examples
- [CONFORMANCE/1.0/valid/](CONFORMANCE/1.0/valid/) and [CONFORMANCE/1.0/invalid/](CONFORMANCE/1.0/invalid/) for conformance testing

Consult these folders for up-to-date cases.

## Method and Error Registry

Method conventions, error codes, and URI schemes are described in [SPEC/1.0/registry.md](SPEC/1.0/registry.md).

## Distribution and Packaging

See [packages/js/gabp-schemas/README.md](packages/js/gabp-schemas/README.md) for npm usage and distribution details.

## Release Process Checklist

1. **Freeze** SPEC/1.0 content
2. **Tag** repository with `v1.0.0`
3. **Create** GitHub Release bundling `/SCHEMA/1.0` and `/EXAMPLES/1.0`
4. **Announce** registry and contribution rules

## Important Implementation Notes

- **Always verify** which parts of the repository structure already exist before creating new content
- **Validate** all JSON files for syntax correctness
- **Ensure** all schema `$id` values use consistent URL patterns
- **Test** that examples conform to their respective schemas
- **Maintain** backward compatibility within major versions
- **Follow** the existing code style and formatting conventions

## Getting Help

When implementing GABP specifications:

1. Start by examining existing repository structure
2. Check current validation status with CI workflows
3. Review existing schemas and examples for patterns
4. Ensure all changes maintain specification consistency
5. Validate new content against existing schemas before committing
