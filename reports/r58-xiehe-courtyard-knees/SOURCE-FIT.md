# Xiehe courtyard knees: bounded R58-A change

Object: FC-9E59B14A3C, 协和门. Base commit c85e770daa0d952bb9a5614b0d8fa920c44650b2. This is a reversible component refinement, not complete Xiehe exterior/interior restoration or R58-A acceptance.

## Evidence actually viewed

All five originals were viewed on 2026-10-22 at approximately 18:38 UTC from the private reference cache. No original or crop is committed, embedded in a game material, publicly uploaded or packaged. The prior source register is `r58-a-side-buildings-review/SOURCE-INDEX.json`, held outside this repository. Capture dates are unstated; 2020/04/20 is an asset-path date, not a photography date or proof of 2026 condition.

- Courtyard west elevation, local +Z/rear: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4981afba5.jpg ; SHA-256 `6c74f73106179c649744fd18501194db40bb77ff149bafb0b648aed5c4a95746`. Own 1425×1068 oblique photograph. The six under-beam ends occupy the band approximately x=620–1080, y=660–705, one inward-pointing pair in each of the three central openings. Its irregular convex/concave lower boundary supports a scalloped silhouette, not a plain wedge. Perspective and limited pixels preclude a measured trace.
- Outward east elevation, local −Z/front: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d49bdcb60f.jpg ; SHA-256 `e479ab2062ebb073ecb6f0473e07195e45249c5ef35d0104b4efb82625939a69`. This independently shows under-beam ends but does not authorize treating the courtyard fit as the outward fit. Outward work remains pending; no geometry was added there.
- Own corner/霸王拳 detail: https://img.dpm.org.cn/Uploads/Picture/dc/13150.jpg ; SHA-256 `1080a9c53dfc363cf7418fdc50dd659cb200388016c6472383728863cc8e2d6d`. Supports local material/structural context only; not a measured knee profile or cardinal placement.
- Own bracket detail: https://img.dpm.org.cn/Uploads/Picture/dc/13148.jpg ; SHA-256 `d4497916b1288932638256c43b305924449cc4e58393f83528a268668a38e2d0`. Same limitation; bracket rebuilding is outside this pass.
- Own plaque detail: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d499d44c0e.jpg ; SHA-256 `bf9244ba19f35902848324ea9f85ec2cc23a122432438ae218d0adc107ee461c`. Existing plaque retained exactly. The decorative nameboard contour is NOT used as a knee profile.

The building's official source is https://www.dpm.org.cn/explore/building/236540.html . MASTER-PROMPT global execution rules and all 37 A entries were read. Xiehe is not a mirrored Xihe: its own photograph controls this outline, while `SideGateExteriorDetails.js` and all Xihe output stay unchanged.

## Difference and fitted limits

Reference: six scalloped, thin under-beam knees. Baseline: continuous beam rings and round columns without these knees. Change: new `XieheCourtyardKnees.js` and one Xiehe-only import/call in `SideGate.js`.

- Projection from the column attachment surface: 1.34 m; deliberately bounded photo-fit allowance 1.10–1.55 m. The chosen projection is 0.239 of a 5.6 m side bay and 0.223 of the 6 m center bay. These are model-relative fitting ratios, not photogrammetric measurements. They preserve the large central gap shown in each opening.
- Maximum drop below the present beam underside: 0.56 m; allowance 0.43–0.72 m. The chosen drop is 0.101 of the retained 5.55 m under-beam opening height. The photograph supports the shallow descending scalloped shape but not a unique numerical drop.
- Thickness: 0.16 m, centered on the existing rear column/beam line. The photo does not resolve thickness; 0.12–0.17 m is an engineering allowance compatible with the existing column facet. It is explicitly not a source-derived measurement.
- Twenty authored outline points, 72 nondegenerate triangles per knee, 432 added triangles in total. Existing shared caihua material is reused; no new texture, carving, motif, or material ownership is introduced.
- The approximate polygon captures irregular convex and concave changes without pretending to trace ornamental relief. Both directions reuse this Xiehe-only fitted half-member. No Xihe source or outline is imported.

## Exact structural attachment and unchanged physics

The host column is the existing ten-sided tapered CylinderGeometry: upper radius 0.28, lower radius 0.2912, height 6.2. At each knee vertex height, the inward flat facet is x=sin(72°)×radius(y). The new root follows that exact plane; its ±0.08 depth lies inside the facet's approximately ±0.087 half-width. Root vertices are ray-checked against actual column triangles. No translation into the column is used to hide a gap.

The new top vertices lie on the existing beam underside at world y=8.17. The hidden root and top skins are intentionally omitted because the unchanged host column and beam close those seams. Thus there are no new coplanar contact faces, no duplicate beam, and no volume overlap. All existing geometry, surveyed/profile values, columns, roof, ramps/railings, doors/windows, plaque, galleries, map, rooms, colliders and walkables are retained.

Lowest new vertex: y=7.61, or 4.99 m above the 2.62 m platform. Production standing head: y=4.32. Production theoretical jump head: 2.62+1.7+7.2²/(2×14)=6.1714286. Even the global lowest knee is 1.4385714 m above that theoretical head. Actual FirstPersonControls jumps and actual upward triangle rays are checked separately at all six knee locations, at 10 and 60 Hz. Controller routes cover three portals, forward/backward sprint at 10/60 Hz, starting on ordinary ground and using the retained ramps. No collider change is necessary or made.

## Verification boundaries

The same-camera before/after images and compressed triangle exports use real `buildSideGate` assemblies and production `CourtKit.finish()` merging, not proxy meshes. They are explicitly local component diagnostics, not a full-world comparison. Both cameras use actual collision-manager ground support and are body-clear. Flat diagnostic colors omit textures, WebGL lighting and shadows; they are not photographs or browser screenshots.

`proof.json` binds the base commit, production-source SHA-256 values, exact retained geometry/physical-state hashes, triangle counts, and camera matrices. `controller.json` records actual jump and walk results. The full-world parent consumes `assertXieheCourtyardKneesInWorld(W)` and `replayXieheCourtyardJumps(t,W,{fps})` from `tests/lib/r58-xiehe-courtyard-world-check.mjs`; neither builds or changes a world. Optional `exportXieheCourtyardViews(W,out,'after',{scope:'ACTUAL_EXISTING_WORLD'})` exports only supplied merged triangles. The parent owns cumulative integration, not this worker.

Browser verification remains VERIFY_PENDING. Known Chromium socket EPERM, denied bwrap path creation, and CloudChrome inability to access localhost were not retried or bypassed. Missing browser evidence does not become a CPU acceptance claim. The outward knees, windows, complete roof frame, bracket details, ends and broader Xiehe restoration remain open. No canonical queue, source freeze, release, dependency, main branch, Pages or remote file was changed.
