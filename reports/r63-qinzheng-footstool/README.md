# R63 F: Qinzheng footstool, bounded photo-supported addition

## Scope and source

- Baseline: `f87342d7e1506713df4a6877943eb377e8299593`.
- Source actually viewed: https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg
- Source image SHA-256: `287f93b8f36d80dd3087c40db7d2896e4fc09c73145d921165d4b39f55c485af`.
- The official image is not copied into this checkout or evidence output. URL date 2026-04-30 is not a known photography date.
- The photo clearly supports one very low dark rectangular footstool centered in front of the existing kang. Only a plain top and four grounded feet are added. No ornament, wood-grain claim, carving, rug, vessels, side floor stands, or unseen joinery are invented.
- Width 0.90 m fits the photographed approximate 0.27 stool/kang ratio against the already-fitted 3.30 m kang. Height 0.14 m, depth 0.54 m, top thickness 0.045 m and feet are reversible unmeasured fits, not survey dimensions. No building, old furniture, or photo is rescaled.

## Exact additive scope

New source: `src/scene/palace/special/QinzhengFootstool.js`.

- +5 closed box meshes, +60 nondegenerate triangles, +1 owned dark-wood material.
- +5 collision boxes, each matching one actual visible solid, +1 exact tabletop support with `rescue:false`.
- No whole-footstool filled collider hides the gaps under the tabletop. Four feet meet the underside at 0.715 m and reach the B floor at 0.62 m. Top is 0.76 m.
- All 272 prior B meshes / 11,804 triangles / 144 colliders / 13 supports retain their recorded geometry/material and physical hashes. Protected source hashes include the entire R53 module, kit, controls, collision engine, actual Yangxin S GLB/config, InteriorLoader and CharacterKit.
- `RemainingResidentialHalls.js` is deliberately not changed in this worker branch. The parent owns the narrow integration hook. Actors, routes, R53 and S remain unchanged.

## Grounding and retained floor caveat

The consumer raycasts actual retained floor triangles at all four feet in each layer. B is 0.62 m and loaded S is approximately 0.66733711809 m. Feet reach B; the old S floor overlaps their lower approximately 0.047337 m, leaving exposed feet to the tabletop underside. Neither B nor S has a floating tabletop or unsupported foot. This is disclosed compatibility overlap, not a claimed perfectly surveyed join.

The original visitor support below these floors remains 0.60 m, unchanged. Stool ascent reaches the actual 0.76 m tabletop without rescue, and descent returns to that original support. This change does not silently repair or replace the prior floor/support relationship.

## Owner hook

Import `buildQinzhengFootstool` from `./QinzhengFootstool.js`. Immediately after the existing Yangxin-only `buildYangxinWestWarmRooms(kit,item,built.f)` call, call `buildQinzhengFootstool(kit,item,built.f)` under the same profile guard. Preserve R53's source verbatim.

When the owner builds `built.f.userData.structure`, copy `qinzhengFootstool: built.f.userData.qinzhengFootstool` into that structure so ordinary `CourtKit.finish()` architecture provenance preserves it. Do not add an InteriorLoader hook, asset replacement, or new actor placement.

## Pure existing-world consumer

`tests/lib/r63-qinzheng-footstool-world-check.mjs` exports:

- `assertQinzhengFootstoolInWorld(W, { layer: 'B', interiorLoader })`.
- `assertQinzhengFootstoolInWorld(W, { layer: 'S', interiorLoader })`.
- `replayQinzhengFootstoolInWorld(t, W, { fps, sprint, backward, route: 'step' | 'retained' })`.

`interiorLoader` defaults to `W.loader`. For S, pass the owner's actual loader already holding the same scene group. The consumer never builds a fixture, loads or unloads an interior, inserts geometry, or changes physics. S additionally requires the same actual InteriorLoader group, 11 visible meshes / 8,720 triangles, and 10 interior-tag colliders. B requires Yangxin S to be absent. The actual loaded asset additionally supplies its original 1 WALK surface.

Use after B build, actual S load/fade, S unload, and west-six re-entry. It works with raw or actual `CourtKit.finish()` merged geometry, including per-face material resolution. Float32 merged world coordinates use a documented 0.00002 m tolerance; all pre-existing byte-retention hashes remain exact.

## Verification

- `node --test tests/r63-qinzheng-footstool.test.mjs`: 43/43 passed.
- 32 actual controller combinations: B/S × 10/60 Hz × W/S × walk/sprint × centered stool traverse/retained room route. Every route arrives, actual stool ascent and descent are observed, and none uses rescue or unverified ground. Sprint traversals reach more than 11 m/s, not merely a requested-but-unused sprint flag.
- Four-foot triangle bounds, ground rays, underside contact, top ray/support equality, finite vertices/normals, exact visible-solid collision, lowered body rejection, duplicate/wrong-target rejection, and owned-resource disposal checks pass.
- Three actual S load/unload cycles, in-flight cancellation/reload and raw/merged B/S consumers pass.
- Retained R53 tests: 26/26 passed in the three existing Yangxin room/form/streaming suites. This also exercised the existing west-six unload/re-entry test; no full-world or browser run was performed.
- `git diff --check` and JS syntax checks passed.
- This worker did not run the 106-file aggregate current-state suite or a cumulative build. Those remain the integrating owner's checks; the helper is not wired into production by this branch.

## CPU evidence

Eight PNG diagnostics under `evidence/`: B/S × front/contact view × before/after. All are actual bounded geometry with identical camera and palette per pair, not GPU screenshots or historical visual acceptance. Before excludes only the 60 added faces after requiring the rest of the builder's geometry/material/collision/support hashes to match the recorded pre-hook baseline. All source meshes, including actual decoded S, are kept; the source photo is not embedded.

Front and close contact views were inspected. The low top reads as a stool rather than a floating slat, feet remain exposed in both B and S, and no tall object is added to the retained x=14 visitor route. Flat-color CPU diagnostics do not reproduce textures, PBR lighting or shadows.

Machine evidence: `physical-proof.json`, `evidence/proof.json`, `green.tap`, `retained-r53.tap`. Initial missing-helper red result is retained in `red.tap`.

## QA follow-up: baseline isolation after owner integration

The first fixture's candidate=false flag still called the live owner. Once the parent integrated the approved hook, that flag also received a footstool. The retained-byte check and filtered before images remained valid, but candidate=false did not mean an independently built baseline.

The fixture now imports exact pre-hook owner bytes from `tests/fixtures/r63-qinzheng-footstool/RemainingResidentialHalls.baseline.js.txt`, SHA-256 `0e9c32f33c9df590dba98f8fc32990bbb8f601f7d17cc80b9013ec7d28bfeba8`. Those bytes come directly from f87342d and are verified before use; only dependency specifiers are resolved for a test-only data module. candidate=false is asserted against the complete unfiltered baseline snapshot and contains no stool metadata or meshes. candidate=true continues to call the real current owner. An owner that imports the helper but omits the actual invocation now fails instead of being concealed by the unit-fixture fallback.

The new baseline regression was observed red using the parent's real integrated owner, then all 43 tests passed both in the unhooked worker checkout and using that actual integrated owner by read-only module resolution. Integration proof records `ownerHookApplied:true` and `fixtureFallbackApplied:false`. A separate negative witness omitting the invocation only in a test loader confirms fail-fast behavior. No shared production file was edited and no full-world/build run was added. See `baseline-hook-red.tap`, `integrated-owner-green.tap` and `baseline-hook-proof.json`.
