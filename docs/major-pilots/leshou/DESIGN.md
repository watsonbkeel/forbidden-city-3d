# 乐寿堂南立面—宽阶御路整包设计（父任务已确认）

Original object FC-C715F850DA, original requirements line 699. The own official page 236470 describes seven bays, three stacked window bands (lower glass, upper two 步步锦), central four five-rail leaves, surrounding gallery and 18.7 m ground-to-ridge. Own photos `leshou-0/3` show the south elevation and broad stair wings around a central stone slab; `leshou-2` is eave/plaque detail. Dates in image URLs are not photography dates.

## Approach
Use a dedicated front-only helper in the existing Three.js kit, fitted true joinery geometry, plain material fields and a broad paired stair/central stone approach. Keep an independent `leshouSouthFront=false` rollback. This gives a coherent exterior package instead of isolated décor. Reject rebuilding the whole hall from the front photograph (unseen interior/bearing uncertainty) and reject a photograph pasted over generic surfaces (not actual geometry).

## Boundaries
Preserve seven-bay frame, roof and published 18.7 m ridge, rear/side façades, H-shaped loft, reduced/additional posts, fan partition, northern plinth, room/map identity and existing central access. No new visitor permission or upper navigation. Own plaque is already supplied by SourceGuidedNameboardMounts; do not duplicate it.

New front windows have three visually distinct bands, fitted two-leaf subdivisions and limited geometric step-pattern grille. Central four five-rail leaves fold beside the retained opening for circulation, explicitly unlike the closed photo pose. Upper central transom and old nameboard must retain beam clearance. Door height is fitted to 66% of the retained facade height rather than keeping the tiny generic portal; the larger clear height is deliberate. Narrow central plain stone slab and broad six-riser wings fit the inherited platform height; raised plain slab side borders are permissible source-visible forms, but dragons/ornaments remain omitted. Their collisions must never block the inherited center route; if a raised border cannot meet that contract, omit and record it rather than invent access.

No ceiling inferred from photo `5/10` (courtyard corridor), no opposite courtyard façade assigned from `4/9`, no invented planter/censer inventory, no decorative dragon sculpture/paintings, no phototexture copying. Dimensions, step widths, leaf pose and lattice density remain fitted, not measured survey or current-state inventory.

## Validation
Test first: selected scope/rollback, exact preserved non-target meshes/physics, step positive winding and support, window band topology, four leaves, beam/plaque clearance, finite triangles, merge provenance and disposal. Use real decoded NingShou zone controller loops at 10/60 Hz and forward/backward walk/run from both broad flights and original center, plus old Yangxing routes. Inspect front/oblique/door/stair/rear CPU real-material views. Run historical aggregate at concurrency 2 and compare exact failure names against the corrected Yangxing checkpoint; do not rewrite old goldens. Build and verify `/`, `/forbidden-city-3d/`, `/gugong/`. Independent read-only review. Local checkpoint only; no main/push/deploy.

Implementation choice: slab borders remain omitted and explicitly recorded; actual main passage width is 3.2 m (old façade), while portal metadata remains 2.8 m.
