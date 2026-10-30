#!/usr/bin/env bash
# Keep all exit codes and compare residual failures to the exact safe parent.
P=reports/major-pilots/wuying-windows
S=scripts/major-pilots/wuying-windows
run(){ local name=$1; shift; "$@" > "$P/$name.log" 2>&1; echo "${name}_EXIT=$?"; tail -9 "$P/$name.log"; }
run world-parent env NODE_OPTIONS="--import ./$S/parent-retained-source.mjs" node "$S/world-trace.mjs" --parent
run world-candidate node "$S/world-trace.mjs"
run outer-parent env NODE_OPTIONS="--import ./$S/parent-retained-source.mjs --import ./$S/preserve-shared-reports.mjs" node --test --test-reporter=tap --test-concurrency=1 tests/r48-outer-*.test.mjs tests/r36-south-*.test.mjs tests/r37-wuying-representative-details.test.mjs tests/r52-wuying-*.test.mjs tests/r60-wuying-*.test.mjs tests/r76-wuying-*.test.mjs tests/r95-wuying-current-routes.test.mjs
run outer-final node --import "./$S/preserve-shared-reports.mjs" --test --test-reporter=tap --test-concurrency=1 tests/r48-outer-*.test.mjs tests/r36-south-*.test.mjs tests/r37-wuying-representative-details.test.mjs tests/r52-wuying-*.test.mjs tests/r60-wuying-*.test.mjs tests/r76-wuying-*.test.mjs tests/r95-wuying-current-routes.test.mjs
run current-state node --import "./$S/preserve-shared-reports.mjs" --test --test-concurrency=1 tests/current-state/*.test.mjs
run current-state-parent env NODE_OPTIONS="--import ./$S/parent-retained-source.mjs --import ./$S/preserve-shared-reports.mjs" node --test --test-concurrency=1 tests/current-state/*.test.mjs
run compile-memory node "$S/compile-memory.mjs"
