# Benren depth-only successor: bounded inheritance

This note extends, rather than rewrites, the fresh R49B joint-world evidence frozen in commit `289006b`. The active architectural baseline is now `ad64a922a8e2885fb42e1a6c64806ba8646a3b8c`, whose direct parent is delivered R49B `95db2af664ff9cb6ea405d0ba389ef428dfd7d6c`.

## Explicit version and source chain

The original active 185-file R49B manifest is retained byte for byte in `data/characters/world-source-freeze-r49b.json`, SHA-256 `d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0`. The earlier 182-file R49 manifest is also retained unchanged.

The new active manifest contains the same 185 paths, with every expectation read from frozen ad64 Git blobs. Its SHA-256 is `4999fb8aac4ee69839f22406683aa53a8e123ceb68ba5129196f494b40bf3aa3`. Exactly one production file differs from R49B: `src/scene/palace/special/SourceGuidedNameboardMounts.js`. All other 184 source hashes remain identical.

The accepted Git patch has four added and two removed source lines: a Benren-specific depth-only source entry and comment, plus source-URL and dimensions fallback handling. It is **not represented as a one-line numeric edit**. The actual geometric result is a 0.05 m movement in local −Z of the registered 本仁殿 face and its own complete backing, with all x/y, rotation, scale and dimensions preserved. The commit also carries three exact validation/reference files. No R49C or 景运 geometry is included.

## What was freshly checked, and what is inherited

The original `tests/r49d-benren-depth.test.mjs` passed **8/8** without edits. Its current local snapshots match the patch's frozen R49B reference: non-plaque geometry, collisions, walkables, rooms, regions and map items are retained. Its other scope rows are unchanged. The complete plaque frame clears the beam; restoring the old depth reproduces the three old structural intersections. Six rays verify the approximately 15 mm retained beam gap, and five standing-eye front/oblique 5×5 ray grids retain visibility. Height, size and historical support remain explicitly unverified, not silently approved.

The new `world-benren-inheritance.json` records a separate, limited component-interaction proof:

- 684 earlier near/medium character sight rays were replayed against the actual before/after Benren face and backing triangles.
- 796 earlier independent actual support-owner rays were replayed against those components.
- 148 earlier route-surface rays were replayed against those components.
- All **1,628 rays per component state** have zero intersections. Actual THREE triangle intersections are used; component bounds are not the pass criterion.
- Both states use the actual current mesh geometry. The old state's transform is restored to the immutable R49B snapshot, and current geometry/non-plaque/collision hashes are checked against that snapshot.

The original 38-ready/148-route/57-body/2-canopy whole-world results are therefore **inherited through this strict scoped patch**, not rerun and not relabelled as new fresh world results. Their exact files and SHA-256 values remain unchanged and are linked in the inheritance report. The earlier seven sampled blocked character views remain a disclosed limitation. This scoped check makes no GPU, texture/raster, walkable-camera, animation-wide or full historical-suite claim.

## Reproduction

No whole-world rerun is needed for this bounded chain. Run the original local test and the new scoped script, then the evidence and source-chain tests:

```sh
node --test --test-concurrency=1 tests/r49d-benren-depth.test.mjs
node scripts/p3c-joint-benren-inheritance.mjs
node --test --test-concurrency=1 tests/p3c-data.test.mjs tests/p3c-joint-world-freeze.test.mjs tests/p3c-joint-world-evidence.test.mjs tests/p3c-joint-benren-inheritance.test.mjs
```

The new report is scoped to its explicit patch and preserved source/report hashes. It must not be reused for any later source change without a new proof.

The earlier R49/R49B capture scripts now explicitly refuse a later active architectural baseline, preventing the Benren successor from overwriting its predecessor evidence or being mislabeled as that earlier fresh run. To reproduce the original full capture, use the frozen predecessor commit/tree; use the bounded script above for this successor.
