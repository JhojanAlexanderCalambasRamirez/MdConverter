#
# MdConverter — Full setup and build script for Windows
#
# Usage (PowerShell as Administrator):
#   irm https://raw.githubusercontent.com/JhojanAlexanderCalambasRamirez/MdConverter/main/scripts/setup.ps1 | iex
#
# Or after cloning:
#   .\scripts\setup.ps1
#
# This script will:
#   1. Verify all required tools are installed (Node.js, Rust, UV, Python)
#   2. Install missing tools automatically
#   3. Install all project dependencies (frontend + backend)
#   4. Build the Python sidecar binary with PyInstaller
#   5. Build the Tauri application (.exe NSIS installer)
#   6. Display the output path
#

$ErrorActionPreference = "Stop"

function Log-Info  { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Log-Ok    { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Log-Warn  { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Log-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "=============================================="
Write-Host "  MdConverter - Setup & Build (Windows)"
Write-Host "=============================================="
Write-Host ""

# --- Detect project root ---
if (Test-Path "src-tauri\tauri.conf.json") {
    $ProjectRoot = Get-Location
} elseif (Test-Path "..\src-tauri\tauri.conf.json") {
    $ProjectRoot = (Resolve-Path "..").Path
} else {
    if (-not (Test-Path "MdConverter")) {
        Log-Info "Cloning MdConverter repository..."
        git clone https://github.com/JhojanAlexanderCalambasRamirez/MdConverter.git
    }
    Set-Location "MdConverter"
    $ProjectRoot = Get-Location
}

Log-Info "Project root: $ProjectRoot"
Set-Location $ProjectRoot

# --- Step 1: Verify prerequisites ---
Write-Host ""
Log-Info "Step 1/5 - Checking prerequisites..."

$Missing = @()

# Node.js
try {
    $NodeVer = & node --version 2>$null
    Log-Ok "Node.js $NodeVer"
} catch {
    $Missing += "node"
    Log-Warn "Node.js not found"
}

# Rust
try {
    $RustVer = & rustc --version 2>$null
    Log-Ok "$RustVer"
} catch {
    if (Test-Path "$env:USERPROFILE\.cargo\env.ps1") {
        . "$env:USERPROFILE\.cargo\env.ps1"
        try {
            $RustVer = & rustc --version 2>$null
            Log-Ok "$RustVer (loaded from cargo env)"
        } catch {
            $Missing += "rust"
            Log-Warn "Rust not found"
        }
    } else {
        $Missing += "rust"
        Log-Warn "Rust not found"
    }
}

# UV
try {
    $UvVer = & uv --version 2>$null
    Log-Ok "uv $UvVer"
} catch {
    $Missing += "uv"
    Log-Warn "uv not found"
}

# Install missing tools
if ($Missing.Count -gt 0) {
    Write-Host ""
    Log-Info "Installing missing tools: $($Missing -join ', ')"

    foreach ($tool in $Missing) {
        switch ($tool) {
            "node" {
                if (Get-Command winget -ErrorAction SilentlyContinue) {
                    Log-Info "Installing Node.js via winget..."
                    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
                } else {
                    Log-Error "Please install Node.js manually: https://nodejs.org/"
                    exit 1
                }
            }
            "rust" {
                Log-Info "Installing Rust via rustup..."
                Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
                & "$env:TEMP\rustup-init.exe" -y
                $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
            }
            "uv" {
                Log-Info "Installing uv..."
                irm https://astral.sh/uv/install.ps1 | iex
                $env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"
            }
        }
    }

    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

    Write-Host ""
    Log-Ok "All tools installed"
}

# Verify Tauri CLI
try {
    & cargo-tauri --version 2>$null | Out-Null
} catch {
    Log-Info "Installing Tauri CLI..."
    cargo install tauri-cli --version "^2"
}
Log-Ok "Tauri CLI ready"

# --- Step 2: Install frontend dependencies ---
Write-Host ""
Log-Info "Step 2/5 - Installing frontend dependencies..."
Set-Location "$ProjectRoot\frontend"
npm install --silent
Log-Ok "Frontend dependencies installed"

# --- Step 3: Install Python backend dependencies ---
Write-Host ""
Log-Info "Step 3/5 - Installing Python backend dependencies..."
Set-Location "$ProjectRoot\backend"
uv sync
Log-Ok "Python backend dependencies installed"

# --- Step 4: Build sidecar ---
Write-Host ""
Log-Info "Step 4/5 - Building Python sidecar binary..."
Set-Location "$ProjectRoot"
$TargetTriple = & rustc --print host-tuple

Set-Location "$ProjectRoot\backend"
uv run pyinstaller `
    --onefile `
    --name mdconverter-sidecar `
    --console `
    --collect-data magika `
    --collect-data markitdown `
    --hidden-import converter.engine `
    --hidden-import converter.file_utils `
    --distpath "$ProjectRoot\src-tauri\binaries\" `
    --clean `
    converter\main.py

Rename-Item "$ProjectRoot\src-tauri\binaries\mdconverter-sidecar.exe" "mdconverter-sidecar-$TargetTriple.exe"

Log-Ok "Sidecar built for $TargetTriple"

# --- Step 5: Build application ---
Write-Host ""
Log-Info "Step 5/5 - Building MdConverter application..."
Set-Location "$ProjectRoot"
cargo tauri build

# --- Done ---
Write-Host ""
Write-Host "=============================================="
Write-Host "  Build complete!"
Write-Host "=============================================="

$InstallerPath = Get-ChildItem -Path "$ProjectRoot\src-tauri\target\release\bundle\nsis" -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($InstallerPath) {
    $Size = "{0:N1} MB" -f ($InstallerPath.Length / 1MB)
    Write-Host ""
    Log-Ok "Output: $($InstallerPath.FullName)"
    Log-Ok "Size: $Size"
    Write-Host ""
    Write-Host "  To install:"
    Write-Host "    1. Run the .exe installer"
    Write-Host "    2. Follow the installation wizard"
    Write-Host "    3. Open MdConverter from the Start Menu"
    Write-Host ""
}
