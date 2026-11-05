# Xuanshou south-front implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add one source-bounded K19 south-front exterior in a separate ad0 workspace.
**Architecture:** One private builder stages geometry/resources/physical records before publication, one exact outer-west hook, no shared generator/physics changes. All retained compound records and objects are immutable inputs.
**Tech Stack:** Existing Three.js/CourtKit/TriangleSupport and Node tests, no dependency changes.
**Spec:** docs/superpowers/specs/2026-11-05-xuanshou-south-front-design.md

## Global Constraints

- Base ad0f3086e32d8f101bb29c1a7a7b04fc441861ab. This independent branch does not change any other release candidate.
- Full geometry/colliders x284.8–296.0/z439.8–448.2, including hidden ornaments and sloping stair stones.
- Closed exterior only; no room/map/interior teleport, fake plaque, furniture, invisible ramp or shared source changes.
- Preserve all old host objects and data; collision/route conflict stops the increment.

## Review Focus

- Defaults exceeding reserve: inspect every actual world vertex and collider, not declared body dimensions.
- Allocation/publication interruption: no partial ownership or borrowed-resource disposal, clean retry.
- Apparent step support: compare registered support to visible stone tops and true sloping cheek triangles.
- Closed unknown interior: original approach return remains safe, frontal motion stops at actual closed façade.
- Roof/beam gaps and decorative overlap: real mesh rays against final sampled triangles, no analytic-only acceptance.

### Task 1: Component boundary and visual/physical contract

**Files:** create src/scene/palace/special/XuanshouSouthFront.js; create tests/r165-xuanshou-south-front/{fixture.mjs,component.test.mjs,geometry.test.mjs,lifecycle.test.mjs,route.test.mjs}.
**Interface:** buildXuanshouSouthFront(kit, zone) returns false outside outer-west; otherwise returns {frame,meta}; export deeply frozen XUANSHOU_FRONT_FIT.
- [x] Write and run failing missing-builder tests for exact source IDs, preserved old state, full reserve, actual three bays/front terrace, no interior/map and strict host guards.
- [x] Implement staged private builder and exact closed shells, grey provisional roof/yellow edge, sampled bearing, three real treads and sloping sides.
- [x] Add allocation/material/publication failure and mutation controls, resource ownership and duplicate/retry checks.
- [x] Run component/geometry/lifecycle/10&60Hz step-return tests serially; capture counts, real bounds, triangle costs and CPU front/context/underside images.

### Task 2: Minimal integration and retained compound evidence

**Files:** only exact import/call in src/scene/zones/ZoneBase.js; source-boundary and scoped integration tests under the new test directory.
- [x] Freeze ad0 source/records and actual retained five-item compound before implementation; do not refresh mixed snapshots.
- [x] Add only the new outer-west builder call; prove retained mesh/physics prefix identity and no new/old contact, actual exterior observation/return route.
- [x] Verify final material merge/flight geometry and once-only ownership; add real old-mesh/contact mutation negatives.
- [ ] Finish bounded cumulative integration under an independently scheduled window. Actual complete outer-west/public-ad0 preservation, two R48 outer-west cases and independent component review are completed; formal cumulative combination remains pending.

### Task 3: Delivery evidence

- [x] Record exact changed-file hashes/source fingerprint, RED/GREEN commands, image provenance and source limits.
- [x] Keep all formal counts separate from repeated focused/diagnostic runs. No complete/mergeable/deployed claim without corresponding logs/readback.
- [x] Keep integration and publishing separate from component acceptance. No unrelated cleanup or refactor.
