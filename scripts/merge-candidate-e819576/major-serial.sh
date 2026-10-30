#!/usr/bin/env bash
set -u
REPORT=reports/merge-candidate-e819576
while [ ! -f "$REPORT/critical-candidate.exit" ]; do sleep 5; done
find tests/major-pilots -name '*.test.mjs' -print0 | sort -z | xargs -0 node --import ./scripts/merge-candidate-e819576/relocate-test-output.mjs --test --test-reporter=tap --test-concurrency=1 > "$REPORT/major-pilots-serial.tap" 2>&1
echo $? > "$REPORT/major-pilots-serial.exit"
