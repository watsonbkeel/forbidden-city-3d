# Xianfu south ensemble Implementation Plan
> Single-writer native execution; use executing-plans; independent read-only final review.
**Goal:** source-bounded three-bay south enclosure fit without changing physics or access.
**Architecture:** Dedicated XianfuSouthVisual helper called only from exact xianfu-front profile. Validate all retired geometry/ownership before detached allocations, then atomically replace visual windows/private leaf finishes and exact front-band triangles. No shared algorithms.
**Tech Stack:** existing Three.js, node:test, Vite memory-only compiler.
**Spec:** DESIGN.md.
## Constraints / review focus
Unrelated halls unchanged; no array-material merger hazard; original draw/UV/normals and source-owned geometry disposal; canvas-null fallback; no accidental new physical scope; no partial mutation on validation/allocation failure.
## Tasks
- [x] Write real composition test against current baseline, observe missing feature red.
- [x] Add dedicated helper and exact hook; verify two four-field windows, retained leaves, source band faces.
- [x] Test refusal mutations/lifecycle/canvas pattern fallback; parent source geometry/physics/unrelated whole-zone retention.
- [x] Compare actual World routes and high presets to real safe parent; serial focused/shared/navigation/residential groups, record old failures.
- [x] Memory-only three-base compilation, cost receipt, independent review, frozen final RC and scoped local commit.
