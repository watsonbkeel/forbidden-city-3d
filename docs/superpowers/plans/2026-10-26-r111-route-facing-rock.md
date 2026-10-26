# R111 Route-facing Rock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Approved single inline writer; independent reviewer and root release gate.

**Goal:** Try one route-visible low-face rock support replacement, rejecting weak or costly output rather than claiming the whole rear mountain complete.
**Architecture:** A local module consumes the actual OuterRock build and replaces one proven full rectangular cell union with a shared closed face mesh. Existing cap render attributes remain; coplanar physics caps may be exactly domain-equivalent simplified faces.
**Tech Stack:** Three BufferGeometry/Float32, existing TriangleSupport, Node evidence and actual CPU triangle export.
**Spec:** docs/superpowers/specs/2026-10-26-r111-route-facing-rock-design.md

## Global Constraints
R110 final05c3e7f8 baseline; no shared physics/geometry algorithm changes. One candidate, ≤160physics triangles target, no hidden support or external rock skin. Unknown historical shape remains engineering fit. Runtime remainsR110 minor untilR115. Below500MB pause large outputs for root cleanup.

## Review Focus
- Equal projected area alone cannot prove disjoint cell union: explicitly check complete grid occupancy and pairwise interval partition.
- Separate render cap subdivision from physics cap domain; exactFloat32 plane/edge coverage, not tolerance resemblance.
- Old internalcell faces must all disappear; adjacent oldowners remain unchanged.
- New slopes can create feet/head constraints despite inward replacement; true-body local trajectories and escape required.
- Rendering improvement must be visible from actual route, not only privileged rear camera; query cost separately measured.

### Task1: Source proof and baseline
Files: scripts/r111-rocks/inventory.mjs, tests/r111-rocks/source-union.test.mjs, reports/r111-rocks/baseline.
- [x] Fresh exact owner/cell inventory from current runtime.
- [ ] RED source mutation/incomplete grid/crossing cell rejects; GREEN exact168-cell grid/cap domain proof.
- [ ] Record fixed productionGarden route/side before images and source hashes, not synthetic replacement-only pictures.
- [ ] Commit proof before candidate.

### Task2: One shared closed candidate
Files: new src/scene/garden/DuixiuSupportRock.js; integration src/scene/garden/DuixiuOuterRock.js; tests/r111-rocks/shared-domain.test.mjs.
Interface: applyDuixiuSupportRock(build) returns build with one explicit profile evidence entry, all otherowner/source data unchanged.
- [ ] RED old planar side has no changed normal/shape; capped physics budget and exact outside/top attributes assertions.
- [ ] Implement narrow selectedunion replacement, canonicalfold Float32 vertices, retainedcaprender plus exactdomainphysicalcaps.
- [ ] GREEN closed positive mesh / same fold renderphysics / unchangedsource tests; commit candidate.
- [ ] Same-camera visual review before any large movement/performance matrix. Reject immediately if no useful visible gain.

### Task3: Limited physical and cost acceptance
Files: scripts/r111-rocks/local-motion.mjs, cost.mjs, docs/current-state/r111/VALIDATION.md.
- [ ] Independent local movement/pressure/194protectedposes and unchangedowner proof.
- [ ] Serial five paired finalR110/Garden build plus localnear-contact query metrics; preserve every sample.
- [ ] Root explicit performance/visual acceptance or exact runtime restore; retain rejection evidence.
- [ ] Single root compilation only for accepted runtime module; R115 full cumulative gates later. Freeze minor and unique uploader handoff.

Timebox: initial source/visual value gate approximately45min; if geometry identity requires generalCSG/large mesh index work, stop and report rather than silently consume second-major window. RemainingR112–114 whole-group inventories stay open.

## Stop decision — 2026-10-26 17:00UTC
Writer and independent reviewer reject the sole b87d visual candidate as broad triangular retaining panels, not natural stacked stone. No second parameter round, no movement/cost matrices. Restore exactR110 runtime/build inputs and archive all candidate fixtures outside active tests. All five residual groups remain incomplete; R115 must disclose.
