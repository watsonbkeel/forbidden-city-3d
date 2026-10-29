#!/usr/bin/env bash
set -u
D=reports/major-pilots/xianfu-front
run(){ local name=$1; shift; printf '%s START %s\n' "$(date -u +%FT%TZ)" "$name"; "$@" > "$D/rc-$name.log" 2>&1; local status=$?; printf '%s END %s exit=%s\n' "$(date -u +%FT%TZ)" "$name" "$status"; tail -9 "$D/rc-$name.log"; }
node --input-type=module -e "import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))" > "$D/rc-fingerprint.txt"
run world node scripts/major-pilots/xianfu-front/world-trace.mjs
run specialized node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/xianfu-front/*.test.mjs
run navigation32 node --test --test-concurrency=1 --test-reporter=tap tests/r48-outer-{navigation,stairs,neighbors}.test.mjs
run residential node --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
run residential-parent node --import ./scripts/major-pilots/xianfu-front/parent-retained-source.mjs --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
run shared161 node --import ./scripts/major-pilots/xianfu-front/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/{changyin,jingqi,jiyun-lower-panels,jiyun-rail,xishang}/*.test.mjs tests/r100-xishang-{movement,stone-rails}.test.mjs tests/r104-roof-{integration,prefix-equivalence,surface}.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs
run compile node scripts/major-pilots/xianfu-front/compile-memory.mjs
run cost node scripts/major-pilots/xianfu-front/cost.mjs
