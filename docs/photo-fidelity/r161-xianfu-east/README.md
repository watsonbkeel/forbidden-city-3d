# R161 咸福宫后殿东配殿：官文三间最低素壳

Original `FC-10404CAA2A`; base `8c7688f04fa09c312d583b207e55c205684457a6`. Only new production `src/scene/palace/special/XianfuRearEastWing.js`. Suggested normal hook `buildXianfuRearEastWing(this.kit,this.kit.root.name)` before ZoneBase finish, west-six only. Author did NOT install normal hook/build or run full suite.

## Evidence and honest fitting boundary

Official https://www.dpm.org.cn/explore/building/236583.html says Tongdao-front court east/west wings EACH THREE bays between Xianfu front hall and Tongdao rear hall. Generic https://www.dpm.org.cn/explore/building/236507.html independently confirms these rear wings. This does not name their roof type or specific door/window pattern. Main hall and ears are separate objects.
No independently identified own EAST front photo used: `ownPhoto:null`, `ownViewpoint:null`, `facadeVerified:false`, `roofTypeVerified:false`, `wholeObjectAccepted:false`. Gallery18017 used for already-built WEST is NOT EAST facade evidence. No borrowed green/pale windows or same-photo mirror claim.
Minimal three-bay red closed body with two coarse closed central leaves/solid side panels, yellow hard-gable roof, all dimensions/location/rotation and hidden elevations are explicit engineering fit, not photo/survey verification. This shell creates a visible courtyard volume and a reachable exterior platform, NOT an open room, whole palace or current admission claim. No well/pedestals/furniture/plaque/fine lattice/interior.

## Real body / unique reserve

Centre `(132,443.3)`, rot `-PI/2`, faces courtyard/game +X. Body6.6×3.2, platform7.4×.2×3.8 and real step2.4×.1×.4. Unique complete reserve `X[129.5,134.5], Z[439.4,447.2], Y[0,5.5]`. Actual roof/profile is measured from generated geometry, not a naïve footprint or real-site survey.
16 per-mesh triangle owners +2 actual stone Boxes =18, two exact real tops `rescue:false`; 0 contact/virtual support/rooms/maps. Existing continuous ground0 participates near the step edge; no claim of full same-height support across entire footprint.
Old front EAST item48(z419.1), Tongdao item47, Xianfu front item46 and already-built rear WEST FC-41ADF461CA remain distinct and untouched.
Normal preflight `loadAll:false`, west-six/garden/axis-courts+global, not every zone: old visible triangles/owners/tops/water intersection0. Fixed start `(138,440)` native clear. Sixteen non-route back-edge radius.5 body diagnostics remain red, not converted into a route or allbox-clear claim.

## QA / scope

- Seven real missing-builder RED tests before source; then component7+local1 green. Actual mesh triangle owner streams, bounds, real Boxes/tops, actual-library UVs, registration guards and one-time disposal checked. No late-publication rollback claim.
- One AUTHOR loader-injected candidate World, not normal production hook. BEFORE/AFTER all old west-six geometry/UV/index/matrix/materialcolor, colliders/supports and room/map/region data preserved exactly, including latest rear WEST and both Yongshou wings.
- Old fixture first-three-point gate-approach substrings only, not full hall entry: Yongshou `(87.4,300.4)→(95.4,300.4)→(95.4,307)` and Xianfu `(142.5,406.2)→(150.5,406.2)→(150.5,411.7)`, each return,30walk/run=4/525frames.
- Fixed院内 `(138,440)→(134.8,440)→(134.8,443.3)→return`,30walk/run=2/135frames. Original six660frames arrived/peak0; full route objects hard-preserved from scan. No postscan route/box change.
- New `(134.8,443.3)→(133.85,443.3)→return`,10/60walk/run four68frames (5/5/29/29), peak.10384865380157157; all arrive. Complete World/local objects including end compared after run; native final body clear/feet0. Two closed-door/back-wall negative routes refused. Closed shell not room access.
- Two CPU geometry z-buffer images personally viewed. Material fallback swatches only, NOT HD/GPU/mobile screenshots. No source geometry changed after test.

Raw `/tmp/r161-xianfu-east-1448` and official source HTML only/tmp. No source photo invented or included. Scripts have fixed outputs: integrator must copy, change base/output and remove author injection in favour of one normal hook; do not overwrite raw. Normal hook/build remain integrator's gate. Existing World diagnostic title `YongshouRearWest` is inherited label only; actual executable builder/base/zone/points/output here all EAST Xianfu.

Final evidence: actual bounds `[129.62232637405396,-1.49e-9,439.5999999523163]..[134.37767362594604,5.332399845123291,447.0000000476837]`; preflight86089 old potentially intersecting triangles. BEFORE/AFTER4126 old meshes/1682 colliders/108 tops exact. The same XZ column above Y5.5 has35 old roof triangles, minimum whole-triangle vertexY6.4757761955, conservative≥1.1433763504 above new maximum; not unlimited upper clearance. New four complete World/local objects including end are exactly equal.1036 CPU export triangles include12 QA ground,1024 production.
