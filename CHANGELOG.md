# Changelog

All notable changes to the GABP specification and schemas will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial GABP 1.0 specification
- Core message envelope schema
- Session management methods (hello/welcome)
- Tool discovery and invocation methods
- Event subscription system
- Resource access methods
- Transport layer specification (stdio, TCP, named pipes)
- Security model with token-based authentication
- Method registry and error code definitions
- Comprehensive JSON Schema validation
- Example messages for all core methods
- Conformance test suite
- CI/CD validation workflow
- Contributing guidelines and Code of Conduct

### Security
- Token-based authentication system
- Loopback-only network connections
- File permission restrictions for configuration
- Security threat model analysis

## [1.0.0] - TBD

### Added
- First stable release of GABP specification
- Wire protocol version `gabp/1`
- Complete JSON Schema definitions
- Reference implementations (planned)
- Documentation and examples

[Unreleased]: https://github.com/pardeike/GABP/compare/HEAD...HEAD
[1.0.0]: https://github.com/pardeike/GABP/releases/tag/v1.0.0