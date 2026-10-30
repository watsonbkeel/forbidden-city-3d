# R152 Kunning north glazed balustrade pair — implementation plan

> Single writer executes this plan with superpowers:executing-plans. Read-only source/review agents do not modify product files.

**Goal:** Treat the entire visible north stair-side pair of low yellow/green balustrades as one bounded assembly, not invent another gate or declare the whole gate accepted.
**Architecture:** Add one guarded post-build `applyKunningNorthBalustrades(kit,frame,item)` hook to the existing canonical `buildKunningGate`. Preserve every prior mesh, walkable, room/map declaration and collider; stage new geometry/materials and source-matched contact only. First try existing physical primitives; add a narrowly owned source-contact adapter only if genuine controller red tests require it.
**Tech stack:** Existing Three.js / CourtKit / CollisionManager / FirstPersonControls, no dependency or public photo asset.
**Spec/source:** MASTER FC-60FCD2B8CC; https://www.dpm.org.cn/explore/building/236582.html ; personally viewed north/front third photo https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4d9c2b146.jpg, SHA25619369d55a125661e9375b1a3cd3638676cda83d5f6822282eacd8f04662e896f. South/window first photo is a negative orientation control, not a north source. Photography date unknown; URL date is not capture date.

## Constraints / alternatives
- Direct parent19a3022296fee5fb2e7c840dac3701382591dd57; branch feat/kunning-north-glazed-balustrades-20261030. Preserve prior branches/WIPs and six dirty reports. No main/Pages or raw test-log uploads.
- Existing garden/items29 `(1.1,422.7)`, frame rotationπ, north=local-Z. Existing body20.8×6.4, platform22.4×8 at1.2m, north stair10.4 wide/run3.2 with central2.4m stone remain unchanged; all are retained fits, not measurements.
- Photo supports two low yellow/green horizontal parapet groups on pale stone bases and stair-side descending ends. Preserve central stairs; use plain simplified members and bounded fitted pattern, not an exact brick/stone inventory.
- The far eight-character glazed screen walls are a DIFFERENT source-described structure and are not included. Exclude temporary black metal visitor railings, tree supports, signage and flowerpots. Rear join/hidden end detail, exact relief and surveyed dimensions remain unknown.
- Alternatives: decorative-only rail fails real body contact; a full solid tall box around the descending end creates phantom blockers; selected closed members with exact bounded contact. No speculative continuation behind occlusion and no terrain/wall relocation.

## Tasks and checks
1. **Baseline and red tests.** Files `tests/major-pilots/kunning-north-balustrades.test.mjs`; exact-parent fixture from Git. Assert actual raised parapets on both north sides, yellow/green solid members and pale bases; existing south face unchanged. Run red before geometry.
2. **Complete pair generation.** Create `src/scene/palace/special/KunningNorthBalustrades.js`; modify only KunningGate.js hook initially. Guard exact FC identity, retained frame/geometry/support metadata and unique material use; independent staged resource ownership; allocation/late attach/late registration rollback.
3. **Physics and retained access.** Test actual FirstPerson at10/60Hz, W/S walk/sprint across both side stairs, full north-south passage, central stone and stair-edge lanes; blocked sideways crossing, no high-AABB blocker over sloped ends, actual8m drops/exits on both sides. Preserve old support values on non-contact lanes. If scoped contact is necessary, test real eye-vector callers with authoritative feet and live original supports, not direct helper calls alone.
4. **Whole assembly and costs.** Final Float32 merged contacts match visible triangles; closed/nondegenerate meshes, source/material bounds, allocation/rollback and untouched-source hashes. Inspect actual CPU before/after assembly; independent review. No GPU claim.
5. **Final acceptance evidence.** Parent/candidate current-state serial comparison, old Kunning/route regressions with honest obsolete failures, real full-world physics/performance, three-base in-memory Vite identity. Raw outputs outside repo. README maps R151 local and R152 development status; RESULT records fits, original failures and browser/GPU/whole-gate limits before bounded local commit.

## Review focus
- North/south inversion: source first image is rear, frameπ reverses local axes.
- Stair aperture narrowing or platform-edge float: verify finite world bounds and existing 2.8m-offset routes.
- Tall sloped-end collision boxes or top-edge trapping: real high drops and exits, not surface ray only.
- Eye/feet selection mismatch and adjacent low routes: actual horizontal API tests before enabling scope.
- Material/geometry ownership and late event failure: no mutation/disposal of source resources and no orphan new resources.

## Execution rulings
- Source reinspection: slope cap/white toe visible, but partly visible colored under-cap members do not prove either a solid sloping panel or open void. The delivered design is narrowed to the two COMPLETE HORIZONTAL parapets and pale bases; descending bodies AND coping are deferred together rather than presenting an invented open railing. No white slab is invented to fill their unknown body. This does not close the entire north assembly or MASTER gate.
- New original horizontal coping uses three closed stepped bands as a low-cost approximation of a rounded cap, not an exact curved tile profile; broad alternating color fields are not a claimed historical unit count.
- Baseline platform geometry is non-indexed after applyBoxUV, so source guards compare actual attributes/groups rather than nonexistent BoxGeometry.parameters.
- Initial high-drop inward/endward tests incorrectly demanded passage through existing solid guardroom/column bodies. Those directions are now tested for correct blocking plus north escape, not made passable. The safe parent independently proves that direct lateral travel toward the stair at this exact Z also intersects its retained inner column. Test that real obstruction and subsequent north escape; do not move the column or add a controller exemption. An experimental local scope did not change this real obstruction and was removed; no shared controller change remains.
