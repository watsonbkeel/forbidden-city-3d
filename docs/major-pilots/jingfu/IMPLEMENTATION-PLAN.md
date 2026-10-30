# Jingfu South Gallery Implementation Plan

> Sole writer inline; independent read-only review. Execute established TDD workflow.

**Goal:** Source-bounded five-bay south joinery and open gallery overhead/column form.
**Architecture:** JingfuSouthGallery.js and front-only integration in RemainingNingshouHalls.js; own rollback flag.
**Tech Stack:** existing Three.js/CourtKit/Vite, no dependency change.
**Spec:** DESIGN.md, own official236571/7411 photo.

## Constraints/review focus
No lotus carving/paintings fabricated; unchanged clear doorway; beams clear old columns and head height; exact roof/rear/side/interior parity; no new walkables. Old stair/portal routes and gallery end-to-end path must work.

- [x] Add failing own-source/5-bay windows/door/ceiling/column tests.
- [x] Implement dedicated lower facade and gallery; preserve non-target meshes/physical rows; metadata survives merge/disposal.
- [x] Test actual 10/60Hz walk/run forward/backward south+rear portals and east-west gallery.
- [x] Run cumulative prior packages; finite/budget/clearance tests; independent source/render review.
- [x] Render one production-material CPU crop, compile three bases without public copies, compare aggregate failure names to e494225; local allowlisted checkpoint.
