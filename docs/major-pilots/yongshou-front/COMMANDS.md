# Reproducible serial verification commands
Run from repository root; wait for each process to finish. Reports are bounded and distinct; do not replace prior failure receipts.

```sh
node scripts/major-pilots/yongshou-front/world-trace.mjs --parent
node scripts/major-pilots/yongshou-front/world-trace.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/yongshou-front/*.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-outer-{navigation,stairs,neighbors}.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/yongshou-front/parent-retained-source.mjs --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/yongshou-front/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/{changyin,jingqi,jiyun-lower-panels,jiyun-rail,xishang}/*.test.mjs tests/r100-xishang-{movement,stone-rails}.test.mjs tests/r104-roof-{integration,prefix-equivalence,surface}.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs
node scripts/major-pilots/yongshou-front/cost.mjs
node scripts/major-pilots/yongshou-front/compile-memory.mjs
```

The shared wrapper only relocates generated report writes to this task's shared-output directory; assertions/routes/production are unchanged. Parent replay loads actual cb455649 RemainingResidentialHalls bytes through Node loader hooks, not simulated inverse geometry. First shared list was recovered by static comparison against prior Tihe161 TAP subtest titles (40files); recorded here to avoid future ambiguity. Navigation uses original outer-stairs, not its similarly titled audit copy.
