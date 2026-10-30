# Fanhua South Front Implementation Plan

> Sole writer inline TDD; independent source/code/render review.

**Goal:** Seven-bay two-level south joinery, lower gallery soffit and central approach while retaining previous own-source balustrade/fascia.
**Architecture:** Dedicated FanhuaSouthFront.js plus optional south skip in twoLevelFrame, default unchanged.
**Tech Stack:** existing Three.js/CourtKit/Vite; no dependency change.
**Spec:** DESIGN.md and own official236572 exterior0/3/4.

## Constraints/review focus
Actual door width unchanged; all six floor holes/room partitions preserved; no upper access; no overlap with old fascia/rail; no invented devotional inventory/art; every visible stair side physically represented.

- [x] Add red source/field/door/approach tests and exact old fascia/rail/non-target parity.
- [x] Implement two-level front joinery, plain gallery coffers and central low stairs/stone panels; independent rollback.
- [x] Geometry/collider/positive-volume/ceiling-clearance/disposal tests and real controller entry/stair-side loops10/60Hz all gaits/directions; cumulative prior five objects.
- [x] One production material CPU crop, inspect all views, independent review; no artificial artwork acceptance.
- [x] Reuse three code-only bases, exact fingerprint and parent aggregate failure-name comparison; document and local checkpoint only.
