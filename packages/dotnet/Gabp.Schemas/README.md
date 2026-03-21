# Gabp.Schemas

Versioned GABP schema assets for .NET consumers.

This package embeds the canonical `SCHEMA/1.0` tree from this repository and exposes those files through `SchemaAssets`,
so .NET consumers can read the same versioned artifacts used by the protocol release.

## Package Identity

- NuGet package ID: `Gabp.Schemas`
- C# namespace: `Gabp.Schemas`

If you are consuming the published package:

```bash
dotnet add package Gabp.Schemas
```

## API Surface

- `SchemaAssets.CurrentVersion` returns the bundled schema version (`1.0`).
- `SchemaAssets.ListPaths()` returns all embedded asset paths.
- `SchemaAssets.Exists(path)` checks whether a schema asset exists.
- `SchemaAssets.Open(path)` opens an embedded asset as a `Stream`.
- `SchemaAssets.ReadAllText(path)` reads an embedded asset as UTF-8 text.

Paths may be versioned, such as `1.0/methods/tools.call.request.json`, or relative to the current schema version, such
as `methods/tools.call.request.json`.

## Usage

```csharp
using Gabp.Schemas;

var envelopeSchema = SchemaAssets.ReadAllText("envelope.schema.json");
var toolSchema = SchemaAssets.ReadAllText("common/tool.schema.json");

if (SchemaAssets.Exists("1.0/methods/tools.call.request.json"))
{
    using var stream = SchemaAssets.Open("methods/tools.call.request.json");
}

foreach (var path in SchemaAssets.ListPaths())
{
    Console.WriteLine(path);
}
```

## Scope

This package only ships schema assets and a small access API. It does not implement transport, request handling, or a
higher-level GABP runtime.
