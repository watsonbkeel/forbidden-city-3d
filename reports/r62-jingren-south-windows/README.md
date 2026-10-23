# R62 E: Jingren Hall south four windows

Scope: one bounded facade correction, NOT completion of Jingren Hall, zone E, or all 13 zones. Baseline R61 is `6b396800b6a03582aebf513fcef4966e9f5d0db3`. No browser/GPU acceptance is claimed.

## Evidence actually inspected

The official Jingren gallery page is https://www.dpm.org.cn/explore/building/236509.html . The implementer directly viewed both original public-source images before modeling:

- Frontal gallery image 01: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d167f9a32e.jpg ; SHA-256 `d897b4c0c1dea7e1ca23c82ba77d021d6b3237a5db2fddfaf9b8bcc2f1014e93`.
- Oblique gallery image 04: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c13f4.jpg ; SHA-256 `8c480498b6bd9c19a8c085991c26b23c02876b3bd97787b403373b904ce33c5b`.

Observed: four closed south bays on grey high sill walls; each has a broad rectangular square-grid center and two substantially narrower small-diamond side fields. This is not the Zhongcui upper/lower field layout. No other palace photo or AI concept was used. Photograph dates are unknown. Dates in upload URLs are not treated as capture dates. Original source photographs stay outside this repository and delivery archive.

## Change and explicit limits

Only `src/scene/palace/special/JingrenSouthWindows.js` is production code. It exports `applyJingrenSouthWindows(kit, frame, item)`. The owner can import it and invoke once immediately after `buildEastResidentialFacade` returns and has assigned its existing structure record. No shared builder, ZoneBase, kit, data, or generic throne code is changed in this branch.

The helper first validates exact target identity, zone root, original single-storey south-facing envelope, unchanged transforms/matrices, all four complete original panel attributes/UVs/groups, geometry uniqueness and their existing colliders. It rejects all targets atomically when any panel is malformed and is idempotent. It creates four independently owned groups, replaces only those four original panels, disposes their four old unshared geometries, and registers four owned materials.

Geometry: 1.35 model-metre high grey sill walls within the existing 4.73088-metre panel height; red frame/jamb/rail solids; broad center square-grid solids; two narrow clipped diagonal-solid side fields; opaque recessed backing. All dimensions, 8-by-10 central repeat count, .32 diagonal spacing, colors and backing are reversible FIT, not surveyed or claimed exact. Fine ornamental joins, hinges and paint remain partial/unknown. Five-bay positions, overall height and envelope are untouched.

The original north rectangular glazing, both central doorways and leaves, threshold, columns, south wall head, beams, platform, roof and generic throne stay byte-exact. The latter is explicitly left for the owner's separate unknown-furniture helper. Existing 24 colliders, 3 walkables, room/door records, map item and region are unchanged. No new passages through windows are invented.

## Verification

- Test-first failures are captured in `red.txt`, `routes-red.txt`, and `additional-guards-red.txt`.
- Final `node --test tests/current-state/r62-jingren-south-window*.test.mjs`: 11/11 pass in `combined-tests.txt`.
- Negative cases include other halls, malformed identities/envelopes, root/frame transforms and stale matrices, missing/moved/duplicated/shared/edited panel geometry/UV/material groups, removed collider, repeat application, and deletion of actual center/diagonal solids after model creation.
- New materials are kit-owned. All generated solid triangles have finite attributes and positive area. Actual world-space bounds survive material merging.
- Read-only existing-world consumer verifies 16 actual merged triangle contacts, four unchanged closed-window colliders, and six open portal rays. It rejects missing solids, missing collisions and absent target metadata.
- Actual FirstPersonControls at 10 and 60 Hz traverse each south and north doorway twice, walk inside, and return outside from ground level. Frame counts: south 105/630, north 77/462. Feet reach .6 then return to ground. No rescue or unverified support is used. Every fourth recorded frame is checked for body collision and vertical rendered head clearance; minimum sampled clearance is 2.654239845275879 m.
- Selected legacy R40 tests: 2/2 pass, recorded in `legacy-r40-selected.txt`.
- A separate bounded call through the actual `ZoneBase.buildHall()` including existing source-guided nameboard mounting accepts this helper. The owner's integration hook remains intentionally absent here.
- `npm run build` passes. Existing Vite chunk-size warning remains; no claim that the unused helper is yet hooked into this branch's released bundle.
- No full world, `npm test:zones`, or all-current-state suite was constructed/run. These results are bounded component verification, not a cumulative release gate.

## Actual CPU evidence, directly viewed

`scripts/r62-jingren-south-windows/export-cpu.mjs` builds immutable SHA-checked R61 EastResidentialFacades source, then applies only this helper for the candidate. It exports the actual production triangles after `kit.finish()`. The unchanged shared CPU z-buffer rasterizer produces identical-camera before/after frontal, single-window close and oblique views. All six PNGs were directly viewed by the implementer.

The actual after images show grey high sills under red broad square grids and pale narrow diagonal grids, replacing the former full-height flat generic panels. Original roof, columns, wall head, central opening and north panes seen through the doorway are visibly retained. Flat colors are diagnostic: no source-photo pixels, texture fidelity, browser rendering, shadows, photo matching or historical completeness is claimed.

- `evidence/jingren-south-whole-before.png` and `evidence/jingren-south-whole-after.png`
- `evidence/jingren-south-window-close-before.png` and `evidence/jingren-south-window-close-after.png`
- `evidence/jingren-south-oblique-before.png` and `evidence/jingren-south-oblique-after.png`
- `evidence/proof.json`: source hashes, cameras, geometry, physical counters and consumer measurements.

Merged geometry: 2,442 → 5,994 triangles (+3,552), 16 → 20 material meshes (+4).

Unchanged non-target geometry hash: `805b45e33d6254f95934a8301ec913c2d76df4dbbdc08053b4d7f8f0b168ef74`.
Unchanged navigation/physics hash: `2bae5f6f1a06478bb66477044ad9ea9eeb912d5da6970ea9420f6f82349a98d4`.

## Owner integration / existing W

Import `applyJingrenSouthWindows` and call it with the existing kit, returned frame and original item after the original east facade builder. Keep the owner hook minimal; do not replace any shared generic behavior.

`tests/lib/r62-jingren-south-window-world-check.mjs` exports:
- `assertJingrenSouthWindowsInWorld(W)` for actual merged triangles/collision checks.
- `replayJingrenDoorsInWorld(t, W, {fps:10|60, side:'south'|'north'})` for actual controller replay and head clearance.
- `JINGREN_SOUTH_WINDOW_VIEWS` for three fixed local cameras.

These consumers accept already-built W and do not build a world or change geometry/proxies. CollisionManager may update its ordinary query scratch buffers; colliders and walkables are unchanged. The test fixture's frozen source is project code, not third-party imagery.
