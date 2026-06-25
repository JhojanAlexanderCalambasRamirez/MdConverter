#!/bin/bash
#
# MdConverter — Installer for macOS
# Double-click this file to install MdConverter
#

clear
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║       MdConverter — Installer            ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

APP_NAME="MdConverter.app"
APP_PATH="/Applications/$APP_NAME"

# Check if app is in Applications
if [ ! -d "$APP_PATH" ]; then
    echo "  MdConverter not found in Applications."
    echo ""
    echo "  Please follow these steps first:"
    echo ""
    echo "    1. Open the MdConverter .dmg file"
    echo "    2. Drag MdConverter to the Applications folder"
    echo "    3. Run this installer again"
    echo ""
    echo "  Press any key to close..."
    read -n 1 -s
    exit 1
fi

echo "  MdConverter found in Applications."
echo ""
echo "  Removing macOS security block..."
echo ""

# Remove quarantine attribute
xattr -cr "$APP_PATH" 2>/dev/null

echo "  Done! MdConverter is ready to use."
echo ""
echo "  Opening MdConverter..."
echo ""

# Open the app
open "$APP_PATH"

echo "  You can close this window."
echo ""
sleep 3
