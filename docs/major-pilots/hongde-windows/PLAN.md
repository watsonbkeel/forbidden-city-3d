# R153 Hongde paired sill windows implementation plan

> Single writer executes via superpowers:executing-plans; independent agents review only.

**Goal:** Replace both existing opaque generic side-window boxes with source-informed three-leaf, two-field connected rectangular fretwork assemblies. Not a new building or whole facade completion.
**Architecture:** Isolated post-build `applyHongdeSillWindows(kit,frame,profile)` hook; exact two source boxes only, original closed-window physical envelope and all other runtime state preserved. Transactional staging/rollback, closed opaque recessed surrogate rather than invented historical transparent glass or interior.
**Tech:** Existing Three.js/CourtKit, private procedural geometry/materials; no assets/dependencies or controller changes.
**Spec:** MASTER FC-D0970B114A; https://www.dpm.org.cn/explore/building/236553.html and own photo https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4b10ccc6f.jpg (SHA256 af00d3b38b2b6b4b6d9ab80cce380d428385c1584c0ad95297a55b9858eaee09).

## Decisions and limits
- Safe parent3d1fd4956afd878de0058a8d5b0ea1536f13ea9d. Existing R75 building binding `(37.5,326)`, floor .14, facadeZ -3.6, side centers ±16/3, width16/3-.35, height2.5, centerY2.19 all retained fits, not survey.
- Photo/text establish two side sill windows. Independent photo count shows THREE leaves per side, each upper/lower, not four central door leaves. Left innermost leaf partly column-occluded; detail/hidden joints and fret proportions remain fitted.
- Only the pair of lower side-window groups. Separate small upper transoms, central door/flanking panels, roofs, porch columns, uncertain court elevation, east small gate and interior remain unchanged/unaccepted.
- Keep central virtual open access despite photographed closed doors. No imported black visitor barriers or stone yard artefacts.
- Alternatives: leave texture (fails geometry fidelity); fully transparent/open lattice (would invent material/interior and change closed-window contact); selected real connected fret/frame over bounded opaque dark infill surrogate, clearly not a material identification or exact carving.
- Infill and all fitted trim stay in exact original two source boxes; original colliders retained. No new footprint or support.

## Tasks
1. Write actual-mesh red tests for two three-leaf/two-field groups and genuine connected strokes. Verify parent fails before implementation.
2. Add isolated helper and one hook. Guard exact profile, frame/root, two unique nonindexed UV-correct source meshes and exact matching colliders; reject altered/shared/duplicate sources. Stage before deletion, restore source arrays/order on late failure, dispose private additions once; repeat call no-op.
3. Tests: exact non-target mesh/material/UV/pose and whole physics/rooms/map preservation; visible front/back/edge rays, finite nondegenerate geometry, all twelve fret fields reach their frame and stay inside source; opaque inset distinct from fret face; real parent/candidate production-controller central/side routes, window blocking and high drop at10/60Hz; real full-world routes; resource lifetime and final merged cost.
4. Inspect actual CPU before/after and independent review. Run old R75 tests, serial exact-parent/current standard suites, compare ordered statuses, and three-base write:false compile identity. Preserve raw evidence outside repo; README/RESULT concise facts/unknowns; commit bounded files only.

## Review focus
- Do not transfer the central four-door count to side windows.
- Preserve non-target central flank panels and small transom omissions honestly.
- No disconnected rectangle ornaments, coincident crossing faces or texture pasted over old window.
- Unknown glazing not silently called historic paper/glass; prior solid-window body remains solid.
- Shared resources, sealed/intercepted metadata or late registration failure must not corrupt original source.

## Execution rulings
- Initial same-aspect nested rings plus central cross looked like targets in actual CPU view and contradicted source. Rejected that visual variant after independent source inspection; a new red test requires clear vertical inner cores and upper/lower lightness separation. Selected vertically narrow inner rings joined via offset end bridges; exact hidden bridge endpoints remain topology fit, not recovered joints.
- Source upper panes are lighter than lower panes. Use neutral gray upper/lower infill, not universal black, without claiming glass/paper or historical transmission.
- An initial route fixture sent boolean false instead of the helper's `keyup` string; its stuck movement persisted into high-drop phase. Corrected the fixture call, not production movement. All four genuine high-drop variants then passed.
- Snapshot fixture encountered the pre-atlas plaque's null material; record null faithfully rather than changing production or omitting its geometry.

- Actual final merge discards arbitrary vertex color attributes. A real merged-lightness RED proved the proposed single-material shading failed; changed to two private infill materials (plus frame), +3 final material meshes, leaving shared MergeUtils unchanged.

- Independent review found end bridges overlapped the middle frame bar with coplanar front/back faces. Actual same-depth ray RED reproduced it; trim only those bridge ends to the existing rail inner edge, retaining ring geometry and source bounds. Whole trace verifies bridges now touch rather than overlay the frame.

- Final all-zone 10Hz west-boundary route stopped 2.4cm before the old waypoint. Exact safe-parent replay has the identical complete diagnostic, while all original physics is byte-preserved. Keep the failing route visible (7/8 both), do not weaken its threshold or alter production movement in this visual scope.
