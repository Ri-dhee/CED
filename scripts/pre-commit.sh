#!/usr/bin/env bash
# pre-commit: GitNexus Gatekeeper
#
# Runs GitNexus change detection and impact analysis before allowing a commit
# that touches cross-cutting symbols.
#
# Exit codes:
#   0 — safe to commit
#   1 — commit blocked (review impact map first)
#   2 — skipped (GitNexus unavailable or not a git repo)
#
# Usage:
#   Copy or symlink to .git/hooks/pre-commit, or manage via husky:
#     npx husky add .husky/pre-commit "bash scripts/pre-commit.sh"

set -euo pipefail

# ── Guard: only run in a git repo with a GitNexus index ──────────
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "[pre-commit] Not a git repository — skipping GitNexus check."
  exit 2
fi

# Check for GitNexus CLI (pnpm/npm/bun global or local)
GITNEXUS_CMD=""
for cmd in gitnexus npx-gitnexus; do
  if command -v "$cmd" >/dev/null 2>&1; then
    GITNEXUS_CMD="$cmd"
    break
  fi
done

if [ -z "$GITNEXUS_CMD" ]; then
  echo "[pre-commit] GitNexus CLI not found — skipping impact check."
  echo "[pre-commit] Install: npm install -g @gitnexus/cli  (or see docs/guides/gitnexus-setup.md)"
  exit 2
fi

# ── Configuration ────────────────────────────────────────────────
MAX_SYMBOL_IMPACT=20   # Fail the commit when more than this many symbols are affected

# ── Collect staged changes ───────────────────────────────────────
echo "[pre-commit] Analyzing staged changes with GitNexus..."

# Run GitNexus change detection on staged changes
CHANGES_JSON=$("$GITNEXUS_CMD" detect-changes --scope staged --json 2>/dev/null || true)

if [ -z "$CHANGES_JSON" ] || [ "$CHANGES_JSON" = "null" ]; then
  echo "[pre-commit] No relevant indexed symbols changed — skipping."
  exit 0
fi

# Extract the affected symbol count
AFFECTED_COUNT=$(echo "$CHANGES_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('affectedSymbols', [])))" 2>/dev/null || echo "0")

if [ "$AFFECTED_COUNT" -eq 0 ]; then
  echo "[pre-commit] No indexed symbols affected — safe to commit."
  exit 0
fi

echo "[pre-commit] Found $AFFECTED_COUNT symbol(s) affected by this change."

# ── Run impact analysis on each affected symbol ──────────────────
HIGH_RISK_COUNT=0
for symbol in $(echo "$CHANGES_JSON" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('affectedSymbols', []):
    print(f\"{s.get('name','')}|{s.get('filePath','')}\")
" 2>/dev/null); do
  NAME="${symbol%%|*}"
  FILE="${symbol##*|}"
  IMPACT_JSON=$("$GITNEXUS_CMD" impact --target "$NAME" --file-path "$FILE" --direction upstream --json 2>/dev/null || true)
  if [ -n "$IMPACT_JSON" ] && [ "$IMPACT_JSON" != "null" ]; then
    TOTAL_AFFECTED=$(echo "$IMPACT_JSON" | python3 -c "
import sys,json
d=json.load(sys.stdin)
by_depth = d.get('byDepth', {})
total = sum(len(v) for v in by_depth.values())
print(total)
" 2>/dev/null || echo "0")
    if [ "$TOTAL_AFFECTED" -gt "$MAX_SYMBOL_IMPACT" ]; then
      echo "  ⚠  $NAME ($FILE) — affects $TOTAL_AFFECTED downstream symbols"
      HIGH_RISK_COUNT=$((HIGH_RISK_COUNT + 1))
    fi
  fi
done

# ── Gate ─────────────────────────────────────────────────────
echo ""
if [ "$HIGH_RISK_COUNT" -gt 0 ]; then
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  ✋ REVIEW IMPACT MAP REQUIRED                              ║"
  echo "║  $HIGH_RISK_COUNT symbol(s) affect more than $MAX_SYMBOL_IMPACT downstream targets.  ║"
  echo "║                                                              ║"
  echo "║  Run:  gitnexus impact --target <symbol> --direction upstream ║"
  echo "║  to review the full blast radius before committing.           ║"
  echo "║                                                              ║"
  echo "║  To bypass (not recommended): git commit --no-verify         ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  exit 1
fi

echo "[pre-commit] Impact within acceptable range — safe to commit."
exit 0
