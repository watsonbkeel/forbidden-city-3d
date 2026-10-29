# 乐寿堂南立面—宽阶御路 · bounded local package

Original object **FC-C715F850DA**, not a new hall or whole-building acceptance. Base checkpoint `1aa44fae62f3be7e681d56296b28584f1064bde0` retains Yangxing and all prior cumulative work.

## What changed
- Six south window bays now have distinct lower glass and two upper stepped rectangular grille bands, with a dark stone-colored sill. Motif and cell counts are fitted approximations, not exact 步步锦 replicas.
- Central four five-rail leaves are folded for circulation; their height is fitted to the tall photographed doorway rather than the previous tiny generic portal. The actual inherited **3.2 m** nominal clear opening is retained; navigation metadata stays **2.8 m**. Closed-door photo pose is not claimed.
- Two broad six-tread stair wings flank a closed, outward-wound plain stone incline. All original walkable rows are exact; only two corresponding wing ramps are added. Original center ramp stays exact. Borders, dragon relief and top ornaments are explicitly omitted.
- Every untargeted mesh—roof, rear/side facade, frame, internal gallery, posts, fan partition, plinth—and all nonfront collider rows are byte-exact. Published 18.7 m ridge remains unchanged. Earlier unresolved global façade/eave proportions are not silently declared solved.

## Verified
- 21 paired Yangxing/Leshou tests pass, including all non-target mesh/physical rows, positive ramp volume/upward surface, nondegenerate finite geometry, bounded new geometry cost, actual 3.2 m opening, beam clearance, merged metadata and material disposal.
- 24 real decoded NingShou-zone controller loops for Leshou (10/60 Hz × walk/run × forward/backward × left/center/right); previous Yangxing 24 loops also pass. No rescue, teleport or physics change. Lateral porch route correctly runs between retained columns and recessed facade, not through the column row.
- Five final CPU real-material views inspected: front, door, southeast, steps and rear. Cropped actual production export: 45,870 triangles / 18 materials; not GPU/FPS acceptance. Source photos are not production textures.
- Three production bases built and fingerprint-verified: `/`, `/forbidden-city-3d/`, `/gugong/`, fingerprint `5a00d102d914fecb3bf97642046c91a18fe44ec804a4d6cb496deace3007012c`. Usual bundle-size warning retained.
- Same-condition aggregate: **1331 tests / 1115 pass / 216 fail**, exactly the same 216 failure names as parent. No new failures; no fixtures changed. The historical suite is still not green.
- Final independent review: **8/8 geometry/preservation tests passed**, revised views approved within scope; no blocking defect.
- Actual merged NingShou cost: **66 mesh objects / 66 materials unchanged**, triangles 409,564 → 421,332 (+11,768); collider rows +3 and walkable rows +2. No FPS or GPU draw-call claim.

## Reproduction and limits
`node --test tests/major-pilots/leshou/*.test.mjs tests/major-pilots/yangxing/*.test.mjs`

`node scripts/major-pilots/leshou/export-whole.mjs candidate-final`

Set `kit.leshouSouthFront=false` before build for independent rollback. Product source is `LeshouSouthFront.js`; integration is front-only in `RemainingNingshouHalls.js`. No main/push/deploy. Original unrelated dirty bridge reports and old previews retained.
