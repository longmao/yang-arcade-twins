#!/usr/bin/env bash
# spec/verify.sh · Yang Arcade Twins · fail-closed gate(spec-driven skill hard rule)
# exit 0 = all green · exit 1 = any hard spec gate fails
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

PASS=()
FAIL=()

run() {
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then
    PASS+=("$name")
    echo "✅ $name"
  else
    FAIL+=("$name")
    echo "❌ $name"
  fi
}

# === Spec hard gates ===
echo "== spec-driven verification =="

# [1] 类型检查
run "tsc" npx tsc --noEmit

# [2] dependencies lock(版本硬尺)
for p in react-native-reanimated@4.5.3 react-native-worklets@0.11.2 react-native-svg react-native-gesture-handler react-native-haptic-feedback react-native-sound; do
  if node -e "const r=require('./package.json').dependencies;const k='$p'.split('@')[0];process.exit(r[k]?0:1)" 2>/dev/null; then
    PASS+=("dep $p")
  else
    FAIL+=("dep $p")
    echo "❌ dep $p missing"
  fi
done

# [3] babel plugin 必须是 react-native-worklets/plugin(不是 reanimated/plugin)
if grep -q "react-native-worklets/plugin" babel.config.js 2>/dev/null; then
  PASS+=("babel worklets plugin")
else
  FAIL+=("babel worklets plugin")
  echo "❌ babel.config.js missing react-native-worklets/plugin"
fi

# [4] spec 目录结构
for d in src/games/maze src/games/shooter src/shared features scripts/games; do
  if [[ -d "$d" ]]; then
    PASS+=("dir $d")
  else
    FAIL+=("dir $d")
    echo "❌ $d missing"
  fi
done

# [5] 每个 .feature.md ≤40 行(spec #1 hard bar)
fail_features=()
while IFS= read -r f; do
  lines=$(wc -l < "$f")
  if (( lines > 40 )); then
    fail_features+=("$f($lines)")
  fi
done < <(find features -name '*.feature.md' 2>/dev/null)
if (( ${#fail_features[@]} == 0 )); then
  PASS+=(".feature.md ≤40 行")
else
  FAIL+=(".feature.md ≤40 行")
  echo "❌ features >40 行: ${fail_features[*]}"
fi

# 汇总
echo
echo "PASS: ${#PASS[@]} / FAIL: ${#FAIL[@]}"
if (( ${#FAIL[@]} > 0 )); then
  exit 1
fi
exit 0
