# Leshou South Front Implementation Plan

> Native sole writer; execute task-by-task with TDD and final independent read-only review. Parent approved DESIGN.md on 2026-10-28.

**Goal:** own-source seven-bay south joinery and broad paired stair/stone approach, preserving circulation and cumulative versions.
**Architecture:** dedicated `LeshouSouthFront.js`; `RemainingNingshouHalls.js` selects it only for Leshou front and independently skips old front panels while keeping rear/side output exact. Rollback `kit.leshouSouthFront=false`.
**Tech Stack:** existing Three.js/CourtKit, no dependency.
**Spec:** `DESIGN.md`, official 236470 and own front/oblique/detail pixels.

## Global constraints
No main/push/deploy, no unseen interior reconstruction; retain 18.7 m ridge and existing room/floor/bearing topology. No photo textures or invented relief. Fitted dimensions/counts/door pose labeled. Existing Yangxing package and other halls unchanged.

## Review focus
- Narrow center stone borders must not obstruct the retained 2.8 m access: test body and controller loops.
- Step supports match visible geometry at both outer wing extents: assert finite support and no invisible platform.
- Three window bands must fit below beam and not intersect own plaque: world bounds test and CPU inspection.
- Rear/side output and every non-Leshou hall are exact: mesh/physics hashes against switch off.
- New material/provenance survives actual merge and releases once: lifecycle test.

## Tasks
- [x] Red tests in `tests/major-pilots/leshou/front.test.mjs`: own package record, 7 bays / three bands, 4 five-rail leaves, broad stairs plus center, switch isolation; run and verify missing features.
- [x] Implement `buildLeshouSouthFront(c,{front,iw,h})` and `buildLeshouSouthApproach(c,{x,z,y,width})` in dedicated helper; front-only integration in facade/buildLeshou/platform; minimal matching geometry/colliders.
- [x] Green geometry/rollback/material tests; retain untouched original Yangxing tests.
- [x] Real full-zone readyScene/export and controller loops for left/center/right ascent and return, 10/60 Hz × run/walk × forward/backward. Fix diagnosed failures with reproducing tests.
- [x] CPU captures with actual materials; view front, oblique, door, steps and rear. Read-only independent review.
- [x] Full current-state concurrency 2 compared to frozen 216 failure names; three-base builds/fingerprints. Document limitations and local checkpoint with own allowlist only.
