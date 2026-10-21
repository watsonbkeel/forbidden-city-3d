# R37 independent geometry and lifecycle review

## Conclusion and scope

The final focused independent run on production commit `93789c45ff034d64760be48a265053a32818a6b0` passes **16/16**, with no skipped or cancelled tests, exit 0. Two real defects in the earlier vessel candidate were reproduced and repaired before this result. This is actual Three.js geometry, merge, collision/controller and resource-event evidence with simulated DOM/canvas boundaries, **not native browser, GPU/FPS, visual-image, physical-phone or survey acceptance**. See [render validation](RENDER-VALIDATION.md). Broader current/historical suite results belong to the final release validation; these 16 tests must not be added again if already included there.

The reviewer changed only two new independent tests and this report. Production edits belong to the implementation owner. No historical fixture or failing historical assertion was weakened.

## Checkpoints and exact commands

- R36 baseline `c6718de20bb13dfebe963d49b797b061634dd995`: `node --test --test-concurrency=1 --test-reporter=tap tests/r36-*.test.mjs` passed 108/108, exit 0, 40.953 s. This includes the 16 helicopter event-chain tests, 159 stable place identities/seven unresolved cases, 12 bridge traversals and southern resource lifecycle. Source manifests before/after matched.
- Same R36 baseline: `node --test --test-concurrency=1 --test-reporter=tap tests/auto-routes.test.mjs` passed 29/29, exit 0, 45.419 s, including the current generated Yude round trip at 10/60 Hz, walk/sprint. Its two separately labelled R35-input algorithm tests are not current Yude geometry acceptance.
- Early Yude checkpoint `bccf64531aed02277c29c59c5cbfffaa9ff45a65`: `node --test --test-concurrency=1 --test-reporter=tap tests/r37-independent-yude-integration.test.mjs` passed 10/10, exit 0, 1.704 s.
- Final repaired production `93789c45ff034d64760be48a265053a32818a6b0`: `node --test --test-concurrency=1 --test-reporter=tap tests/r37-independent-*.test.mjs` passed 16/16, exit 0, 3.678 s. The ten Yude tests ran again, not merely borrowed from the early checkpoint. The selected production-source manifest was byte-identical before/after; the broader release seal separately binds the complete source/test inventory.

## What the independent tests establish

### Yude: ten tests

The actual complete outer-west zone is built and merged. Rendered rear annex, north room, square bath and bent vault surfaces are ray-tested against registered collision; only the retained front room, card and clear spawns exist. The rear wall is visibly and physically closed. A ground-start front entry/return executes the actual controller at 10/60 Hz, walk/sprint, with one initial placement and no rescue support. A separate exterior perimeter round trip remains clear at 10/60 Hz without invisible rear floors. Roof-cover/retained-ceiling grids guard against removing the front enclosure with its old roof. Three full-zone rebuilds verify deterministic navigation/resources, premerge geometry disposal, exact-once owned resource release and surviving borrowed materials/textures.

Rear components remain exterior-only fitted masses. The tests do not establish public access, exact historical dimensions, a restored bath interior, or the unverified annex roof form.

### Two Wuying vessels: six tests

- On final merged geometry, d102 has a deep open cavity, inner floor, inner side wall and thick lip; scene60's mouth reaches a real inner floor rather than seeing through the bottom.
- Both scene60 ear centers are empty while their ring surfaces remain solid; four collars are real geometry.
- Actual final ray-hit UVs sample the private color-zone maps: front accents survive merging, reverse samples remain neutral. Each vessel retains its own material/map and dated photo mapping. The local negative-Z presentation is explicitly a fitted viewing convention, not verified compass orientation.
- Both blank labels are inside their case glazing and are the first opaque surface above the pedestal, not buried under it. No fabricated label text or accession number is supplied.
- Three full-zone rebuilds verify fresh private materials/maps, deterministic budgets/navigation, exact-once geometry/material/texture disposal, and no disposal of borrowed library resources.

Independent archive rebuilds of `bccf645` and R36 `c6718de` reproduce the fourteen unchanged-form hashes in the owner's new fixture. Only `scene_d102` and `scene_60` differ; all sixteen case transforms and source metadata remain identical. The vessel-only change preserves the complete outer-west collision/walkable/room/map JSON identity (`62d45226a88c732e2072bd49ae1f915c8912c1f98fde3ca0396d82121e4fca7c`). This vessel-only navigation statement is not applied to the earlier Yude additions.

## Defects caught, preserved and repaired

At vessel checkpoint `96c5aad19360964c56643a1ced3633e49f39a1d2`, the independent vessel run had **4 passes / 2 failures**, exit 1:

1. The existing merger deliberately strips color attributes. The new source meshes had vertex colors, but final rendered meshes lacked them while their materials still enabled vertex colors. Source-only assertions had not established visible final color cues.
2. Scene60's inner profile ended in the throat. Downward rays through its mouth hit no ceramic surface because its outside bottom faced away from the interior.

The owner repaired these locally: two private 64×128 RGBA procedural maps use preserved UVs, and a neutral inner profile closes at 0.10 model vessel height. No global merger, noMerge exception, case position or collision change was needed. The final tests validate rendered map sampling instead of requiring the abandoned vertex-color technique. The original failing log remains preserved; it was not relabelled passing.

## Actual bounded resource cost

These are measured **complete outer-west merged scene** CPU resource counts using the same fixture/library and `resourceBudget`, not measured GPU memory or draw calls. Other zones are not included.

| Source | Meshes / geometries / materials | Triangles | Geometry bytes | Textures |
|---|---:|---:|---:|---:|
| R36 `c6718de` | 50 / 50 / 50 | 97,458 | 9,355,968 | 2 |
| Yude checkpoint `bccf645` | 54 / 54 / 54 | 107,706 | 10,339,776 | 2 |
| Final R37 `93789c4` | 56 / 56 / 56 | 113,282 | 10,875,072 | 4 |

- Total R37 versus R36: +6 meshes/geometries/materials, +15,824 triangles, +1,519,104 geometry bytes, +2 textures.
- Vessel-only versus the already-updated Yude checkpoint: +2 meshes/geometries/materials, +5,576 triangles, +535,296 geometry bytes, +2 textures.
- The two added maps contain 65,536 raw RGBA bytes total; this is not a GPU allocation measurement. Texture counts include the fixture's two existing plaque textures. Real-device cost and appearance remain unverified.

## Evidence identity

Raw logs are preserved locally; these hashes identify them and do not claim the raw TAP files are published.

| Evidence | SHA-256 |
|---|---|
| R36 southern baseline TAP | `a3fc2a07419f574b0c066b6135fceaa04aa7385fa9e2d96ebcf95ab3d8b2a195` |
| R36 auto-routes baseline TAP | `f2c96aff3fa12faf36d316eb9b4dfd3a0533b00412e20604a85b1f238c633982` |
| Early Yude 10-test TAP | `40b058bb491fe7bfefdc6d80164f90297ecb880428d84736c55a8ac8137506a3` |
| Two-blocker vessel TAP | `6e269517f6867de6dd5a792b0e55c5b24b2b911b0000f04173a76c4290a5000e` |
| Final independent 16-test TAP | `754a299124acbca2911aca45efd48fff74999a4b80c697ddfacce1cae57e765b` |
| Final selected-source manifest | `ae993667c458ecac2cefe86e10914533dd2352871779a8446441a651678791ac` |
| Yude independent test | `485ca5a03549cdafc19f5188a065d8f66d4da16b9811754ce255fd4df3fb4c7c` |
| Vessel independent test | `13c734f70ccffa71f1767df378d80f5cfc577e69383b62c330a66a04ec9fa544` |
| Final Yude source, unchanged since early checkpoint | `de5a3ea6e3f5cc070321894323d4fc0a9b81636dc799d6eac0c1bdb926b94afa` |
| Final repaired representative-vessel source | `5d47bffed19a1a071b35eeaee9a4d1746576b6dfebe4bb76a9ef2df7abcfc234` |
| R36 measured whole-west JSON | `76bd7b46f2ac1365ac68fd719e9e7574f3102a919333be5ed62639f2a86c6548` |
| Final R37 measured whole-west JSON | `8e15a544c7298c1219fa43bd1e7bd51994228e9e97fcd6af8efb968795ad5cca` |
