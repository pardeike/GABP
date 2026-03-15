# Changelog

All notable changes to the GABP specification and schemas will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.0.2 - 2026-03-15

### Fixed
- Restored the repository metadata required for npm trusted publishing provenance.
- Fixed the GitHub Actions `.NET` pack steps for the `Gabp.Schemas` package.

## 1.0.1 - 2026-03-15

### Added
- Added the `wire-model-decisions.md` note to pin the canonical 1.0 field and naming choices.
- Added explicit `tools/call` request and response examples plus valid and invalid conformance cases for tool naming and tool descriptors.
- Added a new `.NET` schema package scaffold for `Gabp.Schemas`.
- Added a new `Go` schema package scaffold with embedded schema assets and a sync script.
- Added GitHub Actions automation to verify and publish the NuGet package.

### Changed
- Aligned the 1.0 schemas, examples, and conformance assets around `arguments`, `capabilities.methods`, and slash-style native tool names.
- Updated the bundled JS schema package assets and package metadata to match the canonical schema tree.
- Removed avoidable `Pardeike` branding from package and documentation surfaces inside `GABP`.

## 1.0.0 - 2026-03-15

### Added
- First stable release of GABP specification
- Wire protocol version `gabp/1`
- Complete JSON Schema definitions
- Reference implementations (planned)
- Documentation and examples
