#!/usr/bin/env bash
set -u
ROOT=$(pwd)
REPORT="$ROOT/reports/merge-candidate-e819576"
BASE=/tmp/r35-main-exact
# Wait for broad runner to finish before memory-heavy true production scenes.
while [ ! -f "$REPORT/major-pilots.exit" ]; do sleep 5; done
for SIDE in main candidate; do
  if [ "$SIDE" = main ]; then RUNROOT="$BASE"; else RUNROOT="$ROOT"; fi
  (cd "$RUNROOT" && node --import ./tests/r141-fix/json-hooks.mjs --test --test-reporter=tap --test-concurrency=1 tests/r146-fix/*.test.mjs tests/r141-fix/*.test.mjs tests/r34-environment-ownership.test.mjs tests/r35-resource-ownership.test.mjs tests/r78-environment-clock.test.mjs) > "$REPORT/critical-$SIDE.tap" 2>&1
  echo $? > "$REPORT/critical-$SIDE.exit"
done
