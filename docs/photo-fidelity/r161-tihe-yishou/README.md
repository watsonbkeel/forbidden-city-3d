# R161 体和殿院益寿斋：独立西配殿外壳

Original `FC-0C3B33AC86`, NOT Changchun rear-court namesake `FC-E17AD83491`. Base `d03c1ec0afb9309d679b59dea5c5dce57a874cac`. Only new production `src/scene/palace/special/TiheYishouWing.js`; normal hook `buildTiheYishouWing(this.kit,this.kit.root.name)` immediately before ZoneBase finish, west-six only. Author did NOT install normal hook, run full suite or build.

## Own evidence / bounded fitting

Official page https://www.dpm.org.cn/explore/building/236529.html explicitly titles the image “体合殿益寿斋”; prose places wings in front of Tihe. Own image https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4542d504c.jpg (1295559 B) personally viewed: three-part facade, closed middle group, red upper lattice/pale lower side windows with green borders, grey platform/short steps. Only coarse shapes/colors used; no plaque carving, fine lattice, bronze vat/crane/railing or interior.
Official vpDetail vp3076/group57 names “益寿斋”; its hotspot links explicitly name “翊坤宫后殿西配殿（益寿斋）”. Thus WEST identity is a named official link, not a mirror guess, distinct from Changchun namesake. File paths/dates do not establish photography date.
All coordinates and dimensions, compact depth2.4, hard-gable roof/hidden ends, exact leaf/window subdivisions/colour/porch and low steps are engineering fits, NOT measurement. `facadeVerified:false`, `roofTypeVerified:false`, `wholeObjectAccepted:false`. New body is closed: no current admission/whole-building or room-access claim.

## Fixed body and preservation

Centre `(112.1,394.2)`, rot PI/2, 6.6×2.4 three-bay body. Real platform7.4×.2×3, one real step2.4×.1×.4(localZ-1.7), face recess-.6. Roof actual parameters w6.6/d2.4/base3.5/H1.5/overhang.5. Exact bounds `[110.12232527732849,-1.49e-9,390.4999999523163]..[114.0776747226715,5.332399845123291,397.9000000476837]`, single reserve `X[110.1,114.2],Z[390.4,398],Y[0,5.5]`.
34 per-mesh triangle owners+2 real stone Boxes=36; two exact `rescue:false` tops,0contact/virtualsupport/rooms/maps. No claim that a whole footprint at the step edge is uniformly on one top; continuous existing ground0 remains.
Original Yikun paving maxX110.05 versus roof min110.1223 is a .0723 geometry gap, NOT a player path. True step toe110.2 and original player lane109.2 allow actual native route clearance. Back gap also not a new path. Original front WEST item17 at z367.3, main Tihe item15, Yikun/Chuxiu source geometry, all route metadata remain unchanged.
Same XZ upper column above5.5 intersects13 old triangles, full-triangle vertex minY6.700000003 versus newmax5.332399845 gives≥1.367600158 conservative separation. Not a general upper airspace claim.

## Honest first RED and fixed QA correction

Original scan `scan.mjs`/`scan.log`/`scan.json.gz` exited1: original Chuxiu architecture entry[4] `(108.9,412)→409→395` walk/run both remained at initial point60frames,feet.469999999,speed0. No candidate existed; candidate-box old actual triangles/owners/tops/water already0. Do NOT call this new-body blockage or pretend original entry passes.
Authorised one lightweight normal west-six COMPONENT diagnosis (not second full World) positively identifies unique native blocking old item26 south gable Box `[107.76,.45,411.05]..[114.8,3.45,411.75]`; visible redwall sameXZ,fullheight5.2372. Actual starting body `[108.4,.819999999,411.5]..[109.4,2.119999999,412.5]` penetrates it by .25m inZ. Original oldplatform top `[107.26,.45,410.9]..[115.3,.45,423.1]`. This is a stale entry point inside the south-shifted front WEST hall, NOT a reason to move old hall or alter collisions.
Static consumers: Chuxiu `routes.entries` lives in structure/architecture metadata; no production navigation/go read found. Teleport's routes consumer is KUNNING_PROFILE, unrelated. Thus no proven player go regression asserted. Metadata not changed by this candidate.
Parent explicitly allowed ONE fixed corrected normal preflight: from already proven courtyard ground `(108.9,394.2)→(108.9,395)→(108.9,409)→return`. This is a new valid ground approach using retained midpoints, not the old entry's entire path. `scan-corrected.*` is separate, original RED untouched. Corrected unique box scan86825 old triangles, old visible/owner/top/water intersection0;16 non-route back-margin radius.5 body reds retained diagnostic. Startnative clear. No geometry/box/point iterations afterwards.

## Terminal verification

- Seven missing-builder real RED then component7+local1 green. Exact per-mesh owner triangles/Box tops/actual-library UV, guards/resources; no late-publication rollback claim.
- One AUTHOR injected candidate World green, west-six/garden/axis-courts+global,loadAll:false, not every zone. Existing 4144 meshes/1700 colliders/110 tops/room-map-region streams exactly unchanged including Yikun/Chuxiu.
- Yikun fixed diagnostic path derived from current profile `(106.6,374.05)→(109.2,374.05)→(109.2,392.5)→(106.6,392.5)→return`,30walk/run=2/441frames, source-derived current diagnostic, NOT a claimed historical QA route.
- Corrected courtyard approach above2/267frames; candidate necessary ground approach `(108.9,394.2)→(109.7,394.2)→return`2/28. Six736frames arrived/peak0 and entire candidate-before/after route objects exactly same against corrected scan. Original invalid412 entry stays RED.
- New platform approach `(109.7,394.2)→(110.65,394.2)→return`,10/60walk/run4/68frames,all arrived,peak.10384865380157157; World/local complete objects INCLUDING end exactly equal. Final nativebody clear/feet0. Two closed-door/backwall refusal routes remain solid. No room entry.
- Actual geometry two CPU images personally viewed;1292 triangles includes12 QA ground. Flat fallback swatches, NOT HD textures/GPU/mobile screenshots.

Source/raw only `/tmp/r161-tihe-yishou-1500` plus own source files/tmp. Fixed-output QA must NOT be rerun over author raw. Integrator copies changes base/output and removes author builder injection, adds exactly one normal hook and checks36owners/2false tops/normal routes/build. Author no fullsuite/build claim. Inherited World test title YongshouRearWest is a label only; actual code/base/points/builders here are Tihe Yishou. No fine-detail extension needed.
