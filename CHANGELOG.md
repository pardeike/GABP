# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to the GABP specification and schemas will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.1.0 - 2026-03-21

### Added

- Added an architecture note for additive attention and execution gating support within `gabp/1`, including rationale,
  compatibility decisions, and an ordered build-and-test plan across GABP, Lib.GAB, GABS, and game integrations.
- Added canonical additive attention protocol surface documentation for `attention/current`, `attention/ack`, and the
  `attention/opened`, `attention/updated`, and `attention/cleared` lifecycle channels.
- Added reusable attention schemas, attention examples, and valid/invalid conformance fixtures.
- Added GitHub Actions automation to create and publish subdirectory-prefixed Go schema module tags.

### Changed

- Updated the canonical JS and Go schema package mirrors to include the new attention assets.
- Extended the AsyncAPI event documentation and AI implementer guide to cover optional attention-aware flows.
- Updated the npm and NuGet publish workflows to ignore subdirectory-prefixed release tags intended for the Go schema
  module.
- Enforced repository-wide markdown validation in CI now that the documentation set is lint-clean.
- Refreshed the schema package READMEs and Go module release guidance.

## 1.0.3 - 2026-03-15

### Fixed

- Removed the custom `dotnet pack --output` path from the NuGet workflow and now publish from the default package output
  directory.

## 1.0.2 - 2026-03-15

### Fixed

- Restored the repository metadata required for npm trusted publishing provenance.
- Fixed the GitHub Actions `.NET` pack steps for the `Gabp.Schemas` package.

## 1.0.1 - 2026-03-15

### Added

- Added the `wire-model-decisions.md` note to pin the canonical 1.0 field and naming choices.
- Added explicit `tools/call` request and response examples plus valid and invalid conformance cases for tool naming and
  tool descriptors.
- Added a new `.NET` schema package scaffold for `Gabp.Schemas`.
- Added a new `Go` schema package scaffold with embedded schema assets and a sync script.
- Added GitHub Actions automation to verify and publish the NuGet package.

### Changed

- Aligned the 1.0 schemas, examples, and conformance assets around `arguments`, `capabilities.methods`, and slash-style
  native tool names.
- Updated the bundled JS schema package assets and package metadata to match the canonical schema tree.
- Removed avoidable `Pardeike` branding from package and documentation surfaces inside `GABP`.

## 1.0.0 - 2026-03-15

### Added

- First stable release of GABP specification
- Wire protocol version `gabp/1`
- Complete JSON Schema definitions
- Reference implementations (planned)
- Documentation and examples
