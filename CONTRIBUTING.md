# Contributing to GABP

Thank you for your interest in contributing to the Game Agent Bridge Protocol (GABP)! This document provides guidelines for contributing to the specification, schemas, and related materials.

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs, suggest improvements, or request clarifications
- Provide clear, detailed descriptions of the issue
- Include relevant examples or use cases
- Label issues appropriately (bug, enhancement, question, etc.)

### Proposing Changes

1. **Fork the repository** and create a new branch for your changes
2. **Make your changes** following the guidelines below
3. **Test your changes** using the validation workflows
4. **Submit a Pull Request** with a clear description of your changes

## Types of Contributions

### Specification Updates

Changes to files in `SPEC/1.0/`:

- **Requirements**: Follow RFC 2119 language (MUST, SHOULD, MAY, etc.)
- **Format**: Use consistent Markdown formatting
- **Compatibility**: Ensure changes are backward compatible within v1.x
- **Testing**: Include examples and conformance tests

### Schema Changes

Changes to files in `SCHEMA/1.0/`:

- **Validation**: All schemas must be valid JSON Schema Draft 2020-12
- **Testing**: Include both valid and invalid test cases
- **Documentation**: Update related specification sections
- **Breaking Changes**: Only additive changes allowed in v1.x

### Examples and Test Cases

Changes to `EXAMPLES/1.0/` and `CONFORMANCE/1.0/`:

- **Validity**: All examples must validate against their schemas
- **Coverage**: Provide good coverage of different scenarios
- **Documentation**: Include clear descriptions of what each example demonstrates
- **Real-World**: Use realistic, practical examples when possible

## Development Workflow

### Setting Up Your Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pardeike/GABP.git
   cd GABP
   ```

2. **Install dependencies**:
   ```bash
   npm install -g ajv-cli@5
   npm install -g markdownlint-cli
   ```

3. **Run validation**:
   ```bash
   # Validate schemas
   ajv -s SCHEMA/1.0/envelope.schema.json -d 'EXAMPLES/1.0/**/*.json'
   
   # Check Markdown
   markdownlint README.md SPEC/1.0/*.md
   ```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the appropriate guidelines

3. **Validate your changes**:
   ```bash
   # Run the validation workflow locally
   .github/workflows/validate.yml # (or individual commands)
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Contribution Guidelines

### Code Style

- **JSON**: Use 2-space indentation, no trailing commas
- **Markdown**: Follow markdownlint rules (see `.markdownlint.json`)
- **File Names**: Use lowercase, hyphens for separation
- **Line Endings**: Use LF (Unix-style) line endings

### Documentation

- **Clarity**: Write clear, concise documentation
- **Examples**: Include practical examples where appropriate
- **Links**: Use relative links for internal references
- **Formatting**: Follow consistent formatting patterns

### Schema Design

- **Simplicity**: Keep schemas as simple as possible
- **Extensibility**: Design for future extensibility
- **Validation**: Include appropriate constraints and validation
- **Reusability**: Use `$ref` for common patterns

### Testing

- **Coverage**: Provide good test coverage for new features
- **Edge Cases**: Include tests for edge cases and error conditions
- **Documentation**: Document what each test validates
- **Maintainability**: Write maintainable, clear test cases

## Review Process

### Pull Request Requirements

- **Description**: Provide clear description of changes and motivation
- **Testing**: All CI checks must pass
- **Documentation**: Update relevant documentation
- **Backward Compatibility**: Ensure changes are backward compatible

### Review Criteria

Reviewers will evaluate:

- **Technical Correctness**: Changes are technically sound
- **Specification Compliance**: Changes follow GABP principles
- **Documentation Quality**: Clear, accurate documentation
- **Test Coverage**: Adequate testing of new features
- **Backward Compatibility**: No breaking changes in v1.x

## Versioning

GABP follows semantic versioning with special considerations:

### Protocol Versions

- **Wire Protocol**: `gabp/1` for major version 1
- **Schema Versions**: Patch versions within same major
- **Breaking Changes**: Require new major version (`gabp/2`)

### Repository Versions

- **Major**: Breaking changes to wire protocol
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, clarifications, non-breaking improvements

## Communication

### Channels

- **GitHub Issues**: Bug reports, feature requests, questions
- **Pull Requests**: Code and documentation changes
- **Discussions**: General questions and community discussion

### Guidelines

- **Be Respectful**: Follow the Code of Conduct
- **Be Clear**: Provide clear, detailed communication
- **Be Patient**: Allow time for review and discussion
- **Be Constructive**: Focus on improving the specification

## Recognition

Contributors will be recognized in:

- **Changelog**: Major contributions noted in release notes
- **README**: Active contributors listed (if desired)
- **Release Notes**: Significant contributions highlighted

## Questions?

If you have questions about contributing:

1. Check existing Issues and Discussions
2. Create a new Issue with the `question` label
3. Reach out to maintainers if needed

Thank you for helping improve GABP!