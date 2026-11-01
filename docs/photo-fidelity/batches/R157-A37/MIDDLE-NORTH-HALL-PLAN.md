# 中左／中右北门廊限定明造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace only the unsupported flat underside above each gate's central north porch with its independently observed open timber layers, without claiming the full gate or hidden framing accepted.

**Architecture:** Add one identity-scoped refinement called after MiddleAxisFacades. Keep the existing roof exterior, column/door/facade geometry, collider and walkable arrays byte-identical. Derive the replacement underside and curved members from the existing tile triangles; do not substitute another gate's roof or infer hidden joints.

**Tech Stack:** Existing Three.js 0.162 geometry, CourtKit material merge, Node tests/CPU diagnostics; no dependency or network changes.

**Spec:** MIDDLE-AXIS-GATES.md and the independently inspected official local images `identity-research/zhongzuo-north-near-u.jpg`, `zhongyou-north-u.jpg`; parent instruction to continue the original 37 objects using verified own evidence.

## Global Constraints
- Internal R157/A37 checkpoint only; whole-object accepted count remains 0/37.
- Sole production writer; independent reviewer remains read-only.
- No main/push/Pages action in this checkpoint; preserve the preceding rollback commit.
- No new floor, support, doorway, collider, NPC/water exception or side-bay reconstruction.
- Retained 12.4m width/6.4m depth/.45m floor and north porch depth are engineering fits, not source measurements.
- Begin only after the east-rail/shared-controller checkpoint has terminal regression evidence and a safe commit.

## Review Focus
- Identity mismatch/changed roof must reject before resource allocation or source geometry mutation (Task 1 tests).
- A cut flat ceiling must not expose sky or protrude timbers through retained tile surfaces (Task 1 ray/containment tests).
- South/end ceilings, exterior roof triangles and all original navigation must remain exact (Task 1 hashes).
- Borrowed materials/shared geometry must survive replacement and dispose once at merge (Task 1 lifecycle tests).
- Door leaves/central and near-jamb walking must remain usable in both independently bound gates (Task 2 actual routes).

### Task 1: Bounded north-middle roof refinement

**Files:** Create `src/scene/palace/special/MiddleNorthVisibleHall.js`; modify `MiddleAxisFacades.js` only for the own-identity hook; create `tests/photo-fidelity/batches/middle-north-visible-hall.test.mjs`.

**Interfaces:** `fitMiddleNorthVisibleHall(kit, frame, {zoneId,itemIndex,item}) -> group|null`; exactly axis-courts items12/14, names/positions already checked by MiddleAxisFacades. Other identities return null. The component exposes metadata `wholeObjectAccepted:false`, independent own source image/group, retained-unmeasured dimensions and bounded visible scope.

- [x] Write and run the red integration test: each own central north upward ray no longer hits the old 7.25m horizontal cap; both source IDs remain distinct; all other gate targets unchanged.
- [x] Write and run red validation/retention tests: one roof group with finite eaveY/topY, one rafters mesh with exactly four old flat triangles at7.25, one tile mesh; changed footprint fails before mutation; old outer roof and nonflat underside exact.
- [x] Implement the clip within local x=[-2.35,2.35], z=[.30,3.0] only. This bound stays inside the inherited central north porch, not a measured historical interval. Preserve every other cap triangle; generate a reversed inset underside directly from actual retained tile faces. Before adding timbers, verify the clipped region has complete positive-area tile coverage; fail closed if it does not.
- [x] Add independently documented coarse red rafters and only the visible transverse/longitudinal painted support types. Keep their envelopes beneath the actual tile surface and above existing clear headroom; no floor posts, full purlin census or hidden tenons. Use continuous low-sided rafter meshes rather than repeated closed-cylinder segments. Record member density/section as engineering fit, not photo-count certainty.
- [x] Run the component tests, roof upward-ray grid, containment, exact physical hashes, non-target object fingerprints and source/merged lifecycle; all must pass. Record measured source/merged meshes, triangles, buffer bytes and unavailable GPU metrics.
- [x] Request independent geometry/source-boundary review before accepting this task. Do not commit an opaque/colliding roof fit merely to satisfy count tests.

### Task 2: Integration evidence and rollback checkpoint

**Files:** Reuse `scripts/photo-fidelity/batches/r157-a37/middle-axis-routes.test.mjs`; add a bounded cost/CPU exporter alongside existing batch scripts; update MIDDLE-AXIS-GATES.md and STATUS.json only after actual results.

**Interfaces:** Uses Task1's scoped metadata and real ZoneBase production construction; no test-only production branch.

- [x] Run the existing 24 real middle-gate centre/near-jamb walk/sprint roundtrips against both prior checkpoint and candidate.
- [x] Run all batch component tests plus the existing middle-gate consumers; retain and classify historical failures rather than rewriting golden snapshots.
- [x] Render and inspect actual candidate/parent geometry from each own north and upward viewpoint; label CPU/base-color output as non-GPU/non-photographic acceptance.
- [x] Run all three in-memory build bases and the project current-state command serially; report exact terminal results and any failed names.
- [x] Record remaining north porch dimensions, side bays, hidden structure, ramps/rails and runtime gaps; no whole-object closure increment. Selectively commit only the scoped production/tests/docs, retaining the prior checkpoint for rollback.

## Outcome / boundaries
- Internal checkpoint only: 10 north-hall tests, 17 combined middle-gate component tests, 72 all-batch component tests; original 24 parent routes and final24 candidate routes pass. Three build bases543 modules each.
- Full current-state terminal1331 /1113 pass/218 fail, no cancellations; not green. Exact names and saved-parent comparison limitation in MIDDLE-NORTH-REGRESSION.json.
- Ruling: fit hook moved before facade mutation, after identity/envelope checks, to ensure invalid roof cannot leave changed walls/doors/materials/colliders. Existing metadata spread preserves new scope. Independent ancestor-transform and integrated-failure findings have red→green tests.
- All eight CPU base-color north/up views inspected. Not browser/GPU/photographic acceptance. Entire gates still unaccepted, batch0/37. No main/Pages changes or remote push.
