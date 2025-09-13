# GABP 1.0 Security Specification

**Version**: 1.0  
**Status**: Draft  
**Date**: 2025-01-02

## Abstract

This document defines the security model, threat analysis, and authentication mechanisms for GABP (Game Agent Bridge Protocol). GABP prioritizes security through loopback-only connections, token-based authentication, and defense-in-depth principles.

## 1. Security Goals

GABP's security model is designed to achieve:

1. **Authenticated Access**: Only authorized bridges can connect to mods
2. **Local-Only Communication**: Prevent remote network attacks
3. **Process Isolation**: Limit attack surface through proper isolation
4. **Audit Trail**: Enable logging and monitoring of interactions
5. **Minimal Privilege**: Grant only necessary permissions

## 2. Threat Model

### 2.1 Assumptions

- The host operating system provides basic security primitives
- File system permissions work correctly
- The bridge application is trusted by the user
- Network interface isolation (loopback vs external) is enforced by the OS

### 2.2 Threats In Scope

1. **Unauthorized Bridge Connection**: Malicious software attempting to connect to mod
2. **Token Theft**: Attacker gaining access to authentication tokens
3. **Network Eavesdropping**: Interception of communications (mitigated by loopback-only)
4. **Privilege Escalation**: Mod providing more access than intended
5. **Denial of Service**: Overwhelming the mod with requests

### 2.3 Threats Out of Scope

1. **Malicious Mod**: The mod itself being compromised (trusted component)
2. **OS-Level Attacks**: Kernel exploits, rootkits, etc.
3. **Physical Access**: Attacks requiring local machine access
4. **Social Engineering**: User-targeted attacks outside the protocol

## 3. Authentication Mechanism

### 3.1 Token-Based Authentication

GABP uses shared secret tokens for authentication:

1. **Token Generation**: Bridge generates cryptographically secure random token
2. **Token Storage**: Token stored in configuration file with restricted permissions
3. **Token Exchange**: Bridge sends token in `session/hello` request
4. **Token Validation**: Mod validates token against stored configuration
5. **Session Establishment**: Success results in `session/welcome` response

### 3.2 Token Requirements

- **Length**: Minimum 128 bits (32 hex characters) of entropy
- **Source**: Cryptographically secure random number generator
- **Format**: Hexadecimal string for cross-platform compatibility
- **Rotation**: New token per session (recommended) or per bridge restart

### 3.3 Token Lifecycle

```
1. Bridge Startup
   ↓
2. Generate Random Token
   ↓
3. Write Configuration File (with restricted permissions)
   ↓
4. Start/Connect to Mod
   ↓
5. Send session/hello with Token
   ↓
6. Mod Validates Token
   ↓
7. Establish Authenticated Session
   ↓
8. [Session Operations]
   ↓
9. Session Termination
   ↓
10. Token Invalidated
```

## 4. Transport Security

### 4.1 Loopback-Only Requirement

All network-based transports MUST use loopback interfaces only:

- **TCP**: Bind to 127.0.0.1 only (never 0.0.0.0 or external interfaces)
- **IPv6**: If supported, bind to ::1 only
- **Verification**: Implementations MUST verify loopback-only binding

### 4.2 Transport-Specific Security

#### stdio Transport
- **Process Isolation**: Child process inherits minimal environment
- **Pipe Security**: OS-provided pipe security between processes
- **No Network**: Eliminates network-based attacks entirely

#### TCP Transport
- **Loopback Only**: Prevents remote network access
- **Ephemeral Ports**: Use OS-assigned ephemeral ports when possible
- **Connection Limits**: Implement reasonable connection limits

#### Named Pipes/Unix Sockets
- **File Permissions**: Restrict to owner (mode 0600)
- **Path Security**: Use unpredictable paths with session identifiers
- **Cleanup**: Remove pipe/socket on exit

## 5. Configuration File Security

### 5.1 File Permissions

Configuration files MUST be protected with restrictive permissions:

- **Windows**: Use ACLs to grant access only to current user
- **Unix/Linux/macOS**: Set file mode to 0600 (owner read/write only)
- **Directory**: Ensure parent directory has appropriate permissions

### 5.2 Atomic Creation

Configuration files MUST be created atomically to prevent race conditions:

1. Write to temporary file with unique name
2. Set appropriate permissions on temporary file
3. Atomically rename/move to final location
4. Verify permissions after creation

### 5.3 Content Protection

- **No Sensitive Data in Logs**: Never log authentication tokens
- **Memory Protection**: Clear token from memory when no longer needed
- **File Cleanup**: Remove configuration file on clean exit

## 6. Session Security

### 6.1 Session Isolation

Each bridge session MUST be isolated:

- **Unique Tokens**: Each session uses a unique authentication token
- **Session IDs**: Use `launchId` to distinguish sessions
- **Resource Namespacing**: Isolate resources between sessions when possible

### 6.2 Request Validation

All incoming requests MUST be validated:

- **Schema Validation**: Validate against JSON schemas
- **Method Authorization**: Check if method is permitted for current session
- **Parameter Sanitization**: Validate and sanitize all parameters
- **Rate Limiting**: Implement reasonable rate limits

### 6.3 Error Handling

- **Information Disclosure**: Avoid leaking sensitive information in errors
- **Generic Errors**: Use generic error messages when appropriate
- **Logging**: Log security events for auditing without exposing secrets

## 7. Implementation Guidelines

### 7.1 Secure Coding Practices

- **Input Validation**: Validate all inputs at protocol boundaries
- **Output Encoding**: Properly encode outputs to prevent injection
- **Resource Limits**: Implement limits on memory, CPU, and other resources
- **Fail Securely**: Default to secure behavior when errors occur

### 7.2 Token Generation

```pseudocode
function generateToken() {
    // Use cryptographically secure random number generator
    randomBytes = secureRandom(16) // 128 bits
    return hexEncode(randomBytes)
}
```

### 7.3 Configuration File Writing

```pseudocode
function writeConfigSecurely(config, path) {
    tempPath = path + ".tmp." + randomString()
    
    // Write to temporary file
    writeFile(tempPath, config)
    
    // Set restrictive permissions
    setFilePermissions(tempPath, 0600) // Unix
    // or setFileACL(tempPath, currentUser) // Windows
    
    // Atomic move
    moveFile(tempPath, path)
    
    // Verify final permissions
    verifyPermissions(path)
}
```

## 8. Audit and Monitoring

### 8.1 Security Events

Implementations SHOULD log the following security events:

- Connection attempts (successful and failed)
- Authentication attempts (successful and failed)
- Invalid request attempts
- Rate limit violations
- Configuration file access errors

### 8.2 Log Format

Security logs SHOULD include:

- Timestamp (UTC)
- Event type
- Source information (process ID, user)
- Outcome (success/failure)
- Relevant context (without sensitive data)

### 8.3 Log Security

- **No Secrets**: Never log authentication tokens or other secrets
- **Tamper Resistance**: Protect log files from modification
- **Retention**: Define appropriate log retention policies

## 9. Deployment Security

### 9.1 Environment Hardening

- **Minimal Permissions**: Run with minimal required privileges
- **Sandboxing**: Use OS sandboxing mechanisms when available
- **Network Isolation**: Ensure proper network interface binding
- **File System**: Restrict file system access to necessary directories

### 9.2 Configuration Management

- **Default Security**: Ship with secure defaults
- **Configuration Validation**: Validate security-relevant configuration
- **Documentation**: Clearly document security implications of settings
- **Updates**: Provide mechanism for security updates

## 10. Security Testing

### 10.1 Test Cases

Security testing SHOULD include:

- **Authentication Bypass**: Attempt to connect without valid token
- **Token Brute Force**: Test resilience to token guessing attacks
- **Network Binding**: Verify loopback-only binding
- **File Permission**: Test configuration file permission enforcement
- **Input Validation**: Test with malformed and malicious inputs

### 10.2 Penetration Testing

Regular security assessments SHOULD include:

- **Network Reconnaissance**: Attempt to discover services from remote hosts
- **Local Privilege Escalation**: Test for unauthorized access escalation
- **Configuration Analysis**: Review configuration security
- **Code Review**: Static analysis for security vulnerabilities

## 11. Incident Response

### 11.1 Security Incident Handling

When security incidents are identified:

1. **Immediate Response**: Isolate affected systems
2. **Impact Assessment**: Determine scope and impact
3. **Containment**: Prevent further damage
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### 11.2 Vulnerability Disclosure

- **Responsible Disclosure**: Establish process for reporting vulnerabilities
- **Response Timeline**: Commit to reasonable response times
- **Coordination**: Work with security researchers and users
- **Transparency**: Provide appropriate public disclosure

## 12. Compliance and Standards

### 12.1 Security Standards

GABP security implementations SHOULD consider:

- **OWASP Guidelines**: Follow OWASP secure coding practices
- **Platform Security**: Leverage OS-specific security features
- **Industry Standards**: Align with relevant security standards
- **Regulatory Requirements**: Meet applicable regulatory requirements

### 12.2 Security Reviews

- **Design Review**: Security review during protocol design
- **Implementation Review**: Code review with security focus
- **Deployment Review**: Security assessment of deployment practices
- **Ongoing Assessment**: Regular security evaluations