# Attention And Execution Gating Architecture

**Status**: Non-normative architecture note  
**Target**: Additive `gabp/1` extension, expected as a repository minor release in the `1.x` line  
**Purpose**: Preserve the reasoning, terminology, and build order for attention-aware execution gating across GABP, Lib.GAB, GABS, and game integrations such as RimBridgeServer. Although stored here for now, this note is intended as shared cross-repository working memory rather than protocol-only specification text.

## 1. Why This Note Exists

Normal request and tool errors already cover one important case: a bridge calls something, the mod fails it in-band, and the bridge receives that failure directly in the response.

That is not enough for AI-driven game automation.

In practice, a tool can return a success result while the game:

- logs an important error immediately after the response is sent
- transitions into a state that invalidates the agent's assumptions
- disconnects, stalls, or enters a long event after the bridge thinks the action succeeded
- produces repeated warning or error lines that matter operationally but should not be dumped verbatim into the model

When that happens, an AI agent often continues with its plan because the last direct request-response pair looked successful. The result is stale-state wandering: the agent can perform many follow-up reads or writes against a game state that is no longer trustworthy.

This note records the design direction chosen to address that failure mode.

## 2. Problem Statement

The design must solve all of the following problems at once:

1. Important game-side information must reach the bridge quickly enough to affect the next decision.
2. The bridge must not depend on raw asynchronous notifications alone, because the host may not inject them into the model's active reasoning loop in time.
3. The system must not flood the bridge or the model with raw logs during error bursts.
4. The system must preserve causality when possible. A later burst of spam must not erase the association between an action and the important state change it triggered.
5. Tool vendors should not need to hand-build protocol logic for every tool. Most integrations should get the mechanism "for free" from shared runtime layers.

## 3. Goals

- Define a first-class concept for important game-side information that can block further execution.
- Keep the feature additive within `gabp/1`.
- Separate low-volume control signals from high-volume diagnostics.
- Let the game-side integration decide what matters, because it has the most context.
- Let the bridge enforce a predictable execution gate once important state is open.
- Keep the API burden on Lib.GAB consumers low.
- Provide a build order that can be implemented and tested incrementally without losing the reasoning behind the design.

## 4. Non-Goals

- Replacing ordinary GABP request or tool errors.
- Turning attention into a generic streaming log transport.
- Making every warning block execution.
- Standardizing every diagnostic detail in the protocol.
- Making rich output schemas a prerequisite for attention support.
- Requiring a new wire major version such as `gabp/2`.

## 5. Core Decision: This Is Attention, Not Generic Error Support

The feature should be named around **attention** or **execution gating**, not around generic "error support".

Reasons:

- GABP already supports normal request errors.
- Raw logs are diagnostics, not control signals.
- The new behavior is specifically about game-side information that can invalidate an agent's assumptions and therefore should influence execution ordering.

Using a distinct concept keeps three semantics separate:

1. **Request failure**: the specific method call failed in-band.
2. **Diagnostics**: logs, operation journals, and detailed debugging evidence.
3. **Attention**: important state that the bridge should surface and potentially gate on before allowing more game-bound calls.

## 6. Versioning Decision

This feature should be treated as an additive `1.x` extension, informally discussed as **GABP 1.5**.

That means:

- the wire version stays `gabp/1`
- the change is additive and backward compatible at the protocol level
- schema and spec assets remain in the `1.0` tree unless the repository later chooses a different `1.x` publication layout
- repository releases advance by SemVer minor version

This repository's current versioning policy already allows new optional fields, methods, event channels, and capabilities within `gabp/1`. Attention fits that model.

## 7. Architectural Model

The architecture splits the problem into two planes.

### 7.1 Control Plane

The control plane carries low-volume, summarized, actionable state:

- an attention item opened
- an attention item changed meaningfully
- an attention item cleared
- the bridge should block further game-bound execution until the item is acknowledged

This plane is small, bounded, and intended to drive behavior.

### 7.2 Diagnostics Plane

The diagnostics plane carries or exposes high-volume evidence:

- raw log entries
- operation journals
- detailed error context
- stack traces
- correlated history

This plane is not what should directly drive model behavior. It exists so the bridge or agent can inspect details after attention has been surfaced.

### 7.3 Design Consequence

The bridge should never need to treat raw log lines as the primary control signal. It should consume a compact attention state and only fetch diagnostics when needed.

## 8. Responsibility Split

### 8.1 GABP

GABP standardizes the minimal cross-implementation contract:

- how attention capability is discovered
- how a bridge can fetch current attention state
- how a bridge can acknowledge attention
- how attention changes can be emitted as events

### 8.2 Lib.GAB

Lib.GAB should hide protocol and runtime mechanics from most tool vendors:

- registering any core attention methods or event channels
- buffering current attention state
- coalescing and sequencing updates
- exposing helper APIs for opening, updating, and clearing attention
- making opt-in execution gating possible without changing every tool implementation

### 8.3 Game Integration Layer

The game integration layer, such as RimBridgeServer, decides semantics:

- what should count as attention
- what severity is blocking
- whether the current game state should be treated as invalidated
- how many details should be included in the summary
- which diagnostics tools remain usable while attention is open

### 8.4 Bridge Layer

The bridge layer, such as GABS, enforces behavior:

- subscribe to attention events when available
- cache the latest open attention state per game
- block further game-bound calls when a blocking attention item is open
- expose bridge-facing ways to inspect and acknowledge the item

## 9. Key Behavioral Decisions

### 9.1 Gating Applies To More Than Mutations

Blocking only mutating calls is not sufficient.

If important game-side information says the current state is no longer trustworthy, the model should not continue issuing many read calls either. The bridge should gate **all game-bound calls for that game** while blocking attention is open, except for an explicit allowlist.

Typical allowlisted calls will include bridge diagnostics such as:

- inspecting current attention
- acknowledging current attention
- checking basic bridge or game connection status
- reading diagnostics intentionally chosen by the game integration

### 9.2 Async Push Is Helpful But Not Authoritative

Attention events should still be pushed asynchronously for low-latency visibility.

However, the authoritative control mechanism is the bridge-side gate at the next game-bound call boundary. This avoids depending on the AI host to immediately inject asynchronous notifications into the model's active plan.

### 9.3 Early Capture, Late Rendering

Important information should be captured early and stored in a bounded state machine, but rendered to the model late and compactly.

That means:

- the integration records or updates attention as soon as it knows something important happened
- the bridge stores the current item
- the model sees a compact summary when a call is blocked or when the originating call returns with related attention

### 9.4 Summaries Beat Raw Last-N Log Lines

The default delivery unit should not be "the last N raw error lines".

Raw tail windows have poor behavior:

- they lose the real root cause during spam
- they destroy causality
- they force the model to process repeated noise

Instead, the default summary should be bounded and coalesced:

- max severity
- whether execution is blocked
- whether state is invalidated
- causal operation id when known
- total urgent entry count
- unique signature count
- a small representative sample
- cursors into the diagnostics plane for deeper inspection

### 9.5 Explicit Acknowledgement Is Required

The bridge should not treat "retrying the same call" as implicit acknowledgement.

An explicit ack step makes the control flow unambiguous:

- the agent has seen the item
- the bridge can prevent accidental loops
- the system can avoid duplicating the same attention content unpredictably

### 9.6 Execution Semantics Depend On Timing

The protocol and runtime should preserve whether a blocked call actually executed.

Required distinction:

- if blocking attention is already open before dispatch, the bridge should block the call and report that it was not executed
- if attention opens during or immediately after execution, the bridge should return the real tool result and attach or reference the related attention item

The system should never claim that a mutating call "did not execute" if it in fact already ran.

### 9.7 Stable Attention Identity Avoids Duplicate Ambiguity

Attention content may surface at more than one decision point:

- the originating call may complete and report related attention
- a later game-bound call may be blocked by that same open attention item

That should not be modeled as two unrelated alerts.

Instead, the system should prefer a stable attention identity:

- open one attention item with a stable `attentionId`
- let the originating call reference that item when relevant
- let later blocked calls reference the same item instead of replaying raw diagnostics as if they were new information

This keeps retries, acknowledgements, and recovery behavior predictable.

## 10. Candidate Protocol Surface

This section is architectural guidance, not final normative wire text.

The recommended first protocol surface is deliberately small.

### 10.1 Discovery

Support should be discoverable through existing capability surfaces instead of a new wire major version.

Candidate additions:

- `attention/current` in `capabilities.methods`
- `attention/ack` in `capabilities.methods`
- one or more attention event channels in `capabilities.events`

This avoids changing the envelope model and keeps the feature additive.

### 10.2 Methods

Recommended core methods:

- `attention/current`
  - returns the current open attention item, if any
- `attention/ack`
  - acknowledges the currently open attention item or a specific attention id

An implementation MAY expose richer attention helpers, but those two are the minimum useful core methods.

### 10.3 Event Channels

Recommended canonical channels:

- `attention/opened`
- `attention/updated`
- `attention/cleared`

An implementation MAY collapse these into a smaller event surface if needed, but explicit lifecycle channels are easier to reason about and test.

### 10.4 Attention Object Shape

The current attention payload should be compact and behavior-oriented.

Recommended fields:

- `attentionId`
- `state`
- `severity`
- `blocking`
- `stateInvalidated`
- `summary`
- `causalOperationId`
- `causalMethod` or tool/capability identifier
- `openedAtSequence`
- `latestSequence`
- `diagnosticsCursor`
- `totalUrgentEntries`
- `sample`

The protocol should not require raw stack traces or full log tails in the attention object.

## 11. Compatibility Decisions

### 11.1 GABP Compatibility

The protocol change should be additive.

Older implementations that do not know attention support will continue to:

- use `gabp/1`
- ignore unknown event channels because they never subscribe to them
- respond with method-not-found if a bridge calls attention methods without checking capabilities first

Newer bridges must therefore feature-detect support before relying on it.

### 11.2 Lib.GAB Compatibility

Lib.GAB should remain source-compatible and mostly behavior-compatible by keeping the feature additive and opt-in.

Preferred compatibility rules:

- do not change existing tool registration signatures
- do not require tool vendors to return special response types
- do not enable global gating behavior implicitly for legacy integrations
- do provide helper APIs and default runtime wiring for integrations that opt in

### 11.3 Tool Vendor Compatibility

Most tool vendors should not need to know the attention protocol at all.

The ideal experience is:

- tool authors keep defining tools normally
- the integration layer or Lib.GAB runtime decides what events and logs should open attention
- only advanced integrations supply a custom attention classifier or summary policy

The one thing intentionally deferred is a public cross-mod API for third-party tools or mods to publish first-class attention items directly. The current rollout keeps attention ownership centralized in the integration layer until that extension surface is designed more deliberately.

## 12. Implementation Guidance By Layer

### 12.1 Lib.GAB

Lib.GAB should provide a reusable attention manager or equivalent runtime abstraction.

Recommended responsibilities:

- track current open attention item
- accept updates from the integration layer
- emit attention lifecycle events
- expose `attention/current` and `attention/ack`
- optionally support a bridge-aware gating hook for servers that want to enforce local policies

Recommended optional extension points:

- an attention classifier interface
- a summary renderer interface
- a configuration switch to enable or disable the feature

### 12.2 RimBridgeServer-Like Integrations

Game-aware integrations should:

- classify logs and operation events into attention-worthy or non-attention-worthy categories
- correlate items with operation ids when possible
- summarize bursts instead of forwarding raw tails
- expose detailed diagnostics through existing journal and log tools

### 12.3 GABS-Like Bridges

Bridge implementations should:

- subscribe to attention channels when present
- persist the latest open item per connected game
- enforce a call gate while blocking attention is open
- expose inspection and acknowledgement commands to the AI host
- avoid consuming raw diagnostic streams as the primary control signal

### 12.4 Tool Metadata And Documentation

Attention support should not be blocked on perfect output-schema coverage.

Current AI-driven tool use can work well with underspecified response bodies as long as:

- tool inputs remain strict and machine-parseable
- tool descriptions remain semantically clear
- important asynchronous state is surfaced reliably through attention and execution gating

This asymmetry matters:

- AI consumers often handle semantically clear but underspecified output well
- AI producers are much less reliable when input contracts are underspecified

That is why attention/execution gating is the primary reliability investment, while richer output metadata is secondary.

That leads to the following guidance:

- keep attention/execution gating as the primary reliability investment
- treat richer output metadata as an optional ergonomics improvement
- avoid overloading the main tool description with too much return-shape detail when a better metadata slot is available

Because this note spans Lib.GAB, RimBridgeServer, and related annotation/doc-generation layers in addition to GABP itself, it is reasonable to record adjacent implementation guidance here when it helps prevent design drift.

One such adjacent improvement is an optional free-text result description, which is a reasonable additive design when an implementation wants better semantic separation without requiring full field-level response schemas everywhere.

That field would be intended for short semantic return affordances such as:

- "returns a log cursor plus recommended `rimbridge/list_logs` arguments for consuming future job lines"
- "returns actionable UI target ids for the requested surface"
- "returns the saved screenshot path plus optional target metadata"

Recommended rules:

- keep the main tool description focused on what the tool does and when to use it
- keep any result description focused on what a successful result means or enables next
- keep field-level schema annotations optional and independent
- when both exist, prefer rendering result description as a `Returns` section in human-facing docs and as the root `description` of any emitted `outputSchema`

Additional guidance:

- if a shared runtime already supports field-level response metadata such as `ToolResponse`, treat a result description as complementary rather than as a replacement
- if one implementation prefers source generators or typed DTO reflection to populate response metadata, that is an authoring convenience, not a protocol requirement
- if generated docs currently render only descriptions and parameters, that documentation gap is a valid reason to add a result-description field without treating it as a full output-schema redesign

This is complementary to attention support, not part of the minimum protocol work required to deliver execution gating.

The likely implementation homes for that follow-on are:

- `Lib.GAB`, if the shared tool attribute model should grow a result-description field
- `RimBridgeServer.Annotations`, if the lightweight shared annotation package should expose the same field to third-party mod authors
- RimBridgeServer documentation generators, if human-facing tool references should render a separate `Returns` section instead of forcing that information into the main description

## 13. Ordered Build Plan

The steps below are intentionally ordered so each stage is testable before the next one begins.

### Step 1. Freeze terminology and architectural scope

Deliverables:

- this architecture note
- terminology agreement around "attention" and "execution gating"
- explicit decision that the feature is additive within `gabp/1`

Validation:

- repository review and sign-off
- confirm that the intended feature does not require a wire-major change

### Step 2. Reserve the protocol surface in the spec

Deliverables:

- update `SPEC/1.0/registry.md` with the provisional method and event names
- update `SPEC/1.0/gabp.md` with non-breaking normative additions for discovery, methods, and event lifecycle
- decide the canonical attention object field names

Validation:

- spec review against existing `gabp/1` compatibility rules
- confirm no existing method or event naming conflicts

### Step 3. Add schemas, examples, and conformance fixtures

Deliverables:

- method schemas for `attention/current` request and response
- method schemas for `attention/ack` request and response
- event schemas or event payload schemas for attention lifecycle channels
- example messages in `EXAMPLES/1.0/`
- valid and invalid fixtures in `CONFORMANCE/1.0/`
- updated schema packages for JS, Go, and .NET

Validation:

- schema validation in CI
- package sync verification
- conformance examples passing against the updated schema set

### Step 4. Add AsyncAPI and protocol-facing developer documentation

Deliverables:

- update `asyncapi.yaml` for attention lifecycle channels
- update the root `README.md`
- update `SPEC/1.0/README.md`
- add bridge and mod guidance to `SPEC/1.0/ai-implementation.md` if appropriate
- update release notes and versioning-facing docs as needed

Validation:

- rendered documentation review
- link and navigation check

### Step 5. Implement Lib.GAB attention primitives without changing tool author ergonomics

Deliverables:

- an internal attention manager
- additive APIs or builder options
- default event emission
- `attention/current`
- `attention/ack`
- no change to existing tool handler signatures

Validation:

- Lib.GAB unit tests for open, update, clear, and ack flows
- backward-compatibility tests proving legacy tool registration still works unchanged

### Step 6. Add Lib.GAB documentation for integrators and tool vendors

Deliverables:

- runtime documentation for enabling attention support
- examples for opening and clearing attention
- clear guidance that ordinary tool vendors usually do not need to participate directly
- guidance on when to choose blocking versus advisory attention

Validation:

- documentation review with at least one integration consumer

### Step 7. Teach a game integration to classify and summarize attention

Deliverables:

- a first real integration, expected to be RimBridgeServer
- classification policy over logs and operation events
- bounded summaries with causal correlation
- diagnostics retained separately from attention summaries

Validation:

- integration tests for:
  - single error after successful action
  - repeated identical log spam
  - state-invalidating event
  - non-blocking advisory event
  - ack and clear flows

### Step 8. Teach GABS to observe attention without gating yet

Deliverables:

- subscribe to attention channels when supported
- cache the current attention item per game
- expose bridge-level inspection commands or diagnostics

Validation:

- end-to-end tests proving GABS receives attention updates correctly
- compatibility tests against games without attention support

### Step 9. Add bridge-side execution gating in GABS

Deliverables:

- block further game-bound calls while blocking attention is open
- define an allowlist for inspection, acknowledgement, and essential diagnostics
- return a compact blocked result that references the current attention item instead of replaying raw logs

Validation:

- end-to-end tests proving:
  - the next game-bound call is blocked
  - allowlisted calls still work
  - ack clears the gate
  - repeated retries do not create ambiguous duplicate flows

### Step 10. Update AI-host and end-user guidance

Deliverables:

- GABS documentation telling AI agents how to react to blocked calls
- developer guidance for bridge implementers
- user-facing docs that explain why a game may refuse further actions until attention is acknowledged

Validation:

- smoke-test prompts or scripted AI flows that demonstrate recovery behavior

### Step 11. Harden backpressure and retention behavior

Deliverables:

- bounded queue or state machine rules for attention updates
- explicit coalescing policy
- retention and replacement rules when many attention-worthy events occur
- bridge behavior when the game emits updates faster than they can be consumed

Validation:

- stress tests with synthetic log spam
- tests confirming that diagnostics remain inspectable while the attention summary stays compact

### Step 12. Publish the feature as an additive `1.x` release

Deliverables:

- changelog entry
- release notes
- migration notes for Lib.GAB users
- updated example integrations

Validation:

- release checklist review
- confirm older peers still interoperate with feature detection

### Optional Follow-On. Improve Tool Result Documentation Without Expanding Protocol Scope

Deliverables:

- decide whether `Lib.GAB` and `RimBridgeServer.Annotations` should expose an optional result-description field
- update RimBridgeServer and similar human-facing doc generators to render a separate `Returns` section when that field exists
- optionally map that text to the root `description` of emitted `outputSchema` objects
- keep field-level response metadata such as `ToolResponse` optional

Validation:

- confirm that existing tools remain source-compatible
- confirm that tool descriptions become simpler where they previously had to carry result affordances
- confirm that the attention/gating feature remains fully usable without adopting the optional result-description field

## 14. Cross-Repo Execution Guide

This section turns the architecture into a concrete multi-repository implementation plan.

The intended repositories are:

- `GABP`
- `Lib.GAB`
- `RimBridgeServer.Annotations`
- `RimBridgeServer`
- `GABS`

The goal is not to update all of them blindly at once. The goal is to move them in an order that keeps every stage testable and keeps context loss manageable.

### 14.1 GABP Workstream

Primary purpose:

- reserve names
- freeze the minimal wire contract
- provide examples and conformance fixtures that unblock implementation in the other repositories

Likely touchpoints:

- `SPEC/1.0/gabp.md`
- `SPEC/1.0/registry.md`
- `SPEC/1.0/ai-implementation.md`
- `SPEC/1.0/README.md`
- `README.md`
- `CHANGELOG.md`
- `asyncapi.yaml`
- schema, example, and conformance assets under the repository's normal `1.0` layout

Concrete tasks:

- define canonical method names for `attention/current` and `attention/ack`
- define canonical event names for attention lifecycle updates
- define the minimum attention object shape
- define capability-discovery expectations
- define ack semantics precisely enough that bridges can implement gating without guessing
- add examples for:
  - no open attention
  - blocking attention opened
  - acknowledgement clearing the gate
  - a blocked follow-up call referencing the same `attentionId`
- add conformance fixtures for valid and invalid payloads
- update AI-facing guidance so bridge and host implementers know that async push is informative but the call gate is authoritative

Exit criteria:

- canonical names are frozen for the first implementation pass
- examples are specific enough that Lib.GAB and GABS can code against them
- there is no unresolved ambiguity about whether blocked calls executed

### 14.2 Lib.GAB Workstream

Primary purpose:

- hide the new mechanics from ordinary tool authors
- emit and expose attention state in a reusable way
- keep existing tool registration ergonomics intact

Likely touchpoints:

- `Lib.GAB/Tools/ToolAttribute.cs`
- `Lib.GAB/Tools/IToolRegistry.cs`
- `Lib.GAB/Tools/ToolRegistry.cs`
- `Lib.GAB/Server/GabpServer.cs`
- `README.md`
- `Lib.GAB.Example/`
- `Lib.GAB.Tests/`

Concrete tasks:

- add an internal attention manager or equivalent runtime abstraction
- add support for attention lifecycle events
- add `attention/current`
- add `attention/ack`
- add any opt-in configuration needed to enable attention support without changing legacy tool handlers
- preserve existing tool registration signatures
- add unit tests for open, update, clear, and ack flows
- add transport tests proving attention metadata is surfaced correctly
- add or update examples showing how an integration opens blocking attention versus advisory attention

Optional parallel follow-on:

- add an optional result-description field to the shared tool metadata model
- map that field to the root `description` of emitted `outputSchema`
- keep field-level `ToolResponse` metadata optional

Exit criteria:

- a legacy Lib.GAB tool server still works unchanged
- an opt-in Lib.GAB server can expose attention methods and events
- tests prove stable `attentionId` reuse and correct timing semantics

### 14.3 RimBridgeServer.Annotations Workstream

Primary purpose:

- keep the lightweight shared annotation package aligned with any additive metadata improvements chosen for tool documentation

Likely touchpoints:

- `src/RimBridgeServer.Annotations/ToolAnnotations.cs`
- `README.md`

Concrete tasks:

- decide whether to mirror any new optional result-description field from Lib.GAB
- keep the package minimal and metadata-only
- document clearly that response-field annotations remain optional

Important constraint:

- this workstream must not block attention/execution gating
- if result-description work is deferred, that is acceptable

Exit criteria:

- package remains source-compatible for existing mod authors
- any additive metadata change is documented and clearly optional

### 14.4 RimBridgeServer Workstream

Primary purpose:

- supply game-aware classification, coalescing, causality, and diagnostics retention

Likely touchpoints:

- `Source/RimBridgeEventRelay.cs`
- `Source/RimBridgeLogs.cs`
- `Source/RimBridgeRuntime.cs`
- `Source/RimBridgeStartup.cs`
- `Source/DiagnosticsCapabilityModule.cs`
- `Source/RimWorldWaits.cs`
- any new attention-classification or summary component added during implementation
- `README.md`
- `docs/tool-reference.md`
- `Tools/RimBridgeServer.ToolDocGen/Program.cs`

Concrete tasks:

- classify log and operation events into blocking, advisory, or ignorable categories
- correlate attention with operation ids or capability ids when possible
- maintain bounded summaries rather than forwarding raw log tails
- preserve detailed diagnostics in existing journals and log tools
- emit one stable attention item when a causal burst belongs together
- ensure blocked-vs-already-executed semantics are preserved when attention opens during or after a tool call
- decide which diagnostics remain usable while attention is open
- add integration tests for:
  - success followed by blocking error
  - repeated identical error spam
  - state-invalidating event
  - advisory-only event
  - ack and clear flow

Optional parallel follow-on:

- simplify tool descriptions that currently carry result affordances
- render a separate `Returns` section in generated docs if result-description metadata exists

Exit criteria:

- RimBridgeServer can emit realistic attention events under controlled test scenarios
- diagnostics remain inspectable without dumping raw spam into the control plane
- tool authors do not need to write attention protocol code by hand

### 14.5 GABS Workstream

Primary purpose:

- observe attention reliably
- enforce the execution gate
- expose a predictable recovery flow to the AI host

Likely touchpoints:

- `internal/gabp/client.go`
- `internal/mcp/gabp_connector.go`
- `internal/mcp/stdio_server.go`
- `internal/mcp/types.go`
- `README.md`
- tests under `internal/gabp/` and `internal/mcp/`

Concrete tasks:

- subscribe to attention events when supported
- cache the current open attention item per connected game
- expose bridge-facing inspection and acknowledgement commands
- initially support observation-only mode before enabling the gate
- add the gate so blocking attention stops further game-bound calls
- define the allowlist for inspection, ack, status, and essential diagnostics
- return blocked-call results that reference the stable current `attentionId`
- avoid replaying raw logs as if every blocked call were a brand-new failure
- add end-to-end tests for:
  - observation without gating
  - gating on the next game-bound call
  - allowlisted calls during a gate
  - ack clearing the gate
  - repeated retries staying stable and non-ambiguous

Exit criteria:

- GABS can interoperate with games that do and do not support attention
- blocked-call results are deterministic and explain what the host should do next
- gating works for all game-bound calls, not only mutations

## 15. Dependency Order And Parallelization Rules

The implementation should proceed in phases with explicit blockers.

### Phase A. Freeze Names And Semantics

Repositories:

- `GABP`

Must finish first:

- canonical names
- attention object shape
- ack semantics
- blocked-vs-executed timing semantics

Reason:

- every other repository needs these semantics to avoid inventing slightly different local contracts

### Phase B. Build Shared Runtime Support

Repositories:

- `Lib.GAB`

May overlap partially with late Phase A work if one person owns the final naming decisions.

Blocked by:

- unresolved GABP method/event naming
- unresolved ack semantics

Produces the first reusable implementation target for downstream integrations.

### Phase C. Build First Real Integration

Repositories:

- `RimBridgeServer`

Can begin once Lib.GAB has a stable enough attention surface to code against.

Safe parallel work:

- classifier design
- burst summarization policy
- diagnostics-retention rules

Blocked by:

- missing Lib.GAB attention hooks

### Phase D. Observe Before Gating

Repositories:

- `GABS`

The bridge should first learn to observe and cache attention correctly before it starts refusing calls.

Blocked by:

- a working attention emitter from Lib.GAB and at least one integration

### Phase E. Turn On The Gate

Repositories:

- `GABS`
- optionally `RimBridgeServer` if allowlisted diagnostics or examples need tuning

Blocked by:

- successful observation tests
- stable ack behavior

### Phase F. Polish Documentation And Optional Result Metadata

Repositories:

- `Lib.GAB`
- `RimBridgeServer.Annotations`
- `RimBridgeServer`
- `GABS`
- `GABP`

This phase is intentionally last because it should not delay the core reliability feature.

Safe parallel work throughout:

- result-description design
- doc-generator improvements
- README and migration-note updates

Explicit non-blocker:

- richer output metadata must not delay attention/execution gating

## 16. Checkpoints And Test Gates

The combined effort should stop and validate at each checkpoint before moving on.

### Checkpoint 0. Architecture Freeze

Required state:

- this note reflects the current decisions
- naming and semantics disputes are resolved enough to start editing code

Evidence:

- reviewed architecture note
- explicit agreement on attention terminology and timing semantics

### Checkpoint 1. Protocol Freeze

Required state:

- GABP method names, event names, and object fields are written down in spec form

Evidence:

- updated spec docs
- updated registry and AsyncAPI assets
- examples and conformance fixtures drafted

### Checkpoint 2. Shared Runtime Works In Isolation

Required state:

- Lib.GAB can expose attention methods and events
- legacy tool servers still work

Evidence:

- Lib.GAB unit tests
- transport tests
- backward-compatibility tests

### Checkpoint 3. First Game Integration Emits Real Attention

Required state:

- RimBridgeServer can open, update, clear, and summarize attention

Evidence:

- targeted integration tests
- manual or automated scenario proving a successful tool can still produce related attention immediately after execution

### Checkpoint 4. GABS Observes Correctly

Required state:

- GABS subscribes, caches, and exposes attention correctly
- no gating yet

Evidence:

- bridge observation tests
- compatibility tests with games lacking attention support

### Checkpoint 5. GABS Gates Correctly

Required state:

- blocked calls are refused before dispatch when blocking attention is open
- allowlisted diagnostics still work

Evidence:

- end-to-end gating tests
- tests proving the same `attentionId` is reused across originating-result and blocked-call flows

### Checkpoint 6. AI Recovery Flow Works

Required state:

- the host can inspect attention
- the host can acknowledge it
- the next call proceeds correctly afterward

Evidence:

- smoke-test prompts or scripted agent flows
- documentation that tells the host or operator what to do

### Checkpoint 7. Optional Result-Documentation Follow-On

Required state:

- any result-description work remains additive and optional

Evidence:

- source compatibility preserved
- generated docs improved where useful
- no dependency from the core attention flow onto result-description adoption

### 16.1 Practical Verification Entry Points

The exact CI wiring may evolve, but the current repository surfaces already suggest these concrete verification entry points:

- `GABP`
  - run schema and example validation from the existing schema package and conformance assets
  - current references:
    - `CONFORMANCE/1.0/README.md`
    - `packages/js/gabp-schemas/package.json`
    - `packages/go/schemas/sync.sh`
- `Lib.GAB`
  - run `dotnet test Lib.GAB.sln`
- `RimBridgeServer.Annotations`
  - run `dotnet build RimBridgeServer.Annotations.sln`
- `RimBridgeServer`
  - run `dotnet test RimBridgeServer.sln`
  - regenerate tool docs with `scripts/generate-tool-reference.sh` when tool metadata or doc-rendering changes
  - use the live-smoke test project or equivalent manual RimWorld scenario for end-to-end attention checks
- `GABS`
  - run `make test` or `go test ./...`

When checkpoints rely on live game behavior, always pair automated tests with at least one explicit scenario covering:

- successful tool result followed by blocking attention
- blocked follow-up game-bound call
- inspection and acknowledgement
- successful recovery after ack

## 17. Documentation And User-Facing Deliverables

Every repository needs some documentation work, not only code changes.

### 17.1 GABP

- protocol docs
- examples
- conformance fixtures
- AsyncAPI updates
- release notes

### 17.2 Lib.GAB

- README updates
- migration notes
- example server updates
- clear guidance that ordinary tool authors usually do not need direct attention logic

### 17.3 RimBridgeServer.Annotations

- README updates if any new additive metadata field is introduced
- explicit statement that such metadata is optional

### 17.4 RimBridgeServer

- README updates for integrators and operators
- docs explaining how attention relates to logs and diagnostics
- generated tool docs updates if result-description work is adopted

### 17.5 GABS

- README guidance for blocked calls
- operator-facing explanation of why a game may refuse further actions until attention is acknowledged
- host-facing guidance on inspection and recovery

## 18. Session Handoff And Restart Safety

This note is intended to survive context loss. A fresh session is safe once the current checkpoint is recorded clearly enough.

Before ending work on any day or before intentionally starting a new session, update this note or an adjacent tracking artifact with:

- the highest completed checkpoint
- the next intended checkpoint
- which repositories have landed code versus only planned work
- any frozen names or payload fields that must not be re-debated casually
- any blockers or unresolved open questions
- the latest known test status per repository

Minimum safe handoff rule:

- if another session can read this note plus the touched repository diffs and continue without relying on hidden chat context, the handoff is good enough

Practical rule:

- finish at a checkpoint boundary whenever possible
- if stopping mid-checkpoint, record exactly what remains and what has already been validated

## 19. Open Questions To Resolve During Spec Drafting

- Should `attention/current` return only the current item, or also a short recent history?
- Should `attention/ack` acknowledge only the current item, or accept an explicit `attentionId`?
- Should advisory and blocking attention share the same object shape?
- Which diagnostics methods, if any, should be recommended as gate-exempt in bridge guidance?
- Should the bridge be allowed to proceed automatically for non-blocking attention, or only surface it to the AI host?

These questions should be resolved before schemas and conformance fixtures are finalized.

## 20. Decision Summary

The recommended direction is:

- standardize a small additive attention feature within `gabp/1`
- keep diagnostics separate from control signals
- let game integrations decide what matters
- let bridges enforce a predictable execution gate
- hide most of the machinery inside Lib.GAB and bridge runtimes rather than inside individual tools
- sequence the rollout so every repository change is locally testable before the next layer depends on it
- keep richer output metadata optional and secondary to the core reliability work

That gives AI systems a reliable way to stop and reconsider when important game-side information appears, without turning the protocol into a raw log transport or forcing every tool vendor to implement custom protocol behavior.
