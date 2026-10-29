# Exact serial verification groups
Run from repo root, one process at a time. Redirect output to a new task report; keep prior failure receipts.

```sh
node scripts/major-pilots/yangxin-glazed-face/world-trace.mjs --parent
node scripts/major-pilots/yangxin-glazed-face/world-trace.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/yangxin-glazed-face/*.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r73-yangxin-{entrance,routes,full-world}.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-outer-{navigation,stairs,neighbors}.test.mjs
node --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/yangxin-glazed-face/parent-source.mjs --test --test-concurrency=1 --test-reporter=tap tests/r48-residential-*.test.mjs tests/r48-review-residential-central.test.mjs tests/west-six-current-passages.test.mjs
node --import ./scripts/major-pilots/yangxin-glazed-face/preserve-shared-reports.mjs --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/{changyin,jingqi,jiyun-lower-panels,jiyun-rail,xishang}/*.test.mjs tests/r100-xishang-{movement,stone-rails}.test.mjs tests/r104-roof-{integration,prefix-equivalence,surface}.test.mjs tests/r104-xiqing-motion.test.mjs tests/r65-pedestrian-controls.test.mjs tests/r91-terrain-vertical.test.mjs
node scripts/major-pilots/yangxin-glazed-face/cost.mjs
node scripts/major-pilots/yangxin-glazed-face/compile-memory.mjs
```
Actual parent source loaded through Node hooks frombb430800 YangxinCourtEntrance bytes; unchanged modules remain currentsafeparent bytes, not a simulated inverse. World trace --parent enables that hook internally before importing World. Complete-zone retention test launches two fresh sequential child processes and compares retained source/physics/nav hashes. Report relocation wrapper only changes output destinations, never assertions/controllers or production. Test commands are not a claim that the entire project suite is green.
