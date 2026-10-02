#!/usr/bin/env bash
# Explore Bharat Safar — Release Tagging & SemVer Automation Script
set -euo pipefail

BUMP_TYPE="${1:-patch}"
CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")
CLEAN_VERSION="${CURRENT_TAG#v}"

IFS='.' read -r MAJOR MINOR PATCH <<< "$CLEAN_VERSION"

case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Error: Invalid bump type '$BUMP_TYPE'. Allowed: major, minor, patch"
    exit 1
    ;;
esac

NEW_TAG="v${MAJOR}.${MINOR}.${PATCH}"
echo "[Release] Incrementing from ${CURRENT_TAG} -> ${NEW_TAG} (${BUMP_TYPE})"

# Verify git workspace clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Warning: Git workspace has uncommitted changes. Creating local release tag only."
fi

echo "Release Tag generated: ${NEW_TAG}"
echo "TAG_NAME=${NEW_TAG}" >> "${GITHUB_OUTPUT:-/dev/null}"
