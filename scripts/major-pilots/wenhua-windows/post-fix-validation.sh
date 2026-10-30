#!/usr/bin/env bash
P=reports/major-pilots/wenhua-windows
S=scripts/major-pilots/wenhua-windows
run(){ local name=$1; shift; "$@" > "$P/$name.log" 2>&1; echo "${name}_EXIT=$?"; tail -9 "$P/$name.log"; }
run world-candidate node "$S/world-trace.mjs"
run outer-final node --import "./$S/preserve-shared-reports.mjs" --test --test-reporter=tap --test-concurrency=1 tests/r48-outer-*.test.mjs tests/r36-south-*.test.mjs tests/r39-wenhua-display-equipment.test.mjs tests/r59-wenhua-gate-*.test.mjs
run current-state node --import "./$S/preserve-shared-reports.mjs" --test --test-concurrency=1 tests/current-state/*.test.mjs
run compile-memory node "$S/compile-memory.mjs"
run combined-focused-final node --test tests/major-pilots/wenhua-windows/*.test.mjs tests/major-pilots/wenyuan-seat/*.test.mjs
python3 "$S/compare-results.py"
