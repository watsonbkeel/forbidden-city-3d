# R55 Zhonghe: low platform and independent seat/screen

Status: source-bounded partial geometry and basic-material work, not a complete hall reconstruction. R54 `edd1d6de15ad1393a45d6da8712e37ac3d8dc388` is the frozen before state. Only the Zhonghe branch in `SquareHalls.js` changes; the shared `PalaceBuilder.throneArea` and every Jiaotai R27/R28/R54 owner remain unchanged.

## Source and limits

Actually viewed the original official 400 x 313 image at https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg (SHA256 `22ef4565e4c0623818aed244cda77aa3fd704d110de5b4496eef4067595d67fe`), identified as Zhonghe interior by https://www.dpm.org.cn/explore/building/236464.html . The duplicate at https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f35f265750.jpg is the same viewpoint, not a second independent source. The display page https://www.dpm.org.cn/show/225723.html is dated 2004-12-22; neither it nor the 2017 file path establishes the photo capture date.

Visible support: a low continuous platform, an independently legged seat with open lower/arm spaces, and a taller central framed backscreen. Unknown: exact dimensions, leaf count, hidden reverse/joinery, carvings, inscriptions, material identification, original inventory and historical date. The product does not use the photograph as a texture or publish its bytes.

All model dimensions are reversible fits inside the inherited 19 m shell. The low platform is 4.56 x 5.2 m, 0.18 m thick, with a 0.025 m thin front fascia; its bottom is the retained visible floor at y=8.63 and top y=8.81. The seat top is y=9.47, its four 0.12 m legs leave a 0.50 m open gap below the seat. The screen starts at the platform top, with a fitted 3.13 m top above the legacy floor datum. No source measurement is asserted.

## Exact removal and retention

The target call no longer creates 14 legacy meshes: two high tiers, gold rim, three stairs, solid block seat/back/two arms, tall flat screen and three flat caps. `tests/fixtures/r55-zhonghe-before.json` gives explicit semantic names and per-mesh attribute/index/material/matrix/shadow fingerprints. The old envelope x=±2.28, z=64.9..71.4, y=8.6..11.6 is removed, not hidden or retained under another name.

Everything else is fingerprinted: complete shell, four open doors/two closed south side doors, veranda, columns, floor, continuous ceiling, roof, both plaques, existing two bronze tripods, actual plinth/four-side stairs/R8 imperial stones. The full R54 Jiaotai mesh and collider lists match exactly, including the R54 three lower-screen extensions. Shared sources are SHA guarded.

The two large generic tripods remain an acknowledged mismatch to the photograph's smaller furnishing relationships. They are retained only to bound this slice, not authenticated or permanently protected. Their later source-led correction is still pending; it does not justify calling this hall complete now.

## Height dependency and physical truth

The old Zhonghe screen bottom depended on the removed high dais (floor+1.25). It is a target object, not an untouchable legacy screen. The whole target screen is replaced with a new screen based on the actual low platform; no hidden pedestal or fake support was added to preserve obsolete bytes. Unlike R54 Jiaotai, this does not require editing a retained screen owner.

Each new collider has one named visible mesh owner. Thin actual parts replace the broad tall ghost envelope. The screen body's AABB has a small conservative upper-crown corner region above floor+2.95, not a floor-to-head invisible wall. The platform has exactly one support equal to its visible upper triangle surface, with `rescue:false`. The inherited hall floor remains y=8.6 for movement and y=8.63 visible; that existing 30 mm difference is recorded, not silently fixed by raising the whole hall. No player dimension/speed, shared collision code or map destination changes.

## Verification and diagnostic limitations

Baseline: 18/19 targeted historical checks passed. The pre-existing failure is `r48-zhonghe-ceiling.test.mjs`'s Jiaotai assertion reading the obsolete `throneArea` hook. With this slice, its Zhonghe hook assertion and R54's historical “Zhonghe unchanged” assertion are also inapplicable. Original files remain untouched, not relaxed to produce green results. New tests prove the bounded delta and exact non-target preservation.

New local tests use actual production hall/plinth geometry, merged meshes, real CollisionManager and FirstPersonControls, default radius 0.5 m, 10/60 Hz, W/S, genuine diagonal inputs, walking/sprint, reverse circuit and actual low-platform step up/down. No waypoint teleport, radius reduction or rescue support is used. The first route diagnostic exposed two test-driver issues: a proposed rear cross-line intersected the retained north folded leaves, and diagonal camera compensation had the wrong sign. The legal route now crosses at local z=7.25 before those leaves; no world geometry was moved to make the route pass. The old diagnostic is retained as such.

`r55-zhonghe-world-check.mjs` consumes the integrator's existing W and optional real Teleport; it does not construct another world or substitute a test asset. Final 93-person global rebind and whole-world gates remain the single integration owner's responsibility.

Same-camera before/neutral/basic-material CPU images and actual-bounds plans are stored under `docs/validation/r55-zhonghe-display`. CPU images show real meshes/base colors, not textures, real lighting, GPU frame time or a browser screenshot. Browser/mobile acceptance remains unclaimed.

## Frozen local result

- Neutral commit: `49d2a41`; 47/47 neutral local checks passed before the palette pass.
- Final basic-material local checks: 48/48 passed. Neutral and final geometry hashes and new colliders/support match exactly.
- Historical targeted result: 16/19 passed, with only the three specifically classified obsolete assertions above failing. All 13 R54 Jiaotai navigation cases and its three still-applicable display cases pass.
- New furniture: 19 meshes / 244 triangles replacing 14 meshes / 168 triangles, net +76 triangles. Complete local hall/plinth: 10,816 to 10,892 triangles. Post-merge resident meshes/materials: 21 to 23; this is a +2 draw-call upper bound, not measured renderer calls.
- Collider count: 151 to 169 (+18); support surfaces: 7 to 8 (+1). Merged attribute storage: +7,296 bytes, index storage unchanged. These byte lengths are not a claim about total JS/GPU residency. All four new private materials and merged geometries dispose once; rebuild is deterministic.
- No new texture or light. Basic colors are broad appearance families, not identified historical materials, reflectance or a detailed decorative reproduction.
- No full-world rebuild, package/build, upload, branch publication, main edit or Pages action was performed by this slice worker.
