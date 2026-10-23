# R63 Tongdao roof-form correction

Status: bounded partial correction, not accepted as whole-building fidelity or GPU/browser rendering.

## Decision and conflict

The [dedicated Tongdao entry](https://www.dpm.org.cn/explore/building/236583.html) specifies a five-bay yellow-glazed xieshan roof. The [generic Xianfu entry](https://www.dpm.org.cn/explore/building/236507.html) calls the rear Tongdao hall hard-gabled. This conflict remains explicit in runtime metadata, with no claim that the generic source has been corrected or the discrepancy resolved.

The [official image](https://img.dpm.org.cn/Uploads/Picture/dc/18015%5B1024%5D.jpg), SHA-256 c7e93e5dc4f186007c74d2f65a1cf5b3de4743c4f099e6ddda1a037218dda090, was actually viewed. The visible lower hip return beneath the upper gable supports the narrow form correction. Photography date and measurements remain unknown. Official photos and HTML remain outside this repository; proof.json contains source links and hashes only.

## Exact scope

- Runtime target: west-six/items/47, 咸福宫后殿, profile tongdaotang, canonical identity 同道堂.
- Replace only the original roof/end-wall geometry with the existing low-detail xieshan builder. No shared RoofBuilder, CourtKit, ZoneBase, RearHallProfiles, data or queue file was edited by this worker.
- Keep original 26.2 × 13.4 input, base 6.53, inherited height input 5.36 and actual top 13.049957275390625. These are model fits, not source-derived measurements. The changed lower curve and corner return are stock xieshan approximations.
- Keep the original roof-bearing bracket-band mesh itself, including geometry, material, name and transform. The bracket carving is not reconstructed.
- All 41 lower hall meshes, facade, columns, doors, furnishings, room registration and navigation stay byte-identical. HD-material retained signature: 36c06b95b6591b3d71b6f1db918725d033b2f8c49f6b45768177692cab627885.
- Physics hash unchanged: 727d8c9516c0685e2d6645dfb600098c4e43a8295567451b282fff5f39c8a75d. The hall still has 27 colliders, one walkable and one room.
- Roof changes from 752 to 984 positive-area triangles, +232. Whole-hall triangles: 1646 to 1878. Shared material ownership is unchanged; obsolete roof geometry is disposed exactly once.

## Integration

Apply only the two-line import/call in HOOKUP.patch. Call is in buildHallBaseline immediately after rear-hall metadata, before returning the result. It therefore composes with the parent's separate buildHall facade hooks. The helper rejects identity, envelope, transform and original roof position/normal-stream drift before removing anything.

Pure consumer: tests/lib/r63-tongdao-roof-world-check.mjs exports assertTongdaoRoofInWorld(W). It accepts already built W.scene and W.cm, constructs no world and uses no browser. Six real ray hits verify both lower hip tile slopes, both inset upper gable walls and front/rear slopes. The tests pass before and after the production material merge, and removing real roof tiles or gables fails even if metadata remains.

The focused preservation fixture uses the actual buildHallBaseline with only the roof hook disabled. It does not replay later facade hooks. Separate actual-hookup tests call buildHall. The final W consumer disables no production hooks.

## Visual evidence

before/ and after/ contain three identical-camera CPU views: south, southwest, and west end. They use actual production triangles, actual HD albedo and UVs, and the exact minimal hookup rehearsed in memory. All six images were generated; southwest before/after and west-end after were inspected. The lower hip return and inset upper gable are now visible. They do not assert photo-calibrated proportions, normal-map/PBR response, lighting, shadows or browser acceptance. The west-end view is a close crop, intentionally exposing roof junctions rather than the entire building.

## Tests and historical boundary

16 focused/successor tests pass, including malformed inputs, preservation, disposal, nondegenerate geometry, material-library naming, real builder hookup and final merged surfaces. Vite build passes with its existing large-chunk warning.

Frozen R39 files were not edited. Against f873 the two R39 files have 29 passes and one existing failure: Jingren's interiorStatus already changed in R62. With the exact proposed roof hook, 27 pass and three fail. The two newly obsolete assertions are:

1. R39 tongdaotang uses official five-bay rear-hall profile and flush hard-gable roof.
2. R39 independent: six source-selected roofs close both gable planes, including rake, soffit and ridge, in merged geometry.

The successor tests preserve all six identities/five bays and the other five halls' exact roof signatures, both flush gable planes, final merged tile bounds and physics. Do not suppress the full historical tests or describe their old Tongdao roof assumptions as passing.

Full current-state results and clean-baseline comparison are in suite-comparison.json and the named logs. This repository's frozen historical/source inventories are not a green aggregate acceptance test for the cumulative build. Report those failures explicitly; the focused pass is not a full-suite pass.

## Reproduce

- node --test tests/current-state/r63-tongdao-roof.test.mjs tests/current-state/r63-rear-roof-successor.test.mjs
- node --import ./tests/lib/r63-tongdao-rehearse-hookup.mjs --test tests/r39-hard-gable-rear-halls.test.mjs tests/r39-independent-hard-gable.test.mjs
- node scripts/r63-tongdao-roof/export-cpu.mjs before
- node scripts/r63-tongdao-roof/export-cpu.mjs after

The exporter refuses to overwrite frozen images. No main, push, Pages, account, credential, or permission operation occurred.
