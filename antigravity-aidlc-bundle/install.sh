#!/usr/bin/env bash
set -e

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' does not exist."
  echo "Usage: ./install.sh [path/to/target/project]"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing AI-DLC for Antigravity into: $TARGET_DIR"

mkdir -p "$TARGET_DIR/.agents/rules"
mkdir -p "$TARGET_DIR/.agents/skills/aidlc"
mkdir -p "$TARGET_DIR/.aidlc-rule-details"

cp -R "$SCRIPT_DIR/.agents/" "$TARGET_DIR/.agents/"
cp -R "$SCRIPT_DIR/.aidlc-rule-details/" "$TARGET_DIR/.aidlc-rule-details/"

echo "✅ AI-DLC successfully installed for Antigravity!"
echo ""
echo "Next steps in your project:"
echo "1. Open the project in Antigravity"
echo "2. Prompt Antigravity: 'Using AI-DLC, <your request>'"
