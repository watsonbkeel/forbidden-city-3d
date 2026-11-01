# Donghua folded ascent implementation plan

> Native implementation in isolated r158-donghua-madao-1533; review by parent-appointed Astra and integration owner.

**Goal:** Add the surviving Donghua north/south folded horse ramps, with physical foundations and guarded ascent/descent.
**Architecture:** One dedicated geometry module called by EastWestCityGate; use existing CourtKit ramps/boxes and unmodified Collision/FirstPerson. Keep original gate anchor, tunnels, tower and wall.
**Tech Stack:** Three.js, existing CourtKit, Node CPU World tests.
**Spec:** Parent-approved 2026-11-01 15:35 design: both sides where clear, masonry-supported two runs and landing, limited upper platform route, no unbacked wall-top access. Original 9.3 m deck is retained engineering fit, not a survey dimension.

## Sources and boundaries
Primary Palace Museum authors Zhang Yaping/Fan Xuan, 紫禁城东华门马道的分析研究, pp461–462, https://www.cactch.org.cn/webfile/upload/2021/02-09/09-55-430520991296728.pdf . Figures1/2 separately identify south/north; both have two runs and middle landing. Upper/lower widths roughly8/6m; slopes12/13 degrees. Guards are masonry, south lower1.17m/north lower1.665m, upper.925m. Xihua ramps are demolished: no Xihua addition. Preserved physical fabric does not establish present visitor opening.

## Steps
- [x] Scan actual World collision occupancy in both proposed ramp footprints, excluding no real obstacles.
- [x] Write and run failing tests for two source-bound folded ramps, solid support, guard collision, no Xihua changes.
- [x] Implement DonghuaMadao.js and single builder hook, replace only gate-top guard segments at the two ramp mouths; do not move walls.
- [x] Verify real controller north/south ascent and descent at10/60fps walk/run, original three portals and external/fall negatives. Raycast real visible support and finite geometry.
- [x] Run focused inherited gate regression and build, retain evidence, submit independent commit for review/integration. No main/branches mutation.

## Review focus
Tower solid and columns cannot be traversed; upper deck rescue must be false above portals; middle landing must not be floating; guard intersections must not block ascent; ramp exterior cannot leak into wall/river. No fabricated interior, hundreds of microscopic ridges or sub.3m polishing.

## Authorized local-contact refinement
Initial60fps sprint descent exposed0.419m foot lag. Parent approved only existing BPrincipalStairContact reuse: strict new Donghua host, separate seven-surface source JSON, unchanged inherited groups and unchanged FirstPerson/Collision. Final real World14 routes remain passing with peak foot-ground gap0; two native jumps and missing/duplicate/changed/forged support negatives pass. No change to geometry or CPU views in this refinement.
