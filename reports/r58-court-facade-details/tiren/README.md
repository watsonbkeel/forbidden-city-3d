# R58-A · FC-8C6502DA44 体仁阁 paired lower sashes

Status: **VERIFY_PENDING**, not whole-building or present-2026 acceptance. Baseline: `26f67a6655df110d2b530a10d55ce10e27157b82`; final source SHA-256 values in `proof.json`. Parent owns cumulative-world/browser checks.

## Evidence → difference → correction

Actually viewed on 2026-10-22: own [体仁阁 oblique facade photo](https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg), SHA-256 `8754a179efd12d10002c5f549a5e6d01070bacff4f62696953deeff1249cb8af`. Its six flanking lower-front window bays show paired straight-lattice leaves. Official [building text](https://www.dpm.org.cn/explore/building/236453.html) separately describes the lower window type. Capture date is unstated; this is not proof of current-2026 condition. No official photo is redistributed.

The old model already contained a central 0.045 m bar. The missing feature was separately framed paired sashes, not an absent center line. Each targeted window group is now replaced by two framed leaves, with distinct meeting stiles and six straight vertical bars per leaf. The old large frame and full-width bars are not generated under the new pair. Stiles meet between-stile rails without full-frame hidden duplication. Fine spacing and sash section sizes remain PHOTO_FIT, not measurements; paint, hinges and unseen rear construction are not reconstructed.

Production changes are limited to `PavilionLowerWindowLeaves.js` and the `g.profile === 'tiren'` lower-window branch in `SurveyedPavilion.js`. No interior staircase or furnishing is introduced.

## Retention and verification

- All non-target actual geometry/normal/UV/index/transform/material-property streams retain hash `f9695854256ff7bea0acbb1b098599ab142d9efb2b6603cc0695d69ca1b4334a`.
- Actual collision/walk/room/map/region records retain hash `9d21924c84922efbcbccba67617a0c1f6c12eb15b8a71e588b72f275b406f756`: 915 colliders, 14 walkables, 1 room, 1 map item, 1 region, including the same six window colliders.
- All six old external window envelopes remain exact within Float32 representation tolerance (2e-6 m). The measured 43.712 × 16.736 lower grid, central doorway, 28 upper leaves, gallery, waist, floors, terrace and roof stay unchanged. Hongyi's baseline geometry/material/registration hashes are unchanged.
- 192 new targeted source box meshes are finite and nondegenerate before pruning; complete candidate and baseline output are nondegenerate. Retained triangles 16938→17694 (+756; 4.46%). Actual merged draws 12→12. No new material or texture.
- Twelve meeting-stile rays from actual ground-supported collision-free terrace eyes hit the expected first surfaces before/after production merge. Original main aperture head/body rays remain clear. Source geometries are fresh and released exactly once; caller-owned materials are never disposed.
- Actual production FirstPersonControls round trips on both 32-step front flights keep stairs, threshold, lower entry and rendered head clearance; Xihe’s separately reversible route tests cover its three portals at 30/60/120 fps. Exact frame/sample/minimum-head-distance diagnostics are in `focused-test.txt`.
- Existing pruning tests keep their original assertions on upper leaves and surface preservation. Only the targeted old lower-bar count is replaced by explicit 72 straight + 72 crossbar counts. No test was relaxed to accept absent sashes.

Commands and logs:

    node --test tests/current-state/r58-tiren-lower-leaves.test.mjs tests/current-state/pavilion-render-geometry.test.mjs tests/current-state/r58-tiren-leaf-routes.test.mjs
    node --test --test-name-pattern='^(?!wall replacements)' tests/current-state/surveyed-pavilions.test.mjs
    node scripts/r58-court-facade/export-diagnostic.mjs tiren

Red-first absence failures are in `red-test.txt`; final focused/existing bounded results are in `focused-test.txt` / `existing-bounded-test.txt`. The last command uses the true Git baseline builder and verifies its frozen output hash before producing both views.

## CPU evidence / remaining limits

`tiren-lower-front-{before,after}.png` and `tiren-paired-leaves-{before,after}.png` are real bounded component CPU z-buffer renders. Same cameras and source content hashes are recorded in JSON. Flat diagnostic colors do not test runtime textures, shadows or full-scene exposure. They are not browser screenshots or final visual acceptance.

Current room interiors, actual staircase placement, complete rear elevation, fine sash details and current-condition dating remain unknown. No invented interior work fills those gaps. No full-world rebuild, production build/package, browser, push or deployment was performed for this correction.

The read-only `tests/lib/r58-court-facade-world-check.mjs` exports `assertXiheCorbelsInWorld(W)` and `assertTirenLeavesInWorld(W)`. It consumes an existing scene/collision manager, checks actual merged first surfaces at the real bound anchors and introduces no scene geometry or world construction. Optional item parameters support a parent-supplied verified transform. The cumulative world check is still the parent's responsibility.
