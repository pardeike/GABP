package schemas

import (
	"embed"
	"errors"
	"io/fs"
	"path"
	"sort"
	"strings"
)

const CurrentVersion = "1.0"

var (
	//go:embed schema/**
	embeddedFiles embed.FS
	schemaFS      = mustSubFS(embeddedFiles, "schema")
	errInvalidPath = errors.New("invalid schema path")
)

func FS() fs.FS {
	return schemaFS
}

func Open(name string) (fs.File, error) {
	cleaned, err := cleanPath(name)
	if err != nil {
		return nil, err
	}

	return schemaFS.Open(cleaned)
}

func ReadFile(name string) ([]byte, error) {
	cleaned, err := cleanPath(name)
	if err != nil {
		return nil, err
	}

	return fs.ReadFile(schemaFS, cleaned)
}

func Exists(name string) bool {
	cleaned, err := cleanPath(name)
	if err != nil {
		return false
	}

	_, err = fs.Stat(schemaFS, cleaned)
	return err == nil
}

func List() ([]string, error) {
	var names []string

	err := fs.WalkDir(schemaFS, ".", func(current string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			return nil
		}

		names = append(names, current)
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Strings(names)
	return names, nil
}

func cleanPath(name string) (string, error) {
	trimmed := strings.TrimSpace(strings.TrimPrefix(name, "/"))
	if trimmed == "" {
		return "", errInvalidPath
	}

	cleaned := path.Clean(trimmed)
	if cleaned == "." || cleaned == ".." || strings.HasPrefix(cleaned, "../") {
		return "", errInvalidPath
	}

	if !strings.HasPrefix(cleaned, CurrentVersion+"/") {
		cleaned = CurrentVersion + "/" + cleaned
	}

	return cleaned, nil
}

func mustSubFS(root fs.FS, dir string) fs.FS {
	sub, err := fs.Sub(root, dir)
	if err != nil {
		panic(err)
	}

	return sub
}
