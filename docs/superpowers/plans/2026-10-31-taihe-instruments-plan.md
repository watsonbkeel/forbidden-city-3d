# Taihe Instruments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. No subagents in this task.

**Goal:** Source-bounded sundial and Jialiang stone assemblies with visible-geometry collision.
**Architecture:** Add one independent module; no production caller edit. Tests inject a temporary test-only PalaceBuilder method hook to replace only the old two instruments. Existing TriangleSupport supplies exact narrowphase/support.
**Tech Stack:** Three.js, Node test, existing CollisionManager/FirstPerson.
**Spec:** ../specs/2026-10-31-taihe-instruments-design.md

## Global Constraints
- Base3e9d5c92; no shared source writes, integration or publication.
- Own official photographs; all lengths/hidden shape fits explicit. No unseen measure, relief or text.
- Original centers; max 1.6×1.6×3m fitted boundary; no broadphase box used as solid through openings.
- No global controller/Collision changes, new materials/texture assets, dependencies or rescue surfaces.

## Review Focus
- Retained item identity and translated parent offsets fail closed before writes.
- Windows remain open to small geometry probes, with normal body blocked only by real nearby stone.
- Every visible solid has exact triangle collision/support, including thin needle and roof.
- Unchanged objects and exterior bypasses remain byte-identical/unobstructed.
- Merge and dispose retain correct geometry/material ownership.

### Task 1: Source-bound two-instrument module
Files: create `src/scene/palace/special/TaiheTerraceInstruments.js`; test `tests/photo-fidelity/batches/taihe-terrace-instruments.test.mjs`.
Interface: `buildTaiheTerraceInstruments(builder,parent,{y,zf})` returns dedicated group and appends only its own triangle colliders. Finite retained local input, zero-scale source-independent fixed fit. No caller hook in production.
- [x] Red: missing builder, actual part topology, source metadata, exact per-solid faces, open-center and stone negatives.
- [x] Minimal module; re-run green.
- [x] Triangle normals/closed manifold/contact/merge/dispose; source-mismatch/duplicate calls atomic reject.

### Task 2: Test-only whole-world hookup and movement
Files: test helper `tests/lib/r157-taihe-instruments-fixture.mjs`; test `tests/photo-fidelity/batches/taihe-instruments-world.test.mjs`; docs hook summary.
- [x] Test-only method hook captures original ornament subassembly, removes exactly four legacy meshes and two old colliders, then calls new module. Other primitives/colliders compare exact.
- [x] Run original platform exterior routes both directions10/60Hz and source-shape support/negative probes.
- [x] Head/foot/top/air controls; no visible-stone penetration or empty-hole broadphase block.
- [x] Frozen focused suite and independent module bundle; full current-state was stopped on parent request to avoid memory contention (incomplete log preserved). Full application three-base build and all-state baseline comparison are deferred to central integration; no golden updates.
- [x] Parent handoff with source/candidate hashes, limitations and hook suggestion.
- [ ] Independent Astra review and full integration gates are parent-owned, not completed by this candidate.
