# State Management Examples

This directory contains examples of GABP state management operations. State allows the bridge to get and set persistent game data.

## State Concept

State in GABP represents persistent data that can be:
- **Read** by the bridge to understand current conditions
- **Written** by the bridge to modify game state
- **Shared** between multiple bridge connections
- **Persisted** across game sessions

## Typical State Categories

State is usually organized by scope and purpose:
- **player/** - Player-specific data (stats, preferences, progress)
- **world/** - World-persistent data (custom markers, modified areas)
- **session/** - Current session data (temporary flags, runtime state)
- **mod/** - Mod-specific configuration and data

## State Operations

### Getting State
Use `state/get` to retrieve current state values:

```json
{
  "v": "gabp/1",
  "id": "uuid-here",
  "type": "request",
  "method": "state/get",
  "params": {
    "components": ["player/stats", "world/markers"]
  }
}
```

### Setting State
Use `state/set` to update state values:

```json
{
  "v": "gabp/1", 
  "id": "uuid-here",
  "type": "request",
  "method": "state/set",
  "params": {
    "updates": {
      "player/stats": {"level": 5, "xp": 1250},
      "world/markers": {"home": {"x": 100, "y": 64, "z": 200}}
    }
  }
}
```

## State vs Resources vs Tools

- **State**: Persistent data that can be read and written
- **Resources**: Read-only data or files (schematics, configurations)
- **Tools**: Actions that can be performed (functions to call)

## Validation

State examples validate against:
- `../../../SCHEMA/1.0/envelope.schema.json`
- `../../../SCHEMA/1.0/methods/state.get.request.json`
- `../../../SCHEMA/1.0/methods/state.get.response.json`
- `../../../SCHEMA/1.0/methods/state.set.request.json`
- `../../../SCHEMA/1.0/methods/state.set.response.json`