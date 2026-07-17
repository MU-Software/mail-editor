#!/usr/bin/env bash
#
# Run the same CodeQL analysis GitHub's CI uses (JavaScript/TypeScript,
# security-extended, build-mode: none) locally, so findings such as
# incomplete-sanitization / injection can be caught BEFORE pushing.
#
# Usage:
#   scripts/codeql-local.sh                       # scan the whole repo (minus node_modules/dist)
#   scripts/codeql-local.sh packages/mail-editor  # scan only the given path(s) — faster
#
# Requires the CodeQL CLI:
#   brew install --cask codeql
#
# Exit code is non-zero when any finding is reported, so this can gate a commit.
# The CodeQL database is a snapshot, so this always rebuilds it from the current tree.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v codeql >/dev/null 2>&1; then
  echo "error: CodeQL CLI not found. Install it with:" >&2
  echo "  brew install --cask codeql" >&2
  exit 127
fi

WORKDIR="$(mktemp -d)"
DB_DIR="$WORKDIR/db"
SARIF="$WORKDIR/results.sarif"
CONFIG="$WORKDIR/config.yml"

# Explicit args become an allow-list (`paths:`); node_modules/dist are always ignored
# so the local (installed) dependency tree is not scanned — matching CI, which never
# installs deps for build-mode: none.
{
  if [ "$#" -gt 0 ]; then
    echo "paths:"
    for p in "$@"; do echo "  - $p"; done
  fi
  echo "paths-ignore:"
  echo "  - '**/node_modules'"
  echo "  - '**/dist'"
} >"$CONFIG"

# CodeQL is very chatty; keep its progress in a log and only surface it on failure.
LOG="$WORKDIR/codeql.log"

echo "==> Creating CodeQL database"
if ! codeql database create "$DB_DIR" \
  --language=javascript-typescript \
  --source-root=. \
  --build-mode=none \
  --codescanning-config="$CONFIG" \
  --overwrite >"$LOG" 2>&1; then
  cat "$LOG" >&2
  exit 1
fi

echo "==> Analyzing (security-extended)"
if ! codeql database analyze "$DB_DIR" \
  codeql/javascript-queries:codeql-suites/javascript-security-extended.qls \
  --format=sarif-latest \
  --output="$SARIF" \
  --download >"$LOG" 2>&1; then
  cat "$LOG" >&2
  exit 1
fi

echo "==> Results"
python3 - "$SARIF" <<'PY'
import json, sys

data = json.load(open(sys.argv[1]))
results = [r for run in data.get("runs", []) for r in run.get("results", [])]
for r in results:
    loc = r.get("locations", [{}])[0].get("physicalLocation", {})
    uri = loc.get("artifactLocation", {}).get("uri", "?")
    line = loc.get("region", {}).get("startLine", "?")
    print(f"  [{r.get('ruleId', '?')}] {uri}:{line}")
    print(f"      {r.get('message', {}).get('text', '')}")

print(f"\n{len(results)} finding(s).")
print(f"SARIF report: {sys.argv[1]}")
sys.exit(1 if results else 0)
PY
