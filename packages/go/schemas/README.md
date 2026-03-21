# GABP Go Schemas

Versioned GABP schema assets for Go consumers.

This module embeds a copy of the canonical `SCHEMA/1.0` tree from this repository, rooted at `schema/`, so Go code can
read the same versioned artifacts used by the protocol release.

## Module Path

```text
github.com/pardeike/GABP/packages/go/schemas
```

When consuming a tagged release:

```bash
go get github.com/pardeike/GABP/packages/go/schemas@latest
```

Releases use subdirectory-prefixed tags such as `packages/go/schemas/v1.1.0`.

## API Surface

- `CurrentVersion` is the bundled schema version (`1.0`).
- `FS()` returns an `fs.FS` rooted at `schema/`.
- `ReadFile(name)` reads a schema file.
- `Open(name)` opens a schema file.
- `Exists(name)` reports whether a schema path exists.
- `List()` returns all embedded schema and README paths.

You may pass either a versioned path such as `1.0/envelope.schema.json` or a path relative to the current schema version
such as `common/tool.schema.json`.

Examples of versioned paths:

- `1.0/envelope.schema.json`
- `1.0/common/tool.schema.json`
- `1.0/methods/tools.call.request.json`

## Usage

```go
package main

import (
    "fmt"

    gabpschemas "github.com/pardeike/GABP/packages/go/schemas"
)

func main() {
    data, err := gabpschemas.ReadFile("methods/tools.call.request.json")
    if err != nil {
        panic(err)
    }

    fmt.Println(gabpschemas.CurrentVersion)
    fmt.Println(string(data))
}
```

## Syncing Embedded Assets

The Go package carries a copied `schema/1.0` tree because `go:embed` cannot include files from outside the package
directory.

When `SCHEMA/1.0` changes, resync the embedded copy with:

```bash
./sync.sh
```
