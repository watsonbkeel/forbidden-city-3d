# R58-A hall walking-beast count / curved-ridge placement partial

## Scope and status

- Baohe, FC-58A3300503: four upper corners × 9 and four lower corners × 9 walking-beast placeholders; eight retained rider cones counted separately.
- Zhonghe, FC-5FAA15AE5C: four single-eave corners × 7 walking-beast placeholders; four retained rider cones counted separately.
- PARTIAL / VERIFY_PENDING, not whole-roof or hall acceptance. No A37 denominator or accepted counter is changed.
- Taihe remains byte-exact. Its photographed ten-beast detail has not been assigned independently to upper/lower eaves, so neither layer is changed.

The official Baohe building text explicitly says nine on both eaves. The museum education PDF gives Zhonghe seven, and Zhonghe has only one eave level. Sources were personally opened from the reviewed private reference cache before implementation. The Baohe rear/gable photo displays both rows; the Zhonghe south-front view displays the single-eave row. The photo dates are unstated. Official photos/PDF are not product textures and are not copied into this change, public/, or a ZIP.

## Actual difference

The old high-detail Baohe roof generates 5 walking placeholders at each upper corner and 3 at each lower corner, 32 total. Zhonghe generates 3 per corner, 12 total. The default code is retained intact for every unconfigured caller.

A strict opt-in walkingBeastProfile ('baohe' or 'zhonghe') validates the existing hall type, dimensions (only <1e-12 arithmetic roundoff admitted; inputs are never rounded), layers, height/overhang, brackets and four-sided input. It cannot silently be reused for Taihe, Jiaotai or a resized generic roof. No full builder ownership is changed.

Within the explicit opt-in:

1. The existing roof planes, ridge TubeGeometry, upturned tip, rider position/geometry, finial, main-ridge chiwen and materials stay byte-exact.
2. The walking-beast centers are sampled by arc length on the EXACT CatmullRom path used by that existing TubeGeometry, stopping at the original eave control, not the appended tip. The sampled row is visibly curved.
3. Each simplified body has four lower contact corners solved against the actual submitted ridge triangles. This avoids the old idealized Y+r placement. The connected underside may sit slightly inside the curved ridge; no floating base corner is accepted. These are simplified body-base contacts, not anatomically sculpted feet.
4. The old model radius and animal size are retained. Center spacing is 1.15 × animal scale. A fit guard throws rather than clamping multiple beasts to the ridge's end. Actual body+head AABBs clear adjacent animals and the unchanged rider.
5. Each animal still has just a 12-triangle body plus a 12-triangle head. No extra legs, sculpture layers, independent material batches or new draw calls are added.

All distances, head/body form, scale and roof curvature here are existing-model fits. This is NOT a measured historical reconstruction or completion of nine/seven individually sculpted species. The old generic rider cone remains a cone, not a newly modelled phoenix rider. addHip had no independent terminal hip beast; that missing sculpture remains a recorded gap, not invented or counted as a walking animal.

## Actual submitted geometry budget

| Roof | Before full roof | After full roof | Net triangles | After walking animals | Walking-animal triangles | Roof draw calls |
|---|---:|---:|---:|---:|---:|---:|
| Baohe, both levels and all four corners | 12,196 | 13,156 | +960 | 72 | 1,728 | 7, unchanged |
| Zhonghe, all four corners | 6,740 | 7,124 | +384 | 28 | 672 | 5, unchanged |

Baohe has 864 animal triangles per level. The smallest actual adjacent center separation is 0.639434822 m across its generated rows; Zhonghe's is 0.834119760 m. These are model-space metrics, not survey claims. The high-detail production calls enable all listed counts. Explicit low-detail calls preserve the established omission policy: no animals/riders, zero generated rows, and metadata never reports those omitted figures as rendered.

## Evidence and verification

- reports/r58-hall-beasts/geometry-cpu/: actual before/after roof triangles, identical perspective cameras, CPU z-buffer PNGs, camera JSON and source hashes. Roof baseY is normalized to 0 in BOTH stages. No building-scale or view-dependent geometry is substituted.
- Three Baohe camera pairs: whole double roof, lower row, upper row. Two Zhonghe pairs: whole roof, corner row. Actual PNG pixels were inspected.
- CPU material base colors only, no texture images, browser/WebGL lighting, shadow, postprocessing or runtime acceptance. These are explicitly labelled geometry diagnostics, not game screenshots. The official image is deliberately not embedded into a redistributed triptych.
- tests/fixtures/r58-hall-beast-baseline.json was captured before production changes from bf7b399. It freezes all vertex/normal/UV/index bytes, material parameters, transforms and draw state for 24 representative legacy roofs. The Baohe/Zhonghe non-walking raw premerge meshes are separately frozen, including every old rider and ridge.
- tests/current-state/r58-hall-beasts.test.mjs: counts on each level/corner, default retention, actual mesh budget, 400 contact corners against real submitted ridge triangles and body vertices, curved path sampling, physical spacing/AABB checks, strict opt-in, low-detail semantics, repeated resource disposal, and a read-only consumer of already-created geometry before/after merge.
- reports/r58-hall-beasts/tdd-red.txt records the initial missing-profile failure. focused-tests.txt contains 40 passing focused tests. targeted-regression.txt records 97 tests: 95 passing and the two known baseline fixture failures described below, not a clean suite claim.
- tests/lib/r58-hall-beasts-world-check.mjs exports assertHallWalkingBeastsInWorld(W). It never builds a world. It checks exactly two source-scoped records and all 400 merged body-contact vertices in an already-built W.scene. Owner full-world execution remains pending until integration.

## Owner integration

This worktree edits RoofBuilder.js and its new dedicated helper only in production. PalaceBuilder.js and SquareHalls.js are unchanged here.

Apply reports/r58-hall-beasts/HOOKUP.patch as the owner. It adds the two explicit profile arguments and two parent metadata preservation statements. The latter survive PalaceBuilder.finish's material merge; no new scene object is created. The patch was checked with git apply --check and rehearsed exactly in memory against actual PalaceBuilder/SquareHalls fragments, not applied to owner files in this worker's tree. That rehearsal verifies unchanged hall physics and every non-roof mesh for Baohe, Zhonghe, Taihe and Jiaotai; the latter two roof outputs also remain exact.

Then run the existing-world consumer on the owner's one shared retained W. Retain the existing R21/R24 Baohe and R55 Zhonghe interior/navigation checks. No collider, walkable, furniture, nameboard, coordinate or interior code is modified in this batch.

## Unfinished work / do not mark accepted

- Species-specific anatomy and order, faithful rider/phoenix and missing terminal corner beasts.
- Runtime before/after front/side/rear checks in an authorized working browser. The parent reports the existing cloud WebGL blocker; no local Chromium, denied-path workaround or browser bypass was attempted.
- Whole-hall exterior/interior acceptance, other three-hall source gaps and all other A37 requirements.
- No build, full-suite, full-world construction, main change, remote push or Pages publication was run by this worker.

## Baseline regression caveat

The expanded targeted run (97 tests: 95 pass, 2 fail) has two existing failures relative to bf7b399, both in the old Wumen full-tree retention fixture: wumen-ascent-retention.mjs expects 41 root children but R58 first-batch components now give 42. Replacing only this worker's RoofBuilder temporarily with exact bf7b399 code reproduces both failures (48 Wumen tests: 46 pass, 2 fail), after which the current file was restored. This does not claim the original R57 baseline was failing. The owner confirmed the historical whole-tree fixture requires versioned inheritance after R58's first batch. No expected count, scope or denominator was relaxed here. See wumen-baseline-reproduction.txt and targeted-regression.txt.
