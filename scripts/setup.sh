#!/bin/bash
#
# MdConverter — Full setup and build script for macOS and Linux
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/JhojanAlexanderCalambasRamirez/MdConverter/main/scripts/setup.sh | bash
#
# Or after cloning:
#   ./scripts/setup.sh
#
# This script will:
#   1. Verify all required tools are installed (Node.js, Rust, UV, Python)
#   2. Install missing tools automatically (with user confirmation)
#   3. Install all project dependencies (frontend + backend)
#   4. Build the Python sidecar binary with PyInstaller
#   5. Build the Tauri application (.dmg on macOS)
#   6. Display the output path
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "  MdConverter — Setup & Build"
echo "=============================================="
echo ""

# ─── Detect project root ───────────────────────────────────────
if [ -f "src-tauri/tauri.conf.json" ]; then
    PROJECT_ROOT="$(pwd)"
elif [ -f "../src-tauri/tauri.conf.json" ]; then
    PROJECT_ROOT="$(cd .. && pwd)"
else
    # Try cloning if not in project directory
    if [ ! -d "MdConverter" ]; then
        log_info "Cloning MdConverter repository..."
        git clone https://github.com/JhojanAlexanderCalambasRamirez/MdConverter.git
    fi
    cd MdConverter
    PROJECT_ROOT="$(pwd)"
fi

log_info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# ─── Step 1: Verify prerequisites ──────────────────────────────
echo ""
log_info "Step 1/5 — Checking prerequisites..."

MISSING=()

# Node.js
if command -v node &>/dev/null; then
    NODE_VER=$(node --version)
    log_ok "Node.js $NODE_VER"
else
    MISSING+=("node")
    log_warn "Node.js not found"
fi

# npm
if command -v npm &>/dev/null; then
    NPM_VER=$(npm --version)
    log_ok "npm $NPM_VER"
else
    MISSING+=("npm")
    log_warn "npm not found"
fi

# Rust
if command -v rustc &>/dev/null; then
    RUST_VER=$(rustc --version)
    log_ok "$RUST_VER"
elif [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
    if command -v rustc &>/dev/null; then
        RUST_VER=$(rustc --version)
        log_ok "$RUST_VER (loaded from ~/.cargo/env)"
    else
        MISSING+=("rust")
        log_warn "Rust not found"
    fi
else
    MISSING+=("rust")
    log_warn "Rust not found"
fi

# UV
if command -v uv &>/dev/null; then
    UV_VER=$(uv --version)
    log_ok "uv $UV_VER"
else
    MISSING+=("uv")
    log_warn "uv not found"
fi

# Install missing tools
if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    log_info "Installing missing tools: ${MISSING[*]}"

    for tool in "${MISSING[@]}"; do
        case $tool in
            node|npm)
                if [[ "$OSTYPE" == "darwin"* ]] && command -v brew &>/dev/null; then
                    log_info "Installing Node.js via Homebrew..."
                    brew install node
                else
                    log_error "Please install Node.js manually: https://nodejs.org/"
                    exit 1
                fi
                ;;
            rust)
                log_info "Installing Rust via rustup..."
                curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                source "$HOME/.cargo/env"
                ;;
            uv)
                log_info "Installing uv..."
                curl -LsSf https://astral.sh/uv/install.sh | sh
                export PATH="$HOME/.local/bin:$PATH"
                ;;
        esac
    done

    echo ""
    log_ok "All tools installed"
fi

# Verify Tauri CLI
if ! command -v cargo-tauri &>/dev/null; then
    log_info "Installing Tauri CLI..."
    cargo install tauri-cli --version "^2"
fi
log_ok "Tauri CLI ready"

# ─── Step 2: Install dependencies ──────────────────────────────
echo ""
log_info "Step 2/5 — Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install --silent
log_ok "Frontend dependencies installed"

echo ""
log_info "Step 3/5 — Installing Python backend dependencies..."
cd "$PROJECT_ROOT/backend"
uv sync
log_ok "Python backend dependencies installed"

# ─── Step 3: Build sidecar ─────────────────────────────────────
echo ""
log_info "Step 4/5 — Building Python sidecar binary..."
cd "$PROJECT_ROOT"
TARGET_TRIPLE=$(rustc --print host-tuple)

cd "$PROJECT_ROOT/backend"
uv run pyinstaller \
    --onefile \
    --name mdconverter-sidecar \
    --console \
    --collect-data magika \
    --collect-data markitdown \
    --hidden-import converter.engine \
    --hidden-import converter.file_utils \
    --distpath "$PROJECT_ROOT/src-tauri/binaries/" \
    --clean \
    converter/main.py 2>&1 | grep -E "INFO: Build complete|ERROR"

mv "$PROJECT_ROOT/src-tauri/binaries/mdconverter-sidecar" \
   "$PROJECT_ROOT/src-tauri/binaries/mdconverter-sidecar-${TARGET_TRIPLE}"

log_ok "Sidecar built for $TARGET_TRIPLE"

# ─── Step 4: Build application ─────────────────────────────────
echo ""
log_info "Step 5/5 — Building MdConverter application..."
cd "$PROJECT_ROOT"
cargo tauri build 2>&1 | grep -E "Bundling|Finished|Error|Built"

# ─── Done ──────────────────────────────────────────────────────
echo ""
echo "=============================================="
echo "  Build complete!"
echo "=============================================="

if [[ "$OSTYPE" == "darwin"* ]]; then
    DMG_PATH=$(find "$PROJECT_ROOT/src-tauri/target/release/bundle/dmg" -name "*.dmg" 2>/dev/null | head -1)
    if [ -n "$DMG_PATH" ]; then
        DMG_SIZE=$(du -h "$DMG_PATH" | cut -f1)
        echo ""
        log_ok "Output: $DMG_PATH"
        log_ok "Size: $DMG_SIZE"
        echo ""
        echo "  To install:"
        echo "    1. Open the .dmg file"
        echo "    2. Drag MdConverter to Applications"
        echo "    3. Run: xattr -cr /Applications/MdConverter.app"
        echo "    4. Open MdConverter from Applications"
        echo ""
    fi
else
    APP_PATH=$(find "$PROJECT_ROOT/src-tauri/target/release/bundle" -name "*.AppImage" -o -name "*.deb" 2>/dev/null | head -1)
    if [ -n "$APP_PATH" ]; then
        log_ok "Output: $APP_PATH"
    fi
fi
