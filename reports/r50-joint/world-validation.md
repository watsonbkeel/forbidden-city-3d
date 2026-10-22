# R50 Kit 07 + delivered R49B: actual joint-world verification

## Result and boundaries

The joint successor was freshly built and checked, not inferred from earlier R50 caches. The independent inherited body suite passed **57/57**, canopy standing/jump/retained-column checks passed **2/2**, and current-world character binding resolved **38/38 required actors** in each of three adapters, with **148 route samples**. A later evidence-integrity/source-freeze run passed **12/12**; these 12 are not additional full-world scenario runs.

The exact actual-geometry sightline comparison found **zero changed ray records** across **684 rays per architecture**, using two genuinely different architectural worlds. These are CPU geometry checks, not screenshot, texture legibility, GPU timing, aesthetic or user-acceptance claims. No R49C source is included. No full historical repository-suite green claim is made.

## Explicit frozen source upgrade

- Active architectural baseline: `95db2af664ff9cb6ea405d0ba389ef428dfd7d6c`, the delivered R49B commit.
- Expected SHA-256 values came from `git show 95db2af:<path>`, not from current working files.
- Original 182-file manifest is retained byte for byte as `data/characters/world-source-freeze-r49.json`; SHA-256 `4f5c2b3d8dd318cbaeee72abd8fb6fa4fd96ba32c43761843e13397e127284d3`.
- Active manifest contains exactly **185** paths: the original 182 plus `CanopyRoofSurfaceJoint.js`, `HorizontalNameboardAtlas.js`, and `SourceGuidedNameboardMounts.js`. Its SHA-256 is `d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0`.
- All **114** paths delivered in R49B, including its tests and evidence, match the original Git blobs exactly. The provenance report records both blob IDs for every path.
- The original per-file hash assertion in `tests/p3c-data.test.mjs` was retained; its baseline guard was explicitly advanced and original-manifest preservation was added. The new independent freeze test checks exact counts, source Git blobs and current bytes.
- The old R49-only inverse/source guard is **not applicable** to the explicit R49B successor. It was neither changed nor counted as passed. The delivered, already-reviewed R49B inverse guard was run unchanged.

## Actual body and support

The unchanged `tests/r49b-inherited-world-body.test.mjs` ran every one of its original 57 tests: 56 route/mode cases and the negative-control lookalike. All 56 routes arrived, with zero rescue. The actual geometry scan covered 599 meshes and 748,066 relevant triangles, with 44,180 recorded physical frames and 58,648 accepted substeps. The exact inherited support-triangle and reviewed inverse-source provenance guards were retained.

The unchanged `tests/r49b-canopy-player-clearance.test.mjs` checked 永和宫 and 重华宫 at standing, half-apex and full jump apex. Their real four-column blocking remains; the central approach and complete overhead/frame clearance passed. No collision module or building source was edited by the character integration.

## Fresh 38 bindings and 148 route samples

`scripts/p3c-joint-world-bindings.mjs` imports the existing comparator without invoking its legacy report-writing CLI. It builds the actual current `buildCharacterWorld` and writes only new `world-*` artifacts. The old tree and old `reports/r50/world-bindings.md` / `reports/r50-followup/world-incremental-review.json.gz` are read only.

- Frozen, synchronous and incremental adapter modes each resolved 38 ready actors.
- Actual final Kit 07 seated contact metadata matched the original contact contract.
- Each adapter made 954 binding support probes.
- **796 independent complete THREE raycasts** verified the exact current mesh owner, hit position, upward normal and material side/group/draw range for deduplicated actual support probes.
- The 104-sample west-lane route and 44-sample Yongshou route retained all sample values and outcomes. Their production continuous collision validation remains active, not replaced by clear endpoints or bounding-box support claims.
- All 38 binding positions match the original full-precision R50 cache at <1e-10 m; the original rounded Markdown table agrees at <1e-6 m. Semantic bindings and all 148 route samples are unchanged.
- Player collider/walkable arrays and source material side/group/draw ranges remained unchanged during binding.

Important distinction: the three adapters all run on **one new R49B world**. That comparison establishes algorithm equivalence, **not an R49-vs-R49B architectural comparison**. Prior-cache matching is separately labelled; fresh exact-owner raycasts establish current-world support. Scene enumeration mesh IDs are retained and resolved for same-world comparison; only cross-world cache comparison omits opaque enumeration IDs.

## Actual character sightlines before and after R49B

`scripts/p3c-joint-character-sightlines.mjs` separately built the original R49 architectural tree and current R49B tree, first verifying their 182/185 frozen source sets. Both used the identical final Kit 07 SHA `cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`, unit scale, actual `PatrolController` positions and production `characterEnvironmentMotion` / CPU deformation at t=0. Patrol members were not incorrectly stacked at the path origin.

For all 38 required characters, a 3 m near-front and 7 m medium-front camera targeted nine real front-facing character-triangle centroids across lower/mid/upper body bands. Every visible static/west-six mesh was eligible for full THREE triangle raycasting with actual material sides; boxes were only acceleration, never pass evidence. This includes the six domestic actors at the R49B-adjusted 储秀宫, 翊坤宫 and 永寿宫 nameboards.

All 684 detailed ray records, including first actual hit owner, triangle, position and distance, are identical before and after. R49B adds no obstruction to this sampled actor-facing view set. The data does **not** claim every character is visible from every chosen camera:

- 69/76 camera views have all nine sampled character targets visible.
- Both front cameras for west-lane guards 02 and 03 are blocked by guard 01 in the existing straight-on formation.
- Both front cameras for the Chuxiu consort are blocked by the existing maid position.
- The Chuxiu maid's medium-front camera intersects existing Chuxiu glass. Geometry intersection is conservatively counted as obstruction; glass alpha/texture compositing is not assessed.

These seven existing blocked views are unchanged, not omitted or relabelled as successful composition. Camera walkability, textures, raster review, animation-wide visibility and GPU performance are outside this check.

## Artifacts and reproduction

`world-joint-summary.json` is the concise machine-readable entry point and records artifact hashes. Full bindings are in `world-bindings-38-148.json.gz`; per-actor ID and `binding.position` are retained. Body details are in `world-body-57.json.gz`; actual sightline records are in `world-sightlines-r49.json.gz` and `world-sightlines-r49b.json.gz`. Exact commands and Node/default-heap information are in `world-run-environment.json`.

Heavy world commands were run serially, using the default Node heap, not a 384 MiB cap. To regenerate evidence, run the unchanged body and canopy commands, then the new binding script, then the two sightline commands serially. Gzip the body JSON before running the summary script. Finally:

```sh
node scripts/p3c-joint-summarize-world.mjs
node --test --test-concurrency=1 tests/p3c-data.test.mjs tests/p3c-joint-world-freeze.test.mjs tests/p3c-joint-world-evidence.test.mjs
```

The last command verifies recorded evidence and current sources; it does not by itself rebuild the world. Do not confuse it with the preceding fresh full-world runs.
