# Event Schemas

This directory contains JSON Schema definitions for GABP event messages. Events are asynchronous notifications sent from the mod to the bridge when things happen in the game.

## Schema Files

- **[event.message.json](event.message.json)** - Base structure for all event messages

## Event Message Structure

Event messages have a different structure from request/response messages:

```json
{
  "v": "gabp/1",
  "id": "550e8400-e29b-41d4-a716-446655440000", 
  "type": "event",
  "channel": "player/move",
  "seq": 42,
  "payload": {
    "player": "steve", 
    "from": {"x": 100, "y": 64, "z": 200},
    "to": {"x": 101, "y": 64, "z": 200}
  }
}
```

Key differences from request/response:
- **type** is always `"event"`
- **channel** identifies the event type (replaces `method`)
- **seq** provides ordering information  
- **payload** contains event data (replaces `params`/`result`)
- No `method`, `params`, `result`, or `error` fields

## Event Properties

### Channel
The channel identifies what kind of event occurred:
- Uses slash-separated naming like `category/subcategory`
- Examples: `player/move`, `world/block_change`, `inventory/update`
- Follows the same naming conventions as methods

### Sequence Number  
The seq field helps with:
- **Ordering** - Events can be processed in the correct order
- **Deduplication** - Detect and handle duplicate events
- **Missing Events** - Identify gaps in the event stream

Sequence numbers:
- Start at 0 for each channel
- Increment by 1 for each event in that channel
- Are per-channel, not global

### Payload
The payload contains the actual event data:
- Structure depends on the specific event type
- Should be documented for each event channel
- May reference common schemas for consistency

## Channel Organization

Event channels are typically organized by scope:
- **player/** - Player-related events (movement, actions, status changes)
- **world/** - World-related events (block changes, weather, time)
- **inventory/** - Inventory modifications
- **entity/** - Entity spawning, movement, interactions  
- **game/** - Game state events (level changes, achievements)

## Validation

Event messages validate against the base event schema:
```bash
ajv -s event.message.json -d 'example-event.json'
```

For specific event types, you may also validate the payload structure separately based on the channel's documented schema.