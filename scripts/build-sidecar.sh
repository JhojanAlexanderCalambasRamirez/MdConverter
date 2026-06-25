#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TARGET_TRIPLE=$(rustc --print host-tuple)

cd "$PROJECT_ROOT/backend"
uv run pyinstaller \
  --onefile \
  --name mdconverter-sidecar \
  --console \
  --distpath "$PROJECT_ROOT/src-tauri/binaries/" \
  converter/main.py

mv "$PROJECT_ROOT/src-tauri/binaries/mdconverter-sidecar" \
   "$PROJECT_ROOT/src-tauri/binaries/mdconverter-sidecar-${TARGET_TRIPLE}"

echo "Built sidecar for ${TARGET_TRIPLE}"
