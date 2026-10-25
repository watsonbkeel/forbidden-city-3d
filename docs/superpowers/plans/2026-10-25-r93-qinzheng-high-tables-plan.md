# R93 Qinzheng Qinxian High Side Tables Implementation Plan

> For agentic workers: use superpowers:executing-plans or superpowers:subagent-driven-development. READ-ONLY PREPARATION; wait for parent's final preceding-release base and implementation assignment.

**Goal:** Add the two photo-supported tall floor-standing side tables outside the north kang, retaining the two low tables ON the kang, the low footstool, west-room routes and R88 east room.

**Architecture:** Dedicated permanent-B augmentation after existing Yangxin west rooms/footstool. Its own tagged visible solids/supports and metadata; never regenerate the GLB or replace the whole west room. Adjust the navigation fixture route only if actual furniture requires a safe local approach, not by deleting collisions.

**Tech Stack:** Existing Three.js, CourtKit, InteriorLoader, real GLTF/controller test harness. No new assets/dependencies.

**Spec:** Approved R93: photo-supported higher side tables and their north-kang/seat relation, preserve low footstool/R88 east, contiguous main hall–west room return, correct collision and repeated streaming.

## Actual pixel evidence

Viewed full official image `r63-f-audit-notes/yangxin/private-source-cache/2-stivNCrFc313.jpg` (1368×1824), SHA256287f93b8f36d80dd3087c40db7d2896e4fc09c73145d921165d4b39f55c485af. URL https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg ; building page https://www.dpm.org.cn/explore/building/236442.html . URL date is not capture date.

Photo clearly contains FOUR tables: two low long tables standing on the kang and two taller, roughly square floor-standing tables OUTSIDE its ends. The four tops are approximately similar world height; “high” refers to floor-to-top height/long legs. Do not stretch the existing low tables upward. Outer tables have dark wood, top, apron/leg structure and lower stretchers. Small vessels, inscriptions, fine carving and species identification are outside this release.

## Actual current code and coordinates

- `src/scene/palace/special/YangxinWestWarmRooms.js`: Yangxin origin(108.6,277.5), local +X west/+Z north; floor=.62. Qinzheng clear box X[9.14529064,14.69673892], Z[-5.55,-.15]. Kang X[9.95,13.25], Z[-2.05,-.25], top1.27. Low-table top1.92, footprints X[10.05,10.58] and[12.62,13.15], Z[-1.8,-.5]. Preserve all these.
- Actual room route currently includes [14,-3.2]→[14,-1.1]→[16.3,-1.1]. West door center(14.93080296,-1.1), width1.6 (clear Z[-1.9,-.3]). A high table beside west kang can obstruct the current turn. This is a design constraint, not permission to shrink radius.
- `QinzhengFootstool.js`: local X[11.15,12.05], Z[-2.64,-2.10], top.76; 5meshes/5colliders/1support. Retain exact geometry.
- `RemainingResidentialHalls.js`: augmentation dispatch owns permanent room/footstool calls. Add the new helper immediately after these and include metadata only; no change to unrelated halls.
- R88 GLB and `src/scene/interior/InteriorLoader.js` are protected. `tests/r88-west-streaming-successor.test.mjs` has actual S fixture, full-body triangle clearance, 10/60Hz walk/sprint and zone disposal examples.

## Proposed bounded fit, not survey

Dedicated `QinzhengHighSideTables.js` exports frozen plan and `buildQinzhengHighSideTables(kit,item,f)`. Two unique east/west roles. Candidate floor-standing footprints: east X[9.32,9.85], west X[13.35,13.88], Z[-.80,-.30]; baseY=.62, topY=1.94, top thickness.055, leg width.06. Width=.53m, depth=.50m, height1.32m are reversible compatibility fits against retained3.3m kang, NOT measured antique dimensions. Validate against actual S floor/geometry before accepting; metadata must disclose S floor≈.667337 embeds lower feet≈.047337m just as retained footstool.

The existing [14,-1.1] turn would intersect the west stand. Candidate collision-free route moves the transverse doorway approach south to Z=-1.35, then crosses to X16.3; this gives0.55m center-to-jamb and0.55m center-to-table margins (0.05m beyond radius0.5) in the nominal rectangle model. Robust actual-geometry tests must verify these margins. Prefer a smaller table depth/northward fit or alternate smooth path if needed; do not enlarge the doorway merely to force this plan. Save final chosen dimensions/path after testing. Preserve room spawns and other doors unless an actual failing test proves a scoped adjustment necessary.

## Global constraints

No whole-hall GLB edit, no new decorative inventories, no typography replica, no replacement of two low tables, kang/seat/footstool/window/front facade; preserve R88 east bytes and transforms. Permanent B ownership only; never add once per S load. Use one dark wood material, <=24 meshes and <=288 box triangles total for both simplified tables, exact solid parts and one registered top support per table. Do not model entire empty under-table space as an opaque collider. Private official photo is not a release asset.

## Review focus

1. West high-table leg/apron/top must not block the1m-wide player at the two-turn Sanxitang doorway.
2. Lower legs must reach actual B floor and remain coherent with streamed S floor; no floating tables or new floor patches.
3. Free flight can land on tabletops: visible load-bearing tops need real supports and stable exit, no rescue/teleport.
4. Three repeated S loads/cancellations/unloads and zone exits must not duplicate/dispose permanent-B furniture.
5. No accidental change to low tables/footstool or R88 east asset while updating metadata/test expectations.

## Task 1: Photo-grounded furniture with RED/GREEN geometry tests

- [ ] Add `tests/r93-qinzheng-high-tables.test.mjs`; RED must be absence of two distinct floor-standing tables. Assert existing low-table/footstool/seat fingerprints unchanged, table tops near existing low-table height, finite dimensions and unique ownership.
- [ ] Create the dedicated helper, identity guards and duplicate-build rejection; plain top, four legs, shallow apron and lower stretchers, with matching per-part solids and top supports. Reject invalid identities/duplicate install.
- [ ] Add bounded dispatch and metadata to RemainingResidentialHalls; do not broaden generic furnishing behavior.
- [ ] Test B floor contact, supports, solid/visible equivalence, direct side collisions and under-top space. Keep exact final fit in source/validation. Commit only scoped implementation/tests.

## Task 2: Actual B/S route and streaming acceptance

- [ ] Add `tests/r93-qinzheng-world.test.mjs` using actual R88 Yangxin S GLTF fixture and live production CollisionManager. Run old route first to capture specific furniture blockage if present; then choose/test the final locally adjusted approach.
- [ ] Full hall entrance→east passage→Qinzheng→Sanxitang north/south→return at10/30/60Hz walk/sprint, actual radius.5; sample actual rendered-body triangles every<=.08m, and check no rescue support. Register final route without moving room walls.
- [ ] Test tabletop landing and walk-off under B and actual S, player proximity to both stands and footstool, all navigation spawns/doors clear. No collision exclusions.
- [ ] Repeat S load/unload/cancel three times, then real west-six zone unload/reentry three times: exactly2 high tables,2 new top supports, fixed collider counts, materials disposed exactly once when B owner leaves; unchanged R88 S proxy count.
- [ ] Run original R53/R63 scoped tests plus R88 successor and asset-preservation checks, R89–R92 regressions; keep old exact-source fixture failures separate rather than update hashes blindly.
- [ ] Same-camera CPU before/after north-wall view and annotated plan. Inspect pixels for four-table relationship and clean walking strip. Do not call it browser/GPU or measured-photo acceptance.
- [ ] Record version changes, uncertainties, tests and baseline-failure delta; root+/gugong build, production package and independent review before parent upload.

## Done boundary

Two new correctly supported floor-standing tables, preserved existing contents, usable west-room routes and lifecycle; no claim of full decorative restoration or actual-device acceptance.
