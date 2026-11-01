# B group: practical implementation record

Baseline: `99e3d29c5d29699d9b143e2d8a9316d04d4a1aea`. Worktree branch `feat/r157-halls-20261101`.
Policy: source-recognizable major shapes and usable routes; disregard <0.3 m discrepancies that do not impair travel. No survey/GPU claim from code checks or CPU diagnostics.

## 1. Historical tests

Commit `46ad4c0fe66100bce72cbc3244ffac9782a2eb01` keeps all assertions/test names, moving unavailable historical imports into the two dependent tests. Current component tests now execute: 6 pass; historical 064ecb27/fde9a95b tests honestly fail (2). No parent code substituted or skip introduced.

## 2. Taihemen lions

- Restored and visually inspected actual Museum front/east/west photographs, 1941 drawing, and published size sheet page 97.
- Official size sheet: lion 2.355 m; bronze pedestal 2.765 x 2.035 x .635 m; together 2.99 m, excluding stone. Other nearby 1.37/1.41/2.01 m figures describe Cining qilin, not these lions.
- Own plan shows rectangular bases with longer north-south dimension; source-pixel centers (1306,1085) east and (623,1085) west. Use existing column-based scale. Small readout uncertainty deliberately not iterated.
- Created distinct east male/ball and west female/cub; bronze-green material, stepped pale stone base, bronze pedestal/cloth, seated anatomy, mane, mouth, collar/bell. Not a replica of fine relief; stone height 1.10 m is a visual fit.
- Component tests first failed because module absent; after implementation 3/3 pass. Two CPU actual-geometry views were rendered and inspected: pair readable as distinct seated lions with ball/cub, unobstructed central approach. These are NOT browser screenshots.
- Actual geometry counts: east 12,824 triangles; west 13,424. Eight bounded colliders per lion; no new walkable surface.
- Ruling: leave installation to the shared-file integration owner. Existing six-fixture C promotion tests demand identical *entire* object tree; adding real new objects intentionally invalidates that old whole-tree equality. Do not forge a replacement historical candidate or quietly mix lions into the original six fixtures. Use explicit new ownership to review the retained six-fixture subtree and separately assert the installed pair.

Research files are external at `../halls-evidence-0132`; source URLs and SHA-256 will accompany group handoff. No copyrighted source photos embedded in the game.

## 3. Baohe west terrace/wall and outer joins

- Independently registered west three-tier edges: 64.13 / 58.60 / 53.50 m (lower/middle/upper), replacing the old generic upper 28.85 m only on this side.
- Public-entry patch uses real solid/deck/walkable west bounds, removes the obsolete interior west rail, adds northern edge extension while retaining original central north stairs. Axis wall19 begins64.85 instead40.5; gate79.4 and outer end110.7 remain fixed.
- Dedicated west wall joins25.3 to64.85 with three coping elevations7/9/11.3 m; these are rounded game-scale fits from recorded own-source study, not a survey. A2.4 x2.6 m aperture and folded-north leaves preserve normal passage.
- Existing east profile/body/door preserved. Both neighbouring visible7 m walls receive a targeted physical-height patch rather than a global physics change.
- West module3/3 passed. Candidate shared dispatcher5/5 passed: visible/support consistency, clear new courtyard, outer edge guard, actual CollisionManager walk/run-sized steps in both door directions, east and north controls retained. Baseline beforepatch failed4/5, as expected for absent new geometry.
- Outer-wall physical-height tests failed2/2 beforepatch, passed2/2 afterpatch. Actual ZoneBase gallery dispatch/merged identities additionally passed2/2.
- CPU west south/north/door diagnostics rendered and inspected. They crop atX23 and exclude much of the halls; cropped roofs must not be mistaken for complete hall screenshots.

## 4. Baohe linked galleries

- Restored and inspected Museum magazine2020/10 p54: own labelled east gallery photograph clearly shows arched masonry cross-firewalls and a continuous covered front walk; text describes six sections/seven walls in the paired wings.
- Replaced neither entire zone nor generic CourtKit: a dedicated two-ID module retains existing axes, footprint,0.45 m floor and approximate39-bay density. It adds six roof sections, seven arched cross-walls and real covered front circulation; rear room envelopes remain closed, inventory unknown/not fabricated.
- Ruling: six sections on each game wing are an explicit topology fit, not an assertion of a newly surveyed per-side count/locations. Retain this uncertainty as minor source refinement rather than block the recognisable exterior and usable covered walk. Fine carving and exact wall stations deferred.
- Two independent IDs, front facades face the central court. Full-length front routes passed in both directions at.4/.8 m CollisionManager steps;3/3 component tests passed.
- CPU veranda/overview inspected. Found coplanar arch-stone overlap in diagnostic; stone ring now projects.04 m on each side; the red masonry aperture is cut to the ring's outer radius, eliminating duplicate intrados faces. This is a visual defect fix, not a precision-fitting campaign.

## 5. Retained work / known old failures

Nine existing component test files ran serially:97 tests,93 passed,4 failed. No affected retained production file was edited by this branch. Failures retained, not hidden:
1. Hongyi old bounded triangle-reduction count, after prior explicit window-leaf geometry.
2. Taihe core geometry file cannot load its historical R29 Qianqing fixture because current data/anchors.json differs from the old exact hash.
3-4. R48 Zhonghe/Jiaotai ceiling tests intercept the old generic throneArea path, now bypassed by their newer dedicated settings; `options` undefined.

The passed checks include Taihe interior entry/side routes at10/20/60 Hz walk/run, both surveyed pavilions and Hongyi window-route checks, Taihemen porch/inner enclosure, and full current Taihe wall pair components. Do not call the mixed retained run all-green.

## Final focused checkpoint

2026-11-01 UTC: all five new test files ran serially against the explicit shared-patch candidate:18/18 passed in1.87 s. The new intrados-ray assertion first failed on both galleries, then passed after the masonry cut. Re-rendered both gallery CPU views and inspected the near arch: the duplicated red/stone inner surface shimmer is gone. No World/build/GPU process was run here. Shared production files remain unchanged in this worktree; integration patch passes `git apply --check` on the recorded baseline.

## Astra follow-up: lion motifs face the central axis

Code/source cross-check confirmed the lion groups have translation only: east ball/raised paw must be local+X and west cub/raised paw local−X. Flipped only those local X placements; base positions, all collider records, walkables and shared integration patch are unchanged. Two new world-geometry direction tests first failed, then the entire lion component file passed5/5 (2026-11-01 UTC). Logs: `taihemen-lion-inward-{red,green}.tap` under the external evidence root. The previously recorded lion CPU PNGs are explicitly **pre-correction** for this left/right detail; do not use them as proof of final motif orientation. No World or additional CPU run was needed for this local reflection.
