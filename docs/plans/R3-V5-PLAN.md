# R3 V5 implementation plan: terrace-side access and honest preview UI

Base: published V4 `c602b1d88d4d4edc96b740202ff76fe0eb53e75c` (tree `275a89cd49f62bfffab09907416cd17dcf977c02`). Isolated branch `feat/r3-v5-terrace-routes`. Main, production and V1–V4 remain untouched. Baseline Node suite: 195/195.

## Scope and evidence

Add only the common three-hall terrace's east/west waist stair flights. The 1960 Palace Museum scaled plan and 2020 museum photograph show this access south of Zhonghe's centre. Independent scan picks support an approximate 8m relative offset, but registrations differ around3m and outer width reads approximately5–6m. Adopt z58m and outside width5m as explicit engineering assumptions, not surveyed coordinates or verified clear width. Preserve all hall anchors and inherited tier heights/outlines; this does not complete R2-04 or current visitor-access validation.

Primary sources: https://img.dpm.org.cn/Uploads/File/pdf/c7/92/ed/c792eddcdca8356377637b90520bce08.pdf and https://img.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf . Reference photos/PDFs remain research-only, outside deployed assets.

## Implementation sequence and ownership

1. **Bounded rendering prerequisite:** apply the existing exact opaque-solid covered-face proof only to the four SideGate assemblies, before material merging. Capture actual closed box primitives; never use arbitrary bounds as solids. Keep all visible members, surviving attributes, transforms, collision/walk/room/map metadata and material identities. Preflight saves3,174 base triangles; actual V4 trace projects6,348 Taihe submissions saved. Leave Qianqing and terrace-body pruning untouched.
2. **Three-hall-specific side stair profile:** six closed17-tread flights, two sides×three tiers, using existing tier edges and 1.2m landings. Reuse existing marble and rail materials. Split only relevant waist wall/rail intervals; retain the visible retaining masonry behind the flights. Mesh, collision openings and ramps share one explicit profile. No river, unrelated terrace, hall plinth, global anchor or collision rescue change.
3. **Usability and evidence notice:** make inherited settings usable in short-height viewports with bounded scrolling and reachable controls. Keep genuine quality toggles correct. Show a concise in-game structural-preview/current-access distinction and a dated source explanation. The 2026-07-31 Taihe Gate works notice is not a live closure feed or evidence of reopening. Official notice: https://www.dpm.org.cn/announce_detail/379422.html . Do not represent game access as museum visitor permission.
4. **Freeze and verify:** unchanged original six cameras×60 frames and P2+10% budgets; all prior routes/point sequences preserved, new ground-origin round trips added. Actual desktop/mobile/short-height clicks, keyboard/scroll/focus, source links and dismiss/resume behavior. Same-camera terrace approaches, top view and real orthographic supplemental projection; independent source/geometry review.

## Budget and acceptance

Recommended stairs+rail openings add1,056 base / projected2,112 submitted triangles. Combined with the four-gate prerequisite, projected Taihe change is−4,236, yielding956,837 and4,770 whole-triangle headroom. These are preflight projections, not acceptance. Wumen must retain206 calls or fewer. No budget reset, camera change, dropped exterior face or hidden shadow is allowed.

Red-first tests must demonstrate missing access in V4, then complete ascent/descent from outside the toe at ground level, all three intended ramps/landings, and continued Zhonghe veranda access. Test both sides,60/10fps,slow/fast,reverse and negative side/under-platform/rail approaches. Diagnostic removal/displacement of ramps must fail despite inherited box rescue. Original56 automatic and33 fixed identities/points remain intact. Original Shenwu11m failure stays disclosed; its position and5m tolerance remain unchanged.

V4's195 tests,29 browser checks,356 standard walks,34 supplements,6×60 performance and portable-byte parity passed, with only the inherited anchor failure in the aggregate gate. This new branch must earn its own acceptance before publication.
