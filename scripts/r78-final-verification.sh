#!/usr/bin/env bash
set -u
D=reports/r78-night-household
node --test --test-concurrency=1 tests/r78-bed-households.test.mjs tests/r78-bed-lifecycle.test.mjs tests/r78-bed-world.test.mjs tests/r78-environment-clock.test.mjs tests/r78-household-lighting.test.mjs tests/r78-sleep-budget.test.mjs tests/r78-sleep-eyes.test.mjs tests/r78-source-inventory.test.mjs tests/r78-world-lighting.test.mjs > "$D/final-focused.tap" 2>&1; echo focused:$?
files=$(find tests -maxdepth 1 -name 'r7[23456]-*.test.mjs' ! -name '*source-inventory*' ! -name '*night-four*' ! -name 'r72-bed-lifecycle*' ! -name 'r72-sleep-budget*' | sort)
node --test --test-concurrency=1 $files tests/map-inputs.test.mjs tests/r36-helicopter-independent-lifecycle.test.mjs tests/r36-helicopter-input-handoff.test.mjs tests/r77-wall-crenellations.test.mjs tests/wumen-wall-cap-fit.test.mjs tests/wumen-landing-wall-top.test.mjs > "$D/cumulative-retention.tap" 2>&1; echo cumulative:$?
node --test --test-concurrency=1 tests/r72-bed-lifecycle.test.mjs tests/r72-sleep-budget.test.mjs > "$D/superseded-contracts.tap" 2>&1; echo superseded:$?
node --test --test-concurrency=1 tests/current-state/*.test.mjs > "$D/current-state.tap" 2>&1; echo current-state:$?
node tests/zone-lint.cjs > "$D/zones.log" 2>&1; echo zones:$?
node tests/anchor-check.cjs > "$D/anchors.log" 2>&1; echo anchors:$?
