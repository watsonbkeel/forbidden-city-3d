# R38 independent appendix: continuous five-bridge adapter repair

2026-10-21 05:57 UTC. Supplements, and does not overwrite, the original 32-test independent review. Production geometry remains `fb9fe43`; tested helper-only repair is `be371502b9b760da8100f088513298999788016b`. The independent reviewer made no source/helper/test edits during this repair; the implementation owner was the single writer.

## Preserved initial failure

The first R38 direct-current aggregate recorded **1,853 tests, 1,817 passes and 36 failures**, exit 1. Of these, **24 nested five-bridge route failures plus their two B/S parent failures** were new and actionable. They were not historical identity guards. Forward approaches attempted the old center route and stopped near z=-231.39 while targeting `[0,-194.2]`, at the newly solid Taihemen imperial-stone approach. All three bridge lanes (-1.5, 0, 1.5), both directions, both 60/10 Hz and both B/S interior states were affected. The initial failure log is preserved with SHA-256 `acc8b4abd9c11964eeb77f6cada808d24291531954edd587e368180727d1a879`. Remaining pre-existing aggregate failures are classified separately by the parent release report.

## Root cause and legitimate scope

`continuousVisitorRoute({allBridges:true})` replaced the first stage with its five-bridge zigzag and the old stage endpoint. This discarded the newly source-derived Taihemen flank contact chain that ordinary central-axis traversal correctly retained. The physical controller exposed a stale test-route composition, not permission to traverse the carved stone.

The reviewed patch changes only the all-bridges route composition to retain `rows[0].points.slice(1)` after the bridge-north handoff. A new explicit assertion rejects future canonical suffix contacts south of z=-280 instead of silently discarding them. Original bridge X coordinates, lane offsets, alternating bridge crossing directions, stage names, starting point and endpoint are unchanged. No original r34 test name or assertion, collider, walkable, rescue behavior, speed, contact threshold, physical-waypoint driver or production source was changed. The owner added three structural route-retention tests; this reviewer did not rely on those instead of real traversal.

## Independent before/after route proof

The original helper was loaded from `git show bd1fb50:tests/lib/continuous-visitor-route.mjs`, with only `import.meta.url` replaced by its original file URL so its unchanged relative file references work from an external evaluation module. Current production route inputs remained unchanged.

For each of the three lanes:

- 98 original points become 104 points.
- The first 13 points, including all five bridge crossings and their lane offsets, remain byte-equivalent.
- Exactly six existing canonical Taihemen contacts are inserted: `[0,-233.974]`, `[4.187,-233.974]`, `[4.187,-230.974]`, `[4.187,-225.47]`, `[4.187,-222.97]`, `[0,-222.97]`.
- The remaining 85-point downstream suffix remains byte-equivalent, as do stage names and the previously acknowledged omitted Qianqingmen artificial apron.

This is a geometry-required detour, not deletion of bridge coverage or relaxation of a collision failure. A preliminary local before-route capture raced the owner's update and already contained the fixed suffix; it was not used as old evidence. The successful comparison explicitly uses the old committed helper as stated above.

## Independent physical rerun

Exact command:

`node --test --test-concurrency=1 --test-reporter=tap tests/r34-continuous-route.test.mjs`

Result: **98/98 passed**, exit 0, 83.970 seconds, zero skipped/cancelled. The original whole test file ran unchanged rather than a filtered or edited copy. It includes all **24** affected five-bridge variants: B/S × three lanes × forward/reverse × 60/10 Hz. Both parent tests passed. B uses the ordinary fallback interior; S loads actual checked Taihe, Qianqing and Kunning assets. Existing assertions still require one initial placement, all physical contact crossings, grounded exits, no rescue/unverified support, valid hall-floor trajectories, finite state and real sprint speed. All 854 source/data/test manifest entries checked unchanged after the run.

This remains CPU controller/geometry evidence with simulated DOM/canvas boundaries, not native browser, GPU/FPS or physical-phone acceptance. The original 32-test review and its hashes remain intact; this appendix establishes the subsequent helper repair and continuous-route results, not a retroactive all-green label for the initial aggregate.

## Evidence hashes

- Independent 98-test TAP: `86e997fd67e73e4845b339b624fa66b84b3922fcb949f33a5ac46fdcf10c81bb`.
- Independent 854-file manifest: `d9e2c3eb321ab1c40dafeb8bc6d2feef9666365b2c90aa27d6d1a68b0a46c37e`.
- Independent before/after route comparison JSON: `4312f64b7e0d0083d11b342a2261c64c47b00728e0b361cb8ff8d843600a6e85`.
- Repaired `tests/lib/continuous-visitor-route.mjs`: `ab06fd063a6fc2546c2abf0f4a1e3424b12cf6c1d031c7b08a8118aa7d06ba36`.
- Unchanged `tests/r34-continuous-route.test.mjs`: `071aabeeb4de677172036e0b163c06b673b61d6ce38016499e7aa711ee2b788b`.
