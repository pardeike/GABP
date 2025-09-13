# Event Examples

This directory contains examples of GABP event subscription and event messages. Events allow the mod to notify the bridge about things happening in the game.

## Files

- **[020_subscribe.req.json](020_subscribe.req.json)** - Request to subscribe to events
- **[021_event.msg.json](021_event.msg.json)** - Example event message from mod to bridge

## Event Subscription Flow

Events use a publish-subscribe pattern:

1. **Bridge → Mod**: `events/subscribe` request with channel patterns
2. **Mod → Bridge**: `events/subscribe` response confirming subscriptions  
3. **Mod → Bridge**: Event messages whenever subscribed events occur

## Event Message Structure

Event messages differ from request/response messages:
- **type** is always `"event"`
- **channel** identifies the event type (e.g., "player/move", "world/block_change")
- **seq** is a sequence number for ordering
- **payload** contains the event data
- No `method`, `params`, `result`, or `error` fields

## Common Event Channels

Events are organized by what they monitor:
- **player/** - Player actions (move, attack, chat, etc.)
- **world/** - World changes (block placement, weather, time)
- **inventory/** - Inventory modifications
- **entity/** - Entity spawning, movement, interactions
- **game/** - Game state changes (level up, achievements)

## Event Filtering

When subscribing, you can use patterns to filter events:
- `"player/*"` - All player events
- `"world/block_*"` - All block-related world events
- `"player/move"` - Only player movement events

## Unsubscribing

To stop receiving events, use `events/unsubscribe`:

```json
{
  "v": "gabp/1",
  "id": "uuid-here", 
  "type": "request",
  "method": "events/unsubscribe",
  "params": {
    "channels": ["player/move"]
  }
}
```

## Validation

These examples validate against:
- `../../../SCHEMA/1.0/envelope.schema.json`
- `../../../SCHEMA/1.0/methods/events.subscribe.request.json`
- `../../../SCHEMA/1.0/events/event.message.json`