# R77 Wall Crenellations Implementation Plan
> For agentic workers: execute with superpowers:executing-plans.
Goal: correct all four outward supported crenel rows without changing navigation.
Architecture: explicit outwardSide passed by buildOuterWalls; addWallSegment and addWallSegmentZ use supported .3t offset only. Three.js existing geometry and merge remain unchanged.
Tech Stack: JavaScript, Three.js, Node tests, Vite.
Spec: ../specs/2026-10-24-r77-wall-crenellations-design.md
## Constraints and review focus
No wall/gate shifts, no deletion, no main/Pages. Keep north gate opening, Wumen cap notches, 886 retained dimensions and explicit 22-slot Wumen gap, collider identity, lifecycle. Exact historic wall-top dimensions remain unknown.
## Task 1
- [x] Capture original actual outer-wall entity inventory.
- [x] Write and observe failing four-orientation support/count and exact-delta tests.
- [x] Add explicit outwardSide to each segment call and replace .7t with .3t centers.
- [x] Run targeted geometry/Wumen tests and freeze small candidate commit.
## Task 2
- [x] Compare actual fullworld collision/walkable/room/map identity against R76.
- [x] Run cumulative routes, map/flight/NPC/night tests, current-state known-failure comparison and build.
- [x] Freeze exact successor evidence, one backup and final disk margin; obtain independent review before parent upload.

Review correction: initially supported row intruded existing Wumen folded ascent. Add red geometry-clearance test and omit exactly 22 slots within existing cap-interface x60..97.9 both sides; retain 886 shifted crenels. All final runtime evidence must be rerun after this correction.
