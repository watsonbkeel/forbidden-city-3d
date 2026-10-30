# Exact serial commands
All commands from repo root; no concurrent heavy runs. Preserve red/first/final reports.
```sh
node scripts/major-pilots/xianfu-front/world-trace.mjs --parent
node scripts/major-pilots/xianfu-front/world-trace.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/xianfu-front/*.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-outer-{navigation,stairs,neighbors}.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/xianfu-front/parent-retained-source.mjs --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/xianfu-front/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/{changyin,jingqi,jiyun-lower-panels,jiyun-rail,xishang}/*.test.mjs tests/r100-xishang-{movement,stone-rails}.test.mjs tests/r104-roof-{integration,prefix-equivalence,surface}.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs
node scripts/major-pilots/xianfu-front/cost.mjs
node scripts/major-pilots/xianfu-front/compile-memory.mjs
```
Parent module is actual6cc0d1bd RemainingResidentialHalls bytes through Node registerHooks/dataURL, not a simulated inverse. World parent switches only this exact hall's builder. All other source bytes remain unchanged. Full-zone source captures use two fresh sequential processes. Report wrapper changes only old output destinations. These named groups are not a claim of an entirely green project suite.
