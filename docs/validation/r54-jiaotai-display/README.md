# R54 Jiaotai display candidate

This directory contains neutral and base-material checkpoints of the same bounded geometry. Source/fit/unknown distinctions: `../../references/r54-jiaotai-display/SCOPE.md`.

## Neutral checkpoint

- Replaced only Jiaotai's generic throne-area invocation; 100 new source-bounded meshes, 2378 triangles, six private merge materials.
- Removed 20 old generic meshes / 3 old furniture colliders. Preserved 36 shell colliders; added 84 furniture bounds plus the actual extended screen bound. One low-platform support, no rescue.
- Screen correction explicitly changes only the lower Y vertices of the body and two frames. The unchanged upper parts, all other raw meshes, R27/R28 resident LODs and Zhonghe are covered by hashes.
- Original front teleport landing remains (0,336.6), feetY=2, with no fallback. Six lawful observation positions include front/wide/side/back positions; each remains on the inherited movement datum 2.16, while retained visible floor is 2.19.
- Four-door circuit starts on ground, climbs the real side stair, traverses all four door apertures, walks behind the screen, and returns. 10/60 Hz × normal/sprint × forward/backward gives eight successful continuous actual-controller replays. No collision narrowing, rescue or unverified support.
- Actor registry is frozen at 77, including no Jiaotai binding.

`neutral/geometry-and-navigation.json` contains exact new bounds, camera coordinates, route and geometry/physical hashes. `annotated-plan.png` draws the actual bounds and route; it is not a measured plan. `screen-datum-section.png` explains the 1.02 m old-screen/low-platform mismatch and 1.22 m downward-only correction.

The PNG views rasterize actual merged three-hall rear-palace fragment triangles with a CPU z-buffer. They omit textures, live lighting and shadows. The portrait front view is merely the same viewing direction as the source, not a matched or calibrated camera. No browser/GPU, full-world, registered S/GLB, photo-match or full-restoration claim.

## Reproduce locally without an additional whole-world build

```
node --test tests/r54-jiaotai-display.test.mjs tests/r54-jiaotai-navigation.test.mjs tests/current-state/square-halls.test.mjs
node tests/r54-jiaotai/export-diagnostic.mjs OUTPUT_DIRECTORY
python tests/r54-jiaotai/render-diagnostic.py OUTPUT_DIRECTORY/south-wide.json.gz OUTPUT_DIRECTORY/south-wide.png
python tests/r54-jiaotai/render-plan.py OUTPUT_DIRECTORY
python tests/r54-jiaotai/render-section.py OUTPUT_DIRECTORY
```

Single-integrator adapter: import `assertJiaotaiDisplayInWorld`, `replayJiaotaiDisplayRoute`, `JIAOTAI_DISPLAY_CAMERAS` from `tests/lib/r54-jiaotai-world-check.mjs`. Pass the existing `W={scene,cm,THREE}` and optionally `{teleport,registry}`. It neither builds another world nor mutates the registry. The replay temporarily traces the existing ground resolver and restores it in `finally`.

## Review corrections

The first neutral replay clipped an unchanged folded door tip at the original test turn, so the route turn moved inward. Furniture, door and player collision dimensions did not change. Independent review found the old screen-height dependency and a blue-brazier/clepsydra overlap. The former was corrected by the recorded lower-vertex extension, not a fabricated pedestal; the latter by repositioning the new braziers without scaling. Regressions assert all 100 new mesh bounds stay outside both unchanged R27 envelopes (east minimum horizontal clearance 4.6 cm). Two small 11.7 mm stand/footrest gaps were closed onto the rug.

This deliberately stops at a visible blockout/basic-material change. Braziers and small vessels remain geometric silhouettes; textile folds, brocade, carving, handwritten inscriptions and concealed contents are not modeled or claimed.

## Base-material checkpoint

Neutral commit: `5ecd95d`. Base palette adds pale stone, muted yellow covers, dark wood, red lacquer, dark metal and blue braziers. Carpet gets a separate muted grey-green material rather than sharing yellow covers. Seven private materials, still 2378 new triangles and 85 exact new/extended-screen colliders. No new geometry, UV, index, transform, walkable or collider change from neutral: both checkpoint hashes match exactly.

Final focused command passes **26/26**, logged in `base-materials/tests.txt`; neutral passes 25/25 in `neutral/tests.txt`. Eight live-controller replays are also recorded under `base-materials/geometry-and-navigation.json`: 127–1216 frames each, 30/30 waypoint crossings, start/end at ground, max feetY=2.16. This is local three-hall proof, not the integrator's separate complete-world acceptance.

The actor regression keeps every frozen R53 actor ID and prohibits a Jiaotai binding, rather than pinning the entire registry to 77 and incorrectly blocking separately authorized additions in other districts. This branch itself makes no actor-file change.

Read-only review checked both sources and all 100 new bounds, then independently compared the three screen revisions against an untouched R28 backdrop build. Initial two geometry blockers and inherited-floor wording are resolved. Final acceptance remains partial: no textures, brocade, fine carving, live light/shadow or browser/GPU claim. No extra whole-world construction or deployment was performed here.

R54 unified transport note: the larger annotated plan PNGs and diagnostic geometry gzip files are stored losslessly in `reports/r54-transport/ARCHIVES.json`. Restore their original relative paths with `node scripts/r54-restore-report-archives.mjs /tmp/r54-restored`. Ordinary view PNGs and all test-consumed geometry/navigation JSON remain directly readable. This changes storage, not the source checkpoint bytes.
