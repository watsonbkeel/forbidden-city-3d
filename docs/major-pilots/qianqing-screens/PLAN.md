# R150 Qianqing paired screen segmentation implementation plan

**Goal:** Correct the existing paired screen hierarchy, front fields and base layers, retaining the established footprint and lateral paths.
**Architecture:** Split the existing inline wall block into a dedicated generator; no changes to general movement, roofs or other gates. Lower only the connecting segments to a provisional 6.4 m (0.8 of the retained 8 m outer-wall top). Register the actual final Float32 cap triangles through the existing explicitly scoped roof-contact path, with existing segmented wall blockers ending at the body rather than an invisible flat roof. The first plain triangle-support trial failed cap-edge exits and remains external evidence.
**Tech:** Three.js, Node test, production CollisionManager/FirstPersonControls.
**Spec:** Official https://www.dpm.org.cn/explore/building/236473.html and its two photographs https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c38de7.jpg and https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c3db52.jpg (personally viewed). The wording gives 8 m / 9.7 m, not segment measurement boundaries. Photos support lower inner walls and clipped outer front fields; not surveyed dimensions or reproduced flower species.

## Constraints and review focus
- Direct source parent dd13d7b; preserve 90d/a3e WIPs, dirty historical reports, delivered branches/main/Pages. No raw reports in commits/uploads.
- Retain 3.1 + 6.6 m plan and 30° fold as inherited fits, not validated footprint. No invented return wall, fine floral relief, back-face reconstruction or whole-gate acceptance.
- East front is local +Z, west front local -Z: rays must test both.
- Short connector stays rectangular; main front field clipped corners and tiered base; cap/medallion remain schematic.
- Real high drops currently pass through the old unsupported caps to floor: test actual controllers and exact generated cap contact, not visual-only edits.
- Existing door/bridge/palace routes and batching/lifecycle remain intact. Compare all unaffected geometry and physical records with the parent.

## Tasks
- [x] Write and run red tests for differing cap heights, front corner material zoning and actual cap high-drop contact.
- [x] Add QianqingGateScreens.js, replacing only existing screen loop; preserve cap/material ownership and production batching. Use 6.4 m short / 8 m main tops, fit-tagged metadata.
- [x] Verify independent rays, all non-target geometry, side/rear routes, cap drops/exits, material merging/finite triangles and allocation cost.
- [x] Run targeted integration, full suite vs safe parent and three-base in-memory compile. Keep raw outputs outside repository.
- [x] Independent review; update README R147/R148/R149 exact remote mapping and reserve R150; checkpoint only after required evidence is recorded with remaining limits.
