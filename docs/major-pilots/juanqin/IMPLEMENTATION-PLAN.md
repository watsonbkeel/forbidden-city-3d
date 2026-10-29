# Juanqin East Front Implementation Plan

> Sole writer inline, TDD and independent read-only review.

**Goal:** One complete east-five-bay frontage/approach package and factual roof palette correction.
**Architecture:** JuanqinEastFront.js; selective front-bay skip; independent rollback flag.
**Tech Stack:** existing Three.js/CourtKit/Vite, no new dependency.
**Spec:** DESIGN.md and official236478 own exterior0/2.

## Constraints/review focus
Preserve existing door width, east/west partition and loft voids; no new upper destination; no invented art; seat/rail must not obstruct original entry or gallery; preserve all non-target meshes/physics, roof shape exact despite palette correction.

- [x] Red geometry tests for source/door/windows/entry stairs/roof colours and non-target preservation.
- [x] Implement dedicated facade/gallery seats/entry stair+solid rail and green roof dispatch, retaining yellow edging and restoring legacy label over door.
- [x] Actual controller entry/stair wing loops10/60Hz walk/run both directions; explicitly diagnose inherited non-through gallery and retain usable midbay strips, plus cumulative previous packages.
- [x] Finite/positive volume/collider envelope/lifecycle checks; one actual material CPU crop and independent review.
- [x] Three bases shared code-only build, unchanged aggregate failure set versus4589569, document boundaries and local checkpoint.
