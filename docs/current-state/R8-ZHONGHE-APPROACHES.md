# R8 candidate: Zhonghe imperial approaches

## Evidence and bounded correction
- Palace Museum, Liu Hongwu, [Zhonghe Hall](https://www.dpm.org.cn/explore/building/236464.html), consulted 2026-10-18. Describes one eastern/western approach, three southern/northern approaches, with the carved cloud-dragon imperial stone in the middle.
- [Official front photograph](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff05cd7866d.jpg), actual pixels inspected. Shows the central sloping stone flanked by ordinary treads. Image URL has a 2020 upload path; capture date unknown. Temporary visitor barrier is not treated as original architecture.
- Previous model already had three north/south groups, but generated all three as ordinary treads and registered all as walking ramps. The generic stone decoration required a width >=9m, so the 4.6m middle flight had no imperial stone.
- Replace only the two middle groups with closed stone bodies, existing illustrative carving material and low stone cheeks. Keep four north/south side flights plus the two east/west flights, existing hall/terrace coordinates and dimensions. Game traversal uses side stairs rather than the carving. This is a protective gameplay policy, not a claim about the museum's current admission rules.

## Uncertainty
4.6m outside width, .6m rise, .96m run, cheek widths and anchors are inherited model estimates. Stone thickness is a visual approximation. The reused cloud-dragon texture is not a measured scan of these stones. No new surveyed dimensions or current access rules are claimed.

## Budget and navigation
Each replacement is 44 triangles versus 72 previously; same marble/yulu material families, no new texture. Each uses 16 tight slope-following collision bounds and registers no walkable. Net -56 triangles, +16 simple collision boxes, -2 ramps. Existing adjacent stair dimensions and height registrations are unchanged.
Two fixed regression routes now reach the real side stair approach from its built metadata. Historical identity checks normalize only the exact two descriptors and exact four source hunks; originals remain immutable.

## Validation at source checkpoint
- 140 targeted tests passed, including four side-flight round trips with box rescue disabled; blocked central crossing; closed nondegenerate positive-volume geometry; through-hall route and return at 60/10 frames, 5/12m/s; unchanged three-terrace side routes and Taihe south stairs.
- Production build passed. Browser visual/native acceptance remains pending at this checkpoint.
- One accidental invocation of the legacy stepwalk executable without DUMP attempted its unsupported Playwright launch and exited in socket/Crashpad setup before a page existed. No test result was obtained and no process remains. That path will not be retried; ordinary native desktop capture remains the established allowed browser method.

## Ordinary desktop evidence (2026-10-18)
R7 and candidate use identical [0,9.7,37] view, FOV70 / 1180x757 / high, production-byte prefix unchanged. Actual images show the separate patterned central stone; adjacent stairs and building stay aligned. Close low view is appropriate to the stair comparison, not whole-roof proportions.
From one explicit controlled side-stair start [19/3,9.7,47], genuine M then W15s/S15s inputs moved from shared terrace feet8 to veranda feet8.6 and back8. The map remained open. Passive logs show zero collision penetration or application/resource errors. Only this south-west flight was tested natively. Both owned browsers exited and ports closed within cleanup bounds. Full consolidated release checks remain pending.
