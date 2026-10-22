# Kit07 budget verification after the exact Benren depth patch

**23/23 passed; 22 runtime submissions; no source changed during the run.**
The previous green07 report remains untouched. This report does not claim a
fresh full-world binding rebuild after the Benren change.

## Verified immutable source chain

- Active baseline: `ad64a922a8e2885fb42e1a6c64806ba8646a3b8c`, whose direct Git
  parent is `95db2af664ff9cb6ea405d0ba389ef428dfd7d6c`.
- Active 185-file manifest SHA: `4999fb8aac4ee69839f22406683aa53a8e123ceb68ba5129196f494b40bf3aa3`.
- Saved R49B 185-file manifest SHA: `d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0`.
- Inheritance proof: `reports/r50-joint/world-benren-inheritance.json`, SHA
  `49bf9fd8378dd7a0f05ffba4137ae6311407c7919cb9a42f6dfc97610cea2567`.
- The old fresh 38/148 report retains SHA
  `16b97ff4b4cfabeb6547db72dff431c18f79eb3dd84ebb770f040805bca95900`.
  Every inherited artifact is checked both against its recorded SHA and its
  original bytes in Git commit `289006b`.

The test verifies all 185 active source hashes and the identical manifest path
sets. Exactly one production path differs:
`src/scene/palace/special/SourceGuidedNameboardMounts.js`.
Its previous/current Git blob hashes and exact Git diff hash must agree with
the pinned proof and active manifest. No unknown change or hash mismatch is
ignored. Without the specific inheritance proof, the old fresh-world hash no
longer matches the active world and correctly fails; that red run is preserved
in `.green07-benren.red.tap`.

The local proof must also pass actual geometry/physics evidence: non-plaque
geometry, colliders, walkables, rooms, regions and map items are identical;
face and its own frame retain x/y, rotation, scale and geometry, moving only
local z by -0.05 m. All **684 sightline + 796 support + 148 route = 1,628**
actual ray rows must have zero hits before and after. These measured local
results support inheritance of the original 38/148 bindings, not relabeling
those old bindings as newly rebuilt.

## Budget result

Final Kit07 SHA remains
`cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`.
All selected actor and real batch counts remain identical to green07:

- Formal 38 near-case desktop: 38 visible, LOD 2/36/0, 59,473 triangles, 10 batches.
- Synthetic 96 clustered desktop: 64 visible, LOD 2/62/0, 94,599 triangles, 10 batches.
- Synthetic 96 mixed desktop: 64 visible, LOD 2/50/12, 79,472 triangles, 15 batches.
- Mobile clustered: 32 visible, near 0, 42,874 triangles, 9 batches.
- Mobile mixed: 32 visible, near 0, 35,060 triangles, 12 batches.

All scenarios meet desktop 64 / 180,000 / 60 / near 2 and mobile
32 / 90,000 / 30 / near 0. Core court roles and the emperor remain;
the route female retains hanging arms during moving and paused samples.
No required flag, actor registry, production source or rollout gate was edited.

## Reproduce

`R50_WRITE_BUDGET_REPORT=1 R50_BUDGET_REPORT_SUFFIX=green07-benren R50_FRESH_BINDINGS=reports/r50-joint/world-bindings-38-148.json.gz R50_WORLD_INHERITANCE=reports/r50-joint/world-benren-inheritance.json node --test --test-reporter=tap tests/p3c-female-render-budget.test.mjs`

Full accounting and exact chain metadata are in `.green07-benren.json`;
23 passing checks are in `.green07-benren.tap`. This remains lightweight CPU
geometry/submission evidence only, not GPU, FPS, a fresh world rebuild or
mobile-device performance evidence.
