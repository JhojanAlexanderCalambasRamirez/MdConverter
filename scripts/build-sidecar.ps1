#
# MdConverter — Build sidecar binary for Windows
#

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
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

Write-Host "Built sidecar for $TargetTriple"
