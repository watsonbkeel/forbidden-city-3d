# R90 北端门墙与通路协调 Implementation Plan

> For agentic workers: use superpowers:subagent-driven-development or superpowers:executing-plans. This is preparation only; no project source has been edited by this research task.

**Goal:** Correct the demonstrably simplified Shunzhen gate/wall topology, keep northbound and return travel continuous, and keep map, geometry and collision in agreement without shifting the palace north boundary.

**Architecture:** One bounded, explicitly fitted Shunzhen three-portal profile supplies visible gates, wall interface width, collision and one map identity. Preserve Shenwu, outer-wall and corner-tower global coordinates. Do not turn this into a reconstruction of the Chengguang/Yanhe/Jifu courtyard.

**Tech Stack:** Existing Three.js/CourtKit/ZoneBase, Node tests; no new dependency or generated large assets.

**Spec:** User-approved R90: 御花园、顺贞门、神武门和相邻北墙连接、开口及地图落位；不整体移动北墙 11 米；连续往返、门墙无穿插、地图碰撞一致。Parent narrowed scope again at 10:19 UTC: courtyard remains future work; never close the existing tour route merely because the Museum describes Chengguang as currently closed.

## Verified baseline, not a claimed defect

- Existing source snapshot: R89 branch, committed runtime basis 1b24a2f4; R89 writer continues independently. Rebase/copy this plan only after R89 final freeze.
- `data/zones/garden.json`: garden north wall Z=518.3, X=-68..68; Shunzhen center (0.5,518.3), generic single wall gate w=5, h=5. Generic gate returns outer width 7.8, depth 3.5, jambs 1.4 each. North-wall gap already resolves to that **outer** width rather than the clear aperture, so do not "fix" it to 5 and create overlapping piers.
- `src/config/constants.js`: Shenwu (0,542), nominal city platform 50.18×26.46; outer north wall skin Z=547, thickness 8.6, center Z=542.7; palace east/west skins X=±376.5. Shenwu ground south/north faces Z=528.77/555.23. Upper-platform walkable top is 10.3.
- Modeled nominal free strip between Shunzhen generic north face (520.05) and Shenwu south face (528.77) is 8.72 m. This is model-derived, not a measured historic street width.
- Local collision world tests, 0.05 m step, radius 0.5: Shunzhen→Shenwu exterior at Z=557.23 and return PASS; Shenwu east/west ground tunnels and return PASS; north street X=-60..60 at Z=524 both directions PASS. Evidence `current-route-probes.json`.
- Arbitrary rear-garden transverse test at Z=512, X=-20..20 hits the Duixiu rock collider. It is NOT a north-wall failure and must not justify deleting the rock or opening a fictional route. Evidence `current-obstacles.json`.
- Minimap already obtains Shenwu from PALACE_LAYOUT and teleport Z from LAYOUT, not the stale independent Z=531 anchor. Do not invent a current map displacement. Its outer-wall outline is schematic; whole-map redesign is outside this release.
- `docs/current-state/SHENWU-POSITION-REVIEW.md` documents the unresolved 11 m independent-anchor difference. Retain the failure/evidence; do not alter coordinates or tolerance just to pass it.

## Source evidence and limits

1. Official Shunzhen page, read 2026-10-25: https://www.dpm.org.cn/explore/building/236543.html . Establishes three tiled wall gates, north street opposite Shenwu. This is enough to reject the current one-gate topology; it supplies no numerical spacing/widths.
2. Official image inspected: https://img.dpm.org.cn/Uploads/Picture/dc/8401.jpg . Local `shunzhen-official.jpg`, 318×400. View from Shenwu frames the middle gate: red doors and walls, yellow roof, green glaze/frieze. Side gates are outside the useful frame, so do not claim this image measures the three-gate spacing.
3. Official Jifu photo link, located but pixels not inspected: https://img.dpm.org.cn/Uploads/Picture/dc/8402%5B1024%5D.jpg . Not needed for R90; courtyard excluded.
4. Official Shenwu page, read 2026-10-25: https://www.dpm.org.cn/explore/building/236456.html ; image https://img.dpm.org.cn/Uploads/Picture/dc/1531%5B1024%5D.jpg . Preserve existing three tunnels and researched upper shell. No new dimensional conclusion.
5. Existing official survey references in SHENWU-POSITION-REVIEW concern city-platform/column-grid sizes, not shared global control points. They do not resolve the 11 m discrepancy.

No image redistribution or literal page-text copy is needed in the public release. Preserve URL provenance. All new side spacing and widths must be labeled `ENGINEERING_FIT_NOT_SURVEY`, not measured or accepted.

## Global constraints

- Work cumulatively after the final R89 commit, on isolated R90 branch; R88 and R89 rollback preserved. No main or Pages change by the implementation worker.
- Preserve all NPCs, emperor route fixes, water broadphase optimization, night sleep, existing garden rocks/ponds/routes, Shenwu tower and outer wall geometry.
- Do not add/close Chengguang/Yanhe/Jifu gates in this release; do not infer present visitor access from playable state.
- Do not add three separate map labels named 顺贞门. One identity, three actual clear apertures.
- Geometry, collision and resolved wall cut must be emitted by one profile. No special collision exclusions or teleport rescue.

## Review focus

1. A generic gate width is outer wall-interface width, not clear aperture; all three gate piers must meet the remaining wall without tiny see-through gaps.
2. All three door leaves in playable-open pose must be physical and clear; no hidden whole-assembly box may seal the middle gate.
3. Width changes must update the single map outline and teleport approach. Repeated zone load/unload must not duplicate labels or colliders.
4. Low-frame-rate sprint and reverse movement must cross the same doorway without clipping jambs or walking through adjacent masonry.
5. Touching the garden north wall must not change Shenwu/corner tower positions, north boundary, Duixiu routes or night NPC counts.

## Task 1: Dedicated bounded Shunzhen topology and wall interface

Files:
- Create `src/scene/palace/special/ShunzhenGate.js`.
- Modify `src/scene/palace/kit.js`: dedicated dispatch only.
- Modify `data/zones/garden.json`: same named gate/center, add explicit profile and three-wall-portal kind; same north wall reference.
- Create `tests/r90-shunzhen-topology.test.mjs`.

Interfaces:
- `shunzhenProfile(item)` returns immutable center, portal centers/clear widths, body envelopes, wallInterfaceWidth, depth, fit status and source URLs.
- `buildShunzhenGate(kit,item)` returns wallInterfaceWidth; adds one named map rectangle and three portal assemblies with metadata.

- [ ] Write RED assertions: named profile has exactly 3 clear portals; existing center (0.5,518.3) unchanged; one map identity; finite joined geometry; wrong name/center/profile kind rejected.
- [ ] Run test and retain the specific RED cause (current profile absent/one portal). Do not use the already-passing axial route as the headline RED.
- [ ] Implement a bounded first-pass engineering fit: preserve central clear width 5 and height 5; retain 1.4 m generic piers and 3.5 m depth; use side clear widths 3.6, centers at local X=±7.1, yielding side outer widths 6.4, assembly outer width 20.6 and exact shared interface edges at local X=±3.9. This is a deliberately disclosed layout choice, NOT extracted from the cropped photo. Absolute portal centers are -6.6,0.5,7.6. Keep ground level; avoid inventing raised foundations/steps.
- [ ] Preserve yellow roof/red door treatment and add only plain green-frieze bands visibly supported by the center reference. No invented detailed iconography, fake text, or precision claims. If a later wider official image contradicts this fit, revise it and record why before release.
- [ ] Return 20.6 to the existing garden north-wall gap resolver; draw the wall to the three-gate outer ends, not through individual openings. Keep one total rectangle and one label for the assembly.
- [ ] Run topology/masonry/door-leaf collision tests and commit a scoped change. Review exact source delta to confirm no other generic gate changes.

## Task 2: Full-world route, map and retention coverage

Files:
- Create `tests/r90-north-world-routes.test.mjs` using actual `buildR52World` and `replayTerrace`.
- Create `tests/r90-map-contract.test.mjs` using production map/teleport fixture.
- Extend test-only `tests/lib/world.mjs` gateGeom for the new profile if route enumeration requires it; do not change unrelated geometry estimates.
- Create `docs/current-state/r90-north-connections/{DESIGN,VALIDATION}.md` and `reports/r90-north-connections/`.

- [ ] Before source change, save the existing eight passing direct route probes in this folder, plus fingerprints of Enclosure and Shenwu colliders/meshes. The latter must remain unchanged.
- [ ] At 10/30/60 FPS, walking and sprint, traverse center from (0.5,512) to (0.5,557.23) and return. Also cross new side portals at X=-6.6 and 7.6 from Z=512 to524 and back, then join Shenwu tunnels at X=-13/0/13 via north street Z=524. Test actual sides of jambs remain blocking.
- [ ] Connect both sides of the retained garden route to Z=512 without crossing Duixiu; reuse R84 authored safe paths rather than a straight line through rocks. Do not change R84 to accommodate a new gate assembly.
- [ ] Assert north street (-60,524)↔(60,524) retained and Shenwu exterior Z=557.23 remains inside legal boundary (center max559.5).
- [ ] Map tests: one 顺贞门 item at (0.5,518.3), width/depth from profile; Shenwu at (0,542); both selected targets have collision-free approaches, same after repeated zone leave/reenter. No name ambiguity in `Minimap.canTravelToPlace`.
- [ ] Run existing Shenwu exit/ground-door/tower tests, R77 wall retention, R84 garden routes, and R89 focused suite. Record old historical source-retention failures separately; do not rewrite old fixture hashes to hide deltas.
- [ ] Run current-state aggregate and root plus /gugong production builds against final source. Publish only scoped results, not device/GPU acceptance.
- [ ] Update README/change history with three-gate correction, unchanged global positions, exact fit disclosure, tests and outstanding screenshot/device review. Produce same-camera diagnostic before/after views if available; label CPU diagnostics honestly.

## Done boundary

R90 is complete only when the three-portal representation and north-wall cut agree, all actual forward/return routes are retained, and release notes distinguish engineering-fit dimensions from sourced topology. Existing axial passage is already usable and must not be advertised as a newly repaired blocked route. The courtyard and absolute geodetic correction remain deferred, not quietly added.
