# Gabp.Schemas

Versioned GABP schema assets for .NET consumers.

This package embeds the canonical `SCHEMA/1.0` tree from the `GABP` repository so .NET projects can validate against the same published protocol artifacts without copying schema files locally.

## Package Scope

The package is intentionally narrow. It provides:

- embedded schema assets for the current GABP release
- a small access API for opening or reading schema files
- stable versioned paths such as `1.0/envelope.schema.json`

It does not provide transport logic, request handling, or higher-level protocol runtime code.

NuGet package ID: `Gabp.Schemas`

C# namespace: `Gabp.Schemas`

## Usage

```csharp
using Gabp.Schemas;

var envelopeSchema = SchemaAssets.ReadAllText("envelope.schema.json");
var toolSchema = SchemaAssets.ReadAllText("common/tool.schema.json");

foreach (var path in SchemaAssets.ListPaths())
{
    Console.WriteLine(path);
}
```

You may pass either a versioned path such as `1.0/methods/tools.call.request.json` or a path relative to the current schema version such as `methods/tools.call.request.json`.

## Source Of Truth

The canonical source of truth remains the top-level `SCHEMA/1.0` directory in the `GABP` repository. This package simply exposes those artifacts to .NET consumers.
