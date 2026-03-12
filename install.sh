#!/usr/bin/env bash
#
# superpowers-codex one-liner installer
#
# Usage:
#   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/yigitkonur/superpowers-codex/main/install.sh)"
#
# Or with flags:
#   curl -fsSL .../install.sh | bash -s -- --user
#   curl -fsSL .../install.sh | bash -s -- --uninstall

set -euo pipefail

REPO="https://github.com/yigitkonur/superpowers-codex.git"
INSTALLER_URL="https://raw.githubusercontent.com/yigitkonur/superpowers-codex/main/cli.js"
TMP_DIR=$(mktemp -d)

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

info()  { printf "  ${CYAN}→${RESET} %s\n" "$1"; }
ok()    { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
fail()  { printf "  ${RED}✗${RESET} %s\n" "$1"; exit 1; }

printf "\n${BOLD}superpowers-codex${RESET} ${DIM}installer${RESET}\n"
printf "${DIM}────────────────────────────${RESET}\n\n"

if ! command -v git &>/dev/null; then
  fail "git is required. install from https://git-scm.com"
fi
ok "git found ($(git --version | grep -oE '[0-9]+\.[0-9]+[\.0-9]*'))"

if ! command -v node &>/dev/null; then
  fail "node is required (>=18). install from https://nodejs.org"
fi

NODE_VERSION=$(node --version | grep -oE '[0-9]+' | head -1)
if [ "$NODE_VERSION" -lt 18 ]; then
  fail "node $(node --version) is too old — need >=18"
fi
ok "node found ($(node --version | tr -d 'v'))"

info "downloading installer..."

if curl -fsSL "$INSTALLER_URL" -o "$TMP_DIR/cli.js" 2>/dev/null; then
  ok "installer downloaded"
else
  info "direct download failed, cloning repo..."
  git clone --depth 1 "$REPO" "$TMP_DIR/repo" 2>/dev/null
  cp "$TMP_DIR/repo/cli.js" "$TMP_DIR/cli.js"
  ok "installer ready"
fi

# pass through any flags
node "$TMP_DIR/cli.js" install "$@"
