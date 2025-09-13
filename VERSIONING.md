# GABP Versioning Policy

This document describes the versioning strategy for the Game Agent Bridge Protocol (GABP) specification and related components.

## Protocol Versioning

### Wire Protocol Version

The wire protocol version is communicated in the `v` field of all GABP messages:

- **Format**: `gabp/<major>`
- **Current**: `gabp/1` for GABP version 1.x
- **Future**: `gabp/2` for next major version

### Version Compatibility

#### Within Major Version (gabp/1)

Within `gabp/1`, only **additive changes** are allowed:

**Allowed Changes**:
- New optional fields in existing message types
- New methods in existing or new namespaces
- New event channels
- New error codes outside reserved ranges
- New capabilities and extensions
- Clarifications and documentation improvements

**Breaking Changes** (require gabp/2):
- Removing or renaming existing fields
- Changing field types or constraints
- Removing existing methods
- Changing method signatures
- Modifying core message envelope structure
- Changing authentication mechanisms

#### Version Negotiation

- Clients MUST specify `"v": "gabp/1"` in all messages
- Servers MUST reject messages with unsupported versions
- Capability negotiation allows feature discovery within versions

## Repository Versioning

The GABP repository uses [Semantic Versioning](https://semver.org/) for releases:

### Format: `MAJOR.MINOR.PATCH`

#### MAJOR Version

Incremented for:
- Breaking changes to wire protocol (new `gabp/<major>` version)
- Breaking changes to core schemas
- Removal of deprecated features

**Examples**: `1.0.0` → `2.0.0`

#### MINOR Version

Incremented for:
- New features added in backward-compatible manner
- New methods or capabilities
- New documentation sections
- Significant improvements

**Examples**: `1.0.0` → `1.1.0`

#### PATCH Version

Incremented for:
- Bug fixes
- Documentation clarifications
- Schema corrections that don't change semantics
- Example improvements

**Examples**: `1.0.0` → `1.0.1`

## Release Lifecycle

### Release Branches

- **`main`**: Latest stable release
- **`develop`**: Development branch for next release
- **`release/x.y.z`**: Release preparation branches

### Pre-Release Versions

Pre-release versions use additional labels:

- **Alpha**: `1.0.0-alpha.1` - Early development, unstable
- **Beta**: `1.0.0-beta.1` - Feature complete, testing phase
- **RC**: `1.0.0-rc.1` - Release candidate, final testing

### Long Term Support (LTS)

- **LTS Versions**: Selected minor versions receive extended support
- **Support Period**: 2 years for LTS versions
- **Support Type**: Critical bug fixes and security updates only

## Schema Versioning

### Schema Version Numbers

JSON Schemas use the repository version in their `$id`:

```json
{
  "$id": "https://gabp.dev/schema/1.0/envelope.schema.json"
}
```

### Schema Evolution

#### Backward Compatible Changes

- Adding optional properties
- Relaxing constraints (e.g., increasing string length limits)
- Adding new enum values
- Adding new `$defs` definitions

#### Breaking Changes

- Removing properties
- Making optional properties required
- Tightening constraints
- Changing property types
- Removing enum values

### Schema Directory Structure

```
SCHEMA/
├── 1.0/          # Major version 1, all minor versions
├── 2.0/          # Major version 2 (future)
└── draft/        # Experimental schemas
```

## Implementation Versioning

### Implementation Requirements

Implementations SHOULD:

- Support latest patch version of their target minor version
- Gracefully handle newer minor versions within same major
- Reject incompatible major versions
- Advertise supported versions in capabilities

### Version Discovery

```json
{
  "capabilities": {
    "schemaVersion": "1.2.3",
    "protocolVersion": "gabp/1",
    "supportedVersions": ["1.0", "1.1", "1.2"]
  }
}
```

## Deprecation Policy

### Deprecation Process

1. **Announcement**: Feature marked deprecated in documentation
2. **Warning Period**: Minimum 6 months before removal
3. **Migration Guide**: Provide clear migration path
4. **Removal**: Feature removed in next major version

### Deprecation Markers

```json
{
  "deprecated": true,
  "deprecationNotice": "Use newMethod instead. Will be removed in v2.0",
  "replacedBy": "namespace/newMethod"
}
```

## Compatibility Testing

### Test Matrix

All changes MUST pass compatibility tests:

- **Forward Compatibility**: Older clients with newer servers
- **Backward Compatibility**: Newer clients with older servers
- **Cross-Version**: Different minor versions

### Conformance Requirements

- All examples MUST validate against current schemas
- Breaking changes MUST increment major version
- New features MUST be optional for backward compatibility

## Version Communication

### Release Notes

Each release includes:

- **Summary**: High-level changes and impact
- **Breaking Changes**: If any (major versions only)
- **New Features**: Added functionality
- **Bug Fixes**: Issues resolved
- **Migration Guide**: For major versions

### Documentation Updates

Version changes require:

- Specification updates
- Schema updates
- Example updates
- README updates
- Changelog entries

## Future Considerations

### Planned Evolution

- **GABP 2.0**: Next major version (tentative)
  - Enhanced security model
  - Improved performance features
  - Extended capability system
  
- **Extension Points**: Designed for future expansion
  - Custom method namespaces
  - Extension capability negotiation
  - Plugin architecture support

### Community Input

Version planning includes:

- Community feedback on proposed changes
- Implementation experience reports
- Performance and usability studies
- Industry standard alignment

This versioning policy ensures GABP evolution remains predictable, backward-compatible within major versions, and responsive to community needs.