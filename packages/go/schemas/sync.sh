#!/usr/bin/env sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/../../.." && pwd)
source_dir="$repo_root/SCHEMA/1.0"
target_root="$script_dir/schema"

rm -rf "$target_root"
mkdir -p "$target_root"
cp -R "$source_dir" "$target_root/"

printf 'Synced %s -> %s/1.0\n' "$source_dir" "$target_root"
