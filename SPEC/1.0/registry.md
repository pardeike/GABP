# GABP 1.0 Registry Specification

**Version**: 1.0  
**Status**: Draft  
**Date**: 2025-01-02

## Abstract

This document defines the method registry, error code assignments, and URI scheme for GABP (Game Agent Bridge Protocol). It establishes naming conventions and reserved ranges to ensure interoperability and prevent conflicts between implementations.

## 1. Method Names

### 1.1 Naming Convention

Method names MUST follow the pattern `^[a-z]+(/[a-z]+)+$`:

- Use lowercase letters only
- Separate segments with forward slashes (`/`)
- Minimum two segments required
- No underscores, dashes, or other special characters
- No leading or trailing slashes

**Valid Examples**:
- `session/hello`
- `tools/list`
- `world/block/get`
- `player/inventory/add`

**Invalid Examples**:
- `sessionHello` (missing slash)
- `tools` (single segment)
- `tools/list/` (trailing slash)
- `tools_list` (underscore not allowed)
- `Tools/List` (uppercase not allowed)

### 1.2 Reserved Method Namespaces

The following top-level namespaces are reserved for core GABP functionality:

#### session/*
Session management and connection lifecycle.

**Reserved Methods**:
- `session/hello` - Initialize connection with authentication
- `session/welcome` - Acknowledge successful authentication
- `session/ping` - Keep-alive message
- `session/goodbye` - Graceful connection termination

#### tools/*
Tool discovery, metadata retrieval, and invocation.

**Reserved Methods**:
- `tools/list` - List available tools
- `tools/get` - Get tool metadata
- `tools/call` - Invoke a specific tool

#### events/*
Event subscription and management.

**Reserved Methods**:
- `events/subscribe` - Subscribe to event channels
- `events/unsubscribe` - Unsubscribe from event channels
- `events/list` - List available event channels

#### resources/*
Resource discovery and access.

**Reserved Methods**:
- `resources/list` - List available resources
- `resources/read` - Read resource content
- `resources/write` - Write resource content (if supported)
- `resources/watch` - Subscribe to resource changes

### 1.3 Extension Methods

Implementations MAY define custom methods using implementation-specific namespaces:

**Recommended Patterns**:
- `minecraft/world/get_blocks` - Game-specific methods
- `forge/mod/reload` - Framework-specific methods  
- `custom/analytics/track` - Implementation-specific methods

**Namespace Allocation Guidelines**:
- Use descriptive, unique top-level namespaces
- Avoid conflicts with reserved namespaces
- Document custom methods in implementation guides
- Consider standardization for widely-used methods

## 2. Error Codes

### 2.1 JSON-RPC Compatible Codes

GABP uses JSON-RPC 2.0 error code ranges for compatibility:

#### Standard JSON-RPC Errors

- **-32700**: Parse Error - Invalid JSON received
- **-32600**: Invalid Request - Request object is invalid
- **-32601**: Method Not Found - Method does not exist or is unavailable
- **-32602**: Invalid Params - Invalid method parameters
- **-32603**: Internal Error - Internal server error

#### JSON-RPC Reserved Range

- **-32000 to -32099**: Server Error - Reserved for server implementation errors

### 2.2 GABP-Specific Error Codes

#### Authentication Errors (-32100 to -32199)

- **-32100**: Authentication Required - No authentication token provided
- **-32101**: Authentication Failed - Invalid or expired authentication token
- **-32102**: Session Expired - Authentication session has expired
- **-32103**: Access Denied - Insufficient permissions for requested operation

#### Protocol Errors (-32200 to -32299)

- **-32200**: Protocol Version Mismatch - Unsupported protocol version
- **-32201**: Invalid Message Type - Message type is not request, response, or event
- **-32202**: Missing Required Field - Required message field is missing
- **-32203**: Invalid Field Value - Message field contains invalid value

#### Resource Errors (-32300 to -32399)

- **-32300**: Resource Not Found - Requested resource does not exist
- **-32301**: Resource Access Denied - Insufficient permissions to access resource
- **-32302**: Resource Locked - Resource is locked by another operation
- **-32303**: Resource Modified - Resource was modified during operation

#### Tool Errors (-32400 to -32499)

- **-32400**: Tool Not Found - Requested tool does not exist
- **-32401**: Tool Unavailable - Tool exists but is currently unavailable
- **-32402**: Tool Execution Failed - Tool execution encountered an error
- **-32403**: Tool Timeout - Tool execution exceeded time limit

#### Event Errors (-32500 to -32599)

- **-32500**: Channel Not Found - Event channel does not exist
- **-32501**: Subscription Failed - Unable to subscribe to event channel
- **-32502**: Event Delivery Failed - Unable to deliver event message
- **-32503**: Channel Overflow - Event channel buffer overflow

### 2.3 Custom Error Codes

Implementations MAY define custom error codes outside the reserved ranges:

**Available Ranges**:
- **-31999 to -30000**: Available for custom errors
- **-29999 to -10000**: Available for custom errors
- **-9999 to -1**: Available for custom errors
- **1 to 65535**: Available for custom errors

**Guidelines**:
- Document custom error codes in implementation guides
- Use meaningful, descriptive error messages
- Include relevant context in the `data` field
- Consider standardization for commonly-used error codes

## 3. URI Scheme

### 3.1 GABP URI Format

GABP defines a URI scheme for resource identification:

```
gabp://<namespace>/<path>
```

Where:
- `namespace` identifies the resource provider or category
- `path` is a hierarchical path to the specific resource

### 3.2 Reserved Namespaces

#### system
System-level resources and information.

**Examples**:
- `gabp://system/info` - System information
- `gabp://system/config` - Configuration data
- `gabp://system/logs` - Log files

#### game
Game-specific resources and state.

**Examples**:
- `gabp://game/world` - World data
- `gabp://game/players` - Player information
- `gabp://game/config` - Game configuration

#### mod
Mod-specific resources and state.

**Examples**:
- `gabp://mod/info` - Mod metadata
- `gabp://mod/config` - Mod configuration
- `gabp://mod/data` - Mod-specific data

#### bridge
Bridge-specific resources and state.

**Examples**:
- `gabp://bridge/session` - Session information
- `gabp://bridge/stats` - Connection statistics
- `gabp://bridge/logs` - Bridge logs

### 3.3 Path Conventions

Resource paths SHOULD follow these conventions:

- Use forward slashes (`/`) as path separators
- Use lowercase for consistency
- Use descriptive, hierarchical names
- Avoid file extensions unless necessary for disambiguation

**Examples**:
- `gabp://game/world/chunks/0/0` - World chunk at coordinates (0,0)
- `gabp://game/players/steve/inventory` - Player inventory
- `gabp://mod/config/settings` - Mod configuration settings

### 3.4 Query Parameters

GABP URIs MAY include query parameters for filtering and options:

```
gabp://<namespace>/<path>?param1=value1&param2=value2
```

**Common Parameters**:
- `format` - Requested data format (json, xml, binary)
- `version` - Specific version of the resource
- `filter` - Filter criteria for collections
- `limit` - Maximum number of items to return
- `offset` - Starting offset for paginated results

**Examples**:
- `gabp://game/players?limit=10&offset=20` - Paginated player list
- `gabp://game/world/blocks?x=0&y=64&z=0&radius=10` - Blocks in region
- `gabp://mod/data/items?format=json&version=2` - Items in JSON format

## 4. Capability Registration

### 4.1 Capability Declaration

Mods MUST declare their capabilities in the `session/welcome` response:

```json
{
  "capabilities": {
    "methods": ["tools/list", "tools/call", "world/get_blocks"],
    "events": ["player/move", "world/block_change"],
    "resources": ["gabp://game/world", "gabp://game/players"],
    "extensions": {
      "minecraft": {
        "version": "1.20.4",
        "methods": ["minecraft/world/generate"]
      }
    }
  }
}
```

### 4.2 Capability Fields

- `methods` (array): List of supported method names
- `events` (array): List of available event channels  
- `resources` (array): List of accessible resource URIs
- `extensions` (object): Extension-specific capabilities

### 4.3 Dynamic Capabilities

Capabilities MAY change during a session:

- New capabilities can be added
- Existing capabilities can be removed
- Bridges SHOULD handle capability changes gracefully
- Mods SHOULD notify bridges of capability changes via events

## 5. Registration Process

### 5.1 Official Registration

For methods, error codes, or URI namespaces to be included in future GABP specifications:

1. **Proposal**: Submit detailed proposal with rationale
2. **Review**: Community and maintainer review process
3. **Testing**: Implementation and interoperability testing
4. **Documentation**: Complete specification documentation
5. **Approval**: Official approval and inclusion in specification

### 5.2 Community Registry

A community registry SHOULD be maintained for:

- Experimental methods and extensions
- Implementation-specific capabilities
- Proposed standardizations
- Best practice examples

### 5.3 Versioning

Registry changes follow GABP versioning rules:

- **Additive Changes**: New methods, error codes, or namespaces in same major version
- **Breaking Changes**: Removal or incompatible changes require new major version
- **Documentation**: All changes must be documented in changelog

## 6. Interoperability Guidelines

### 6.1 Method Discovery

Bridges SHOULD use capability negotiation rather than assumptions:

```javascript
// Good: Check capabilities first
if (capabilities.methods.includes("minecraft/world/get_blocks")) {
    // Use minecraft-specific method
} else if (capabilities.methods.includes("world/get_blocks")) {
    // Use generic method
} else {
    // Feature not available
}
```

### 6.2 Graceful Degradation

Implementations SHOULD handle missing features gracefully:

- Provide alternative methods when preferred methods unavailable
- Use generic methods as fallbacks
- Inform users of limited functionality
- Continue operation with reduced capabilities

### 6.3 Error Handling

When using registry elements:

- Check error codes for specific handling
- Provide meaningful error messages to users
- Log technical details for debugging
- Implement appropriate retry logic

## 7. Future Considerations

### 7.1 Registry Evolution

The registry will evolve to include:

- Additional core method namespaces
- Standardized extension patterns
- Common error code patterns
- Resource URI conventions

### 7.2 Tooling Support

Future tooling may provide:

- Automatic capability validation
- Method discovery and documentation
- Error code reference
- URI validation and resolution

### 7.3 Ecosystem Integration

Registry integration with:

- IDE and development tool support
- Automatic client generation
- API documentation generation
- Conformance testing tools