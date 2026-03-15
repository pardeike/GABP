# gabp-schemas-go

This package exposes the versioned `GABP` schema artifacts as embedded files for Go consumers.

The embedded tree is rooted at `schema/`, so callers use versioned paths such as:

- `1.0/envelope.schema.json`
- `1.0/common/tool.schema.json`
- `1.0/methods/tools.call.request.json`

You may also pass paths relative to the current schema version, such as `common/tool.schema.json`.

## Module Path

```text
github.com/pardeike/GABP/packages/go/schemas
```

## Releases

This package is released as a Go subdirectory module.

That means the version tag lives under the module directory prefix, for example:

```text
packages/go/schemas/v1.0.3
```

Go tooling resolves that tag to the module path declared in `go.mod`.

If you want to automate that, use the repository workflow `Release Go Schema Module`,
which creates and pushes the prefixed module tag for you.

## API

- `FS()` returns an `fs.FS` rooted at `schema/`
- `ReadFile(name)` reads a schema file by versioned path
- `Open(name)` opens a schema file by versioned path
- `Exists(name)` checks whether a schema path exists
- `List()` returns all embedded schema and README paths

## Usage

```go
package main

import (
    "fmt"

    gabpschemas "github.com/pardeike/GABP/packages/go/schemas"
)

func main() {
    data, err := gabpschemas.ReadFile("1.0/envelope.schema.json")
    if err != nil {
        panic(err)
    }

    fmt.Println(string(data))
}
```

## Syncing Embedded Assets

The Go package carries a copied `schema/1.0` tree because `go:embed` cannot include files from outside the package directory.

When `SCHEMA/1.0` changes, resync the embedded copy with:

```bash
./sync.sh
```
