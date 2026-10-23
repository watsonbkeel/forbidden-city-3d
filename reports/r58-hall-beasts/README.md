# R58-A: Baohe / Zhonghe walking-beast count partial

Status: PARTIAL_VERIFY_PENDING. No browser acceptance, A37 completion, species sculpting, release or deployment claimed.

## Delivered

- Baohe: 9 walking placeholders per corner on BOTH levels, 72 total; 8 original rider cones retained separately.
- Zhonghe: 7 per corner, 28 total; 4 original rider cones retained separately.
- Actual CatmullRom ridge arc stations, non-overlapping body/head bounds, 400 lower-base contact corners seated on submitted ridge triangles.
- Per walking placeholder: 24 triangles. Whole roofs: Baohe 12,196 → 13,156 (+960), Zhonghe 6,740 → 7,124 (+384). Draw calls stay 7 / 5.
- Default, Taihe, and other roof geometry/material bytes protected by 24 baseline snapshots.
- 40 focused tests pass. Expanded targeted run: 97 tests, 95 pass, 2 baseline Wumen fixture failures. Exact bf7b399 RoofBuilder replacement reproduces those two. R58 first-batch Wumen additions made a historical 41-child fixture stale at 42; this is NOT a claim that original R57 was already red. No assertion was loosened.
- Owner patch rehearsed exactly in memory with real Baohe/Zhonghe/Taihe/Jiaotai hall inputs; all hall physics and non-roof meshes retained, non-target roofs retained. Owner files remain unedited on this branch.

## Owner actions

1. Cherry-pick this isolated branch's implementation commit(s), based on bf7b399.
2. Apply HOOKUP.patch as the sole PalaceBuilder/SquareHalls owner. Do not mark the unhooked branch as live integration.
3. Import assertHallWalkingBeastsInWorld from tests/lib/r58-hall-beasts-world-check.mjs and call it with the ONE already-created W. It is pure/read-only and checks metadata + 400 actual merged base vertices. It does not build a world.
4. Keep full-world integration/navigation checks and authorized WebGL acceptance pending. No local Chromium or blocked-route retries occurred here.

## Reproduce bounded checks

    node --test tests/current-state/r58-hall-beasts.test.mjs
    node --test --test-concurrency=1 tests/current-state/r58-hall-beasts.test.mjs tests/current-state/wumen-vertical-profile.test.mjs tests/current-state/square-halls.test.mjs
    git apply --check reports/r58-hall-beasts/HOOKUP.patch

No build, full suite or full-world creation was run by this worker.

## Evidence

- geometry-cpu/: 10 real-geometry CPU images, 10 compressed triangle datasets, 10 camera sidecars, MANIFEST and artifact hashes. Paired cameras are identical; roof baseY is normalized to zero in both stages. Before is the default no-profile branch, frozen byte-exact to bf7b399. Textures and GPU effects are omitted; labels explicitly reject game/WebGL acceptance.
- docs/photo-fidelity/EVIDENCE/r58-hall-beasts/IMPLEMENTATION.md: exact design, contact limitations, budget, integration and incomplete scope.
- SOURCES.json beside it: official text/education counts and personally viewed private source-photo references. No official source image or PDF is redistributed.
- focused-tests.txt, targeted-regression.txt, wumen-baseline-reproduction.txt: actual command output. Three *-red.txt logs preserve test-driven failures followed by fixes, not unresolved current failures.

Still simplified box body/head shapes and cone riders. No species identities/order, phoenix sculpture, missing terminal beast, complete roof topology or current-access state claimed.

Test logs preserve observed results; trailing whitespace only is normalized for repository whitespace checks.
