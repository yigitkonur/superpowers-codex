#!/usr/bin/env bash
# install-codex.sh — Install superpowers-codex as the active Codex skills provider
#
# Usage: bash install-codex.sh
#
# What it does:
#   1. Ensures ~/.agents/skills/ directory exists
#   2. Removes any existing superpowers symlink
#   3. Creates symlink: ~/.agents/skills/superpowers → this repo's skills/
#   4. Verifies multi_agent feature flag in ~/.codex/config.toml
#   5. Prints status

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"
AGENTS_DIR="$HOME/.agents/skills"
SYMLINK_TARGET="$AGENTS_DIR/superpowers"
CONFIG_FILE="$HOME/.codex/config.toml"

echo "=== Superpowers for Codex — Installer ==="
echo ""

# 1. Ensure ~/.agents/skills/ exists
if [ ! -d "$AGENTS_DIR" ]; then
    echo "[1/4] Creating $AGENTS_DIR..."
    mkdir -p "$AGENTS_DIR"
else
    echo "[1/4] $AGENTS_DIR exists"
fi

# 2. Handle existing symlink
if [ -L "$SYMLINK_TARGET" ]; then
    OLD_TARGET="$(readlink "$SYMLINK_TARGET")"
    echo "[2/4] Removing existing symlink: $SYMLINK_TARGET -> $OLD_TARGET"
    rm "$SYMLINK_TARGET"
elif [ -d "$SYMLINK_TARGET" ]; then
    echo "[2/4] WARNING: $SYMLINK_TARGET is a real directory, not a symlink."
    echo "       Please back it up and remove it manually, then re-run."
    exit 1
else
    echo "[2/4] No existing superpowers symlink found"
fi

# 3. Create new symlink
echo "[3/4] Creating symlink: $SYMLINK_TARGET -> $SKILLS_SRC"
ln -s "$SKILLS_SRC" "$SYMLINK_TARGET"

# 4. Check config.toml for multi_agent
echo "[4/4] Checking Codex config for multi_agent feature flag..."
if [ -f "$CONFIG_FILE" ]; then
    if grep -q 'multi_agent\s*=\s*true' "$CONFIG_FILE" 2>/dev/null; then
        echo "       multi_agent = true is set"
    else
        echo "       WARNING: multi_agent = true NOT found in $CONFIG_FILE"
        echo "       Subagent-driven development requires this flag."
        echo "       Add the following to your config.toml:"
        echo ""
        echo '       [features]'
        echo '       multi_agent = true'
        echo ""
    fi
else
    echo "       WARNING: $CONFIG_FILE not found"
    echo "       Create it with at minimum:"
    echo ""
    echo '       [features]'
    echo '       multi_agent = true'
    echo ""
fi

echo ""
echo "=== Installation complete ==="
echo ""
echo "Symlink: $SYMLINK_TARGET -> $SKILLS_SRC"
echo ""
echo "Skills installed:"
ls -1 "$SKILLS_SRC" | grep -v '^\.' | while read -r skill; do
    if [ -f "$SKILLS_SRC/$skill/SKILL.md" ]; then
        echo "  - $skill"
    fi
done
echo ""
echo "Start a new Codex session. Skills auto-load when your prompt matches."
echo "Reference skills with \$skill-name in prompts or AGENTS.md."
