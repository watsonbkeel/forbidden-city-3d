# Zuoyi gate: actual passage-facing rows and floor visibility

Status: **PARTIAL, COUNT/VISIBILITY ONLY**. This supersedes the unsupported face/visibility assumptions in `ZUOYI-DOOR-FRONT-CORRECTION.md`; it does not retrospectively turn its isolated-skin evidence into an in-world pass. No browser/GPU acceptance or full-world result is claimed here.

## Reproduced submitted-component failure

The earlier `86fe511` / `a5441b9` implementation selected local -Z on both identically rotated leaves. In the actual merged gate, the first selected skin lies at world z=-50.795 and faces world +Z, toward the retained wall. A legal passage eye at (-105.045, 2.15, -53.1) sees its **other, original material face**, not the corrected skin. The second selected skin is at z=-55.155 and correctly faces the passage.

The unchanged leaf geometry spans y=0..4.4. The walkable platform is y=.45; actual stone-slab geometry tops at y=.46. The earlier full-height nine-row texture placed its last gold-row sample at approximately y=.262, behind the slab. Its complete bottom band was also hidden. Actual old corrected-skin row hits are [0,8], not [9,9]. This is **not** a claim that the first leaf showed no studs: its visible original ten-row texture already showed nine because its last row was buried.

`reports/r58-zuoyi-visible/old-hidden-face-and-floor.json` pins the old helper to commit `62d489a`, uses actual TextureLibrary loading of every local component asset, final production material merging, CollisionManager legal-eye checks and THREE.Raycaster intersections with all retained walls/slab. Its script remains pinned if rerun.

## Bounded correction

Only `src/scene/palace/special/ZuoyiDoorFront.js` changes in production:

- Exact existing target binding remains `axis-courts`, item 2, hall gate 左翼门, x=-106.47, z=-53.1, east. Other declarations remain excluded.
- First leaf: select original **local +Z**, now world -Z at z=-51.045. Second leaf: retain **local -Z**, world +Z at z=-55.155. Each leaf's own other five faces, including the first old -Z face, retain their original material/geometry/UVs.
- Keep the existing row-2 removal band, source y=136..234 of 1024. This band contains neither the top/bottom edge hardware nor the lion-ring region. Every x coordinate and the entire remaining source extent are retained.
- Fit that complete remaining image into y=.47..4.4, leaving .01 above the actual slab. Only canvas layout changes. Padding below uses the project's existing `door_studded` fallback red #9a1f16 and neutral tangent normal (128,128,255).
- Relative to the retained original source, vertical scale is `(1-.47/4.4)*1024/926 = 0.9877086197`, replacing the earlier 1.1058315 stretch. This is a **reversible display fit, not measured historic dimensions or hardware placement**. All x mapping is unchanged; eight inherited columns and their placement remain unverified against the cropped photo.
- Complete inherited lion-ring and upper/lower edge bands remain. Their y position, styling, proportions and color are not photo-calibrated. The slight crop join/color discontinuity remains an acknowledged limitation; no sculpture, backside or other gate is invented/redrawn.

The official 2024 source photograph was actually viewed again. It shows nine vertical rows and both edge bands/paired handles on closed doors, but crops the horizontal outer edges. It does not verify the model's opened poses or hardware positions. Source entry: https://www.dpm.org.cn/light/368399.html . No official photo pixels are in runtime textures or report images.

## Actual pixel/UV and geometry evidence

`actual-full-component-diagnostic.json` records both pinned old and new helpers. Gold-row centers are derived from the ten actual source pixel runs, remove only row 2, then follow the known canvas transform into actual final-triangle UVs. Each resulting sample is also verified to be an actual gold-colored pixel, so a hit on a red area or the mesh alone is insufficient. Independently, the output image contains nine detected gold runs. The bottom run can merge with the edge band under the generic threshold; source-derived stud-center samples avoid treating that merged run's midpoint as the stud center.

HD new stud-center heights, in both leaves: 4.0265, 3.6170, 3.2053, 2.7851, 2.3798, 1.9533, 1.5353, 1.1172, 0.7034. All 18 rays hit the correct actual merged skins from the legal, ground-supported passage eye. A sample inside the complete bottom band at y=.485 also remains visible above the slab. SD independently passes the same 18-hit check.

Old and new components both have **1790 triangles and 14 merged material meshes**. No new draw bucket beyond the already-existing single shared derivative bucket is added. Geometry/normal/UV multiset hash is identical: `fa41019a480e7252d33b845f74a42ecbe6fbc466796bb6a21bba446ebff2a123`. Leaf/frame poses, doorway, colliders and walkables remain unchanged. Source albedo/normal pixels and other gates' materials remain unchanged. Existing TextureLibrary ownership, caching, independent THREE.Source, actual disposal, and honest SOURCE_UNAVAILABLE fallback behavior are retained.

## Tests and preserved historical evidence

- New `tests/r58-zuoyi-visible-front.test.mjs`: **6/6 pass**, including actual merged legal-eye rays, retained five faces, full pixel fit, unchanged mesh/triangle count, HD/SD and neutral-normal/red padding.
- The 17 still-applicable original regressions pass, including source isolation, per-library instance reuse and disposal, no-map/64px/file-failure fallbacks, all-real loader/configure and non-target material isolation. `retained-regression.tap` records an explicit positive-name selection, not a claimed full-suite pass.
- Full old 19-test run is honestly **17 pass / 2 fail** in new `legacy-recheck.tap`. The old file remains unchanged. Its obsolete assertions expect both leaves' -Z faces and the old unpadded horizontal probe y coordinate. New tests replace those assumptions with per-leaf faces and the padded coordinate. SD threshold edges tolerate up to 3 pixels of vertical-resampling quantization; HD allows 1. This is not an x-coordinate remap.
- Original `reports/r58-zuoyi-door/focused.tap` (13 pass) and `fallback-green.tap` (19 pass) remain byte-identical. Their SHA-256 values are `2736e1487dd1ca86d46d2f40825d8353c4a9779125dd98c2d17556c3fa815736` and `adfab57f268598c6505798554d6429a729de09a67e7305c0a7da93cf9e6ee24e` respectively. Those passes did not establish legal in-world visibility.
- Independent code review found no blocking runtime issue. Its baseline-script rerun concern was fixed by pinning the old helper. `git diff --check` passes.

## Images and evidence boundary

New before/after `full-gate-front`, `full-gate-oblique`, `passage-north`, and `passage-south` PNGs in `reports/r58-zuoyi-visible/` render the **entire actual merged component**, including its walls and slab. They use real project albedo, real UVs, perspective CPU z-buffer and backface rejection, not isolated replacement skin geometry. Full-gate cameras fit the complete component bounds. All four eyes are ground-supported and collision-free. Runtime albedo and normal PNGs are also retained for direct pixel inspection.

These are CPU diagnostics, **not browser screenshots**. They omit GPU normal-map lighting, runtime shadows, browser filtering and the surrounding whole world. A single component cannot establish that another zone does not occlude it. No full-world/build/browser retry was performed. This successor tree does not contain the owner's uncommitted ZoneBase hook; its actual shared-dispatch/world consumer remains owner-run and pending integration.

## Owner integration notes

No ZoneBase, kit, merger, original asset file, or world-consumer edit is included. Existing exact hook stays unchanged. The consumer must replace its unsupported `normal.z > .999` assumption with passage-facing geometry: north leaf at z=-51.045 has world normal -Z; south leaf at z=-55.155 has world normal +Z. Equivalently verify that the normal points toward passage center z=-53.1, and retain legal-eye and per-row first-hit checks against the whole submitted world. The unchanged visible eye (-105.045,2.15,-53.1) provides a concrete component starting point, not permission to bypass world collisions.
