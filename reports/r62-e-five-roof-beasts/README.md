# R62-E: two actual low-detail five-beast rows

Base: R61 `6b396800`. Scope: only `east-six/items/2` 景仁宫正殿 and `east-six/items/16` 钟粹宫正殿. Implementation is one new helper, tests and this evidence. No RoofBuilder, CourtKit, EastResidentialFacades or shared dispatch changes in this commit. Owner must apply the hookup below.

## What changed

- Each actual production `detail:'low'` roof starts with **0 walking beasts and 0 riders**, not four. `RoofBuilder.addHip` returns immediately after creating the low ridge. Its high-detail generic four-beast branch is not the baseline.
- Four real existing hips per hall receive five generic low-detail walking body/head forms plus one separate cone rider per corner: **20 animals + 4 separate riders per hall**, 40 + 8 across the two targets.
- Added submitted budget is exactly **512 triangles per hall**: 20 × 24 for bodies/heads + 4 × 8 for four-sided cones after filtering only exactly zero-area index triples. All surviving cone vertices, normal/UV attributes and winding are unchanged. Two targets add 1,024 triangles total. No budget limit is raised.
- `CourtKit.adopt` has already replaced the roof's private glaze material with shared `kit.ridge`. All additions reuse that exact object. There is one temporary addition batch per hall; the final material merge adds no material batch or unique material.
- Neither existing roof geometry nor other hall geometry/material, textures, nameboards, navigation, rooms, collision or walkables is changed. Before/after old-object signatures are exact. All bounds/geometry remain roof-local and small, never high-air placeholder boxes.

## Placement and fail-closed behavior

`buildRoof.finalize` merges away `TubeGeometry.parameters`. The helper reads the original **actual** merged non-indexed ridge triangles and their UV rings, not a guessed roof equation. Strict R61 position/normal/UV fingerprints admit only the reviewed low ridge stream, whose first four 192-vertex segments are the real 8-by-4 tube hips. Ring averages recover the submitted piecewise centerline. Stations start beyond the retained tip extension and advance in true submitted centerline distance. Each base vertex is ray-tested only against its own hip's original triangles. Head direction faces its own eave corner. Actual adjacent full body/head or rider AABBs do not intersect.

Exact target identity/envelope, original unrotated unmirrored transforms, low ridge topology/bytes, and one-time use are required. Dimension changes, flips, translations, high-detail or other ridge changes fail before adding geometry. Non-target indexes or zones are no-ops. No entire hall mesh count is frozen, allowing independent window/furniture postprocessing.

## Evidence and boundaries

`source-evidence.json` records the museum-specific pages, short count excerpts, and hashes/URLs of the four actually viewed official photos. Those source images and source HTML stay outside the repository. Own-hall photos confirm corner-row relationship, while five-count comes from each hall's own body text. No adjacent hall's image supplies a target count.

The forms deliberately reuse the existing low-detail visual vocabulary. **Species-specific carving, rider human/animal anatomy, terminal hip beasts, chiwen, exact historical dimensions, survey accuracy and browser/GPU acceptance remain incomplete.** Status remains `PARTIAL_VERIFY_PENDING`.

`cpu/` contains actual production two-hall before/after mesh exports (gzip) and eight same-camera geometry diagnostic PNGs: whole hall and near corner for each target. Color categories are a flat diagnostic palette, NOT original textures. Cameras are elevated inspection cameras, not claimed walkable/player viewpoints. No reference photo pixels or substitute model geometry are embedded. Source textures are untouched.

## Verification

- `tdd-red.txt`: original missing helper produces expected missing-geometry/count failures.
- `focused-tests.txt`: 13 focused checks cover actual low counts, frozen original roof signatures, exact remaining meshes/materials/nav/collision, every corner's foot vertices on corresponding original triangles, real merged vertices, outward orientation, nonintersection, no-op/non-target and drift rejection, repeat rejection, resource disposal, and pure existing-world consumer.
- `consumer-memory-red.txt`: earlier vertex-map design fails the 300,000-vertex whole-zone memory-bound regression; final streaming consumer passes.
- `targeted-regression.txt`: focused helper plus existing R58 roof-beast tests. Recorded: 70/71 pass. The legacy R58 Taihe suite’s Jiaotai frozen nonroof baseline expects 180 meshes but R61 has 216; this worker changes none of its source files. Baseline reproduction is recorded separately. no full-world/test:zones/build was run by this worker. Owner retains aggregate validation responsibility.
- `tests/lib/r62-e-five-roof-beasts-world-check.mjs`: pure `assertEastFiveRoofBeastsInWorld(W)` consumes the owner's existing scene and cm; it creates no world and changes no state. It expects precisely the two records and checks all 200 real submitted foot vertices through final merging. It stores only 100 foot queries per hall and streams candidate vertices; a whole-zone-shaped root with 300,000 unrelated vertices verifies Map storage stays bounded. Mutation of a recorded contact causes failure.

## Owner hookup (not applied in this branch)

In the existing `ZoneBase.buildHallBaseline` EastResidential branch, import `applyEastFiveRoofBeasts` from `../palace/special/EastFiveRoofBeasts.js`, retain the actual facade builder result, then return:

```js
return applyEastFiveRoofBeasts(
  this.kit, this.zoneJson.id, this.zoneJson.items.indexOf(item), item,
  buildEastResidentialFacade(this.kit, item)
);
```

This must run after the actual facade builder, before final CourtKit merge. Independent facade postprocessors may run before/after because this helper validates only the original roof and target envelope. Keep normal source-guided nameboard handling unchanged. Test fixture deliberately invokes the original facade directly to avoid applying the new hook twice after integration; it is not presented as proof that owner dispatch is already wired. After wiring, verify both actual `ZoneBase.buildHall(config.items[index])` calls and run the pure consumer on the existing final W.

No remote upload, main merge or GitHub Pages publication was performed by this worker.
