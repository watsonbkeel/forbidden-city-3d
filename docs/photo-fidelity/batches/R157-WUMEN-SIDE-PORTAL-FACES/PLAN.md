# Wumen two side-portal front finishes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Single implementation writer; independent Astra review.

**Goal:** Restore the two individually photographed yellow flat-lintel face subdivisions and stone inscription surrounds in the actual game model, without inventing inscriptions or altering portals/physics.

**Architecture:** A Wumen-only helper appends one owned group per east/west side mouth after the existing lower base. Local horizontal/vertical face coordinates transform to each existing courtyard-facing wall. Front finish depth is at most 15mm, an explicit nonphysical engineering skin, not a measured lintel cross-section. Existing solids, doors, studs, origins and support remain unchanged.

**Tech Stack:** Existing Three.js/PalaceBuilder, node:test, existing CPU exporter.

**Spec / approval:** Parent 2026-10-31 13:39 UTC approved this bounded real repair. Alternatives considered: isolated tall main columns (rejected after independent source/interface review: unbound column-head/ceiling/beam levels); more isolated leaf studs (less useful than paired portal faces). Neither rejected alternative is implemented or added as another study.

## Global constraints
- Baseline db1f6d26; do not change main, roof, column grid, base, door dimensions or original colliders/supports.
- Left photo supports eleven divisions. Right photo is compatible with an eleven-panel fit, but its last two boundaries overlap water stains and remain weaker evidence; no claim of eleven independently resolved right-side panels.
- Each fitting uses that side's source points, retained model opening width and explicit uncertainty. No mirrored damage, copied photo texture, inferred hidden backs, inscription glyphs, or current-condition claim.
- Sources remain private. Frame centre remains neutral/inscription-unreconstructed, not a claim that the real plaque is blank.
- Default enabled real entry. Pure visual skin is not a new climbable ledge or whole portal reconstruction.

## Review focus
- East/west facing normal and mirrored horizontal coordinates: actual world-normal and physical wall-plane tests.
- Missing/extra/hidden faces, pose/UV/material drift: independent expected meshes and real mutations.
- Existing whole-gate records/physics and 69 studs: immutable pre-change signatures in open/closed poses plus predecessor replay.
- Shared resources/duplicate invalid host: preflight rejection with no allocations/side effects; disposal checks.
- Actual merged production geometry and raw five routes: no preview installer, full-world geometry/physical consumer after component acceptance.

## Task 1: Registered exterior face component
Files: create `src/scene/palace/special/WumenSidePortalFaces.js`; modify only `WumenLowerBase.js` import and final append. Create `tests/photo-fidelity/batches/wumen-side-portal-faces.test.mjs` and dedicated fixture/helpers.
- [x] Freeze original source and open/closed recorded fields before modifying production.
- [x] Write and run actual-entry missing-two-groups RED, retain TAP.
- [x] Build explicit two owners, each 11 individually fitted yellow panels plus stone surround and neutral field, no text. Contact existing wall; no movement with door hinges.
- [x] Verify true geometry/normals/effective visibility, absence of additional physics, full non-target records, counterfactual/mutations/lifecycle.

## Task 2: Production acceptance and preservation
- [x] Render paired before/after CPU through full production component with corrected single-material exporter; clearly not GPU/photo acceptance.
- [x] Preserve real old-contract reds; propose only narrowly authenticated compatibility if required, retaining original gold and historical source identity.
- [x] Run real merged World + five routes/physical retention with parent-coordinated heavy slot; necessary regressions/builds. Results retain inherited full/batch reds, not all-green.
- [ ] Independent review, truthful archive/index, development checkpoint and delegated backup. Whole-object completion remains zero.
