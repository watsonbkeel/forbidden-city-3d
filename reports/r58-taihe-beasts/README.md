# R58-A Taihe walking-beast count correction

Status: **PARTIAL_VERIFY_PENDING**, count-only. No browser, species sculpture, full-roof fidelity, A37 completion, release or deployment acceptance.

## Result

- Taihe Hall FC-A478209231 now has 10 walking placeholders per corner on the upper level and 10 on the lower level: 8 actual rows, 80 body meshes + 80 head meshes before material merge. The 8 original rider cones remain separate and byte-exact.
- Previous model: upper 5 and lower 3 per corner, 32 total. Replacement: 80 total. No old walking boxes are retained in addition to the replacement.
- Actual roof triangles: 12,964 → 14,116 (+1,152 = 48 × 24). Final material batches/draws: 6 → 6.
- All 320 actual Taihe base corners contact submitted hip-ridge triangles. Adjacent actual body/head AABBs and the retained riders do not overlap. Minimum adjacent center distance is 0.9391698947990752 model units.
- Submitted-ridge CatmullRom sampling, base fitting, simplified bodies/heads and legacy rider placement are unchanged. RoofBuilder.js is byte-identical to the integration base.

## Source and scope

The Palace Museum's Huang Ximing article, “太和殿行什相关问题讨论,” 2014(2), printed p.142 separately reports 40 walking beasts and 4 riders for each eave level. Thus 40/4 = 10 on each level is not inferred from unregistered symmetry. The implementation worker viewed the source paragraph's private raster crop. See SOURCES.json for exact public URLs, PDF SHA-256, page and crop coordinates.

The author cites the Kangxi rebuilding account; the original archival volume was not independently opened. This resolves the prior documentary level-allocation uncertainty only, not a current photographic survey. Official PDF and source pixels are NOT included in Git, reports, public assets, ZIPs, or CPU images.

## Production changes

Only two production files:

1. src/scene/palace/special/HallWalkingBeasts.js: explicit Taihe profile with exact retained inputs (wudian, 63.6 × 37.6, two layers, four sides, brackets); no height/overhang/internal override. Non-string selector coercion now fails closed. Existing valid profiles and undefined/default behavior are retained.
2. src/scene/PalaceBuilder.js: Taihe-only option in the existing buildHall roof call. The existing metadata collector is reused.

No roof geometry/profile algorithm, base dimensions, other hall option, collision/support, character, dependency, main, Pages or account change.

## Verification

124 bounded tests pass across:

    node --test --test-concurrency=1 tests/current-state/r58-taihe-beasts.test.mjs tests/current-state/r58-hall-beasts.test.mjs tests/current-state/square-halls.test.mjs tests/current-state/exact-roof-material-batching.test.mjs

- 24 historical no-profile roof snapshots remain byte-exact.
- Taihe non-walking premerge mesh/material/transform signature, including all riders/ridges/tiles, matches the frozen original signature after excluding only old versus replacement animal bodies/heads.
- Baohe and Zhonghe already-profiled complete roofs and metadata match c9a82aaa8316954e80a03aa934cd8e745065322e.
- Actual isolated Taihe, Baohe, Zhonghe, Jiaotai and Qianqing halls retain all nonroof mesh/material bytes and physics. All four non-target roofs remain byte-exact. Taihe collider count remains 111; collision/support hashes remain exact.
- Positive real caller arithmetic and finite baseY offsets, and negative type/dimension/layer/profile cases pass. Invalid profile selectors fail before material creation.
- Repeated Taihe construction/merge/disposal disposes each temporary/final geometry and owned material exactly once; library materials are not disposed by the roof owner.
- The successor pure-W test measures 720 actual body/ridge contacts across three existing roof fragments both before and after real merge, including Taihe's 320. Removing actual support triangles while preserving actual body foot vertices causes it to fail.

Independent read-only review found no blocking production issue, reproduced 19/19 focused tests, and checked frozen fixture source hashes against c9a82aa. Its complete-triangle draw-range hardening was applied to the test consumer.

Full-world integration, the owner's cumulative checks and browser acceptance remain pending. No whole world, full suite, app build, browser or publication was run here.

## Owner's existing-world consumer

Import assertThreeHallWalkingBeastsInWorld from tests/lib/r58-three-hall-beasts-world-check.mjs and call assertThreeHallWalkingBeastsInWorld(W) with the ONE already-built W. Requires W.scene and W.cm. It constructs no scene/world, adds no geometry, changes no collider, and does not remove or hide Taihe.

The returned halls contain rows, animals, riders, actualMergedFootContacts and actualMergedRidgeTriangleContacts. Expected contact totals: Taihe 320, Baohe 288, Zhonghe 112; aggregate 720. It requires exactly three distinct reviewed records, all four corners per level, actual submitted base vertices, and another actual same-material triangle supporting each foot, excluding the walking body's own vertex-touching faces. After material merge, ridge provenance and independent head/rider mesh identity are no longer retained; the companion premerge and byte-retention tests establish those identities/counts. The consumer does not claim to independently recount merged heads/riders.

The old tests/lib/r58-hall-beasts-world-check.mjs remains frozen and expects exactly two records. Do not run it on the new three-profile W, and do not strip Taihe to make it pass. The historical two-hall hookup rehearsal's Taihe assertion now recognizes that its old toggle removes the shared metadata collector but leaves the independently installed Taihe geometry on both sides; its geometry checks remain intact.

## Evidence and reproduction

- geometry-cpu/: 6 personally viewed actual-geometry CPU images, same-camera before/after pairs for overview, upper row and lower row; 6 compressed triangle datasets, 6 camera sidecars and MANIFEST.json. Before uses the unchanged legacy no-profile path, not a generated source photograph. After uses the actual Taihe profile. Both normalize roof baseY to 0.
- CPU lighting and material base colors only: no textures, GPU, shadows, postprocessing or runtime acceptance. Every image is labeled accordingly.
- scripts/r58-taihe-beasts/export-diagnostic.mjs exports actual production roof geometry. Render its gzip outputs with scripts/r58-hall-beasts/raster-diagnostic.py.
- scripts/r58-taihe-beasts/capture-baseline.mjs regenerates the frozen small fixture from exact c9a82aa Git source, not current HEAD.
- count-red.txt and hookup-and-selector-red.txt are expected pre-fix TDD failures. focused-tests.txt and targeted-tests.txt record final passing checks.
- ARTIFACTS.json records hashes of this packet and implementation/test sources. No third-party source image is mislabeled as a model view or vice versa.
