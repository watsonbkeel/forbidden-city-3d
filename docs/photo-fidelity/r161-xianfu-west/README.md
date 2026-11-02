# R161 咸福宫后殿西配殿：有限图证三间闭壳

Original `FC-41ADF461CA`; base `87bb788895ff2cead26099345977d8fae20a63e7`. Only new production `src/scene/palace/special/XianfuRearWestWing.js`. Normal hook `buildXianfuRearWestWing(this.kit,this.kit.root.name)` before ZoneBase finish, west-six only; author has NOT installed normal hook or run build/full suite.

## Independent evidence / limits

- Official https://www.dpm.org.cn/explore/building/236583.html explicitly says rear Tongdao courtyard east/west wings EACH THREE bays, between front Xianfu and rear Tongdao halls, southeast well pavilion. This is separate from the front wings and rear hall ears. Generic https://www.dpm.org.cn/explore/building/236507.html independently mentions rear wings but does not give their roof type.
- Official gallery image https://img.dpm.org.cn/Uploads/Picture/dc/18017%5B1024%5D.jpg is captioned Tongdao court well pavilion. Personally inspected: near well, right rear Tongdao facade and platform pedestals, left front-hall rear wall, far wing. The documented southeast well and hall topology support far wing = rear WEST, an INFERENCE, not a named viewpoint or surveyed position. Far central opening/red frames and upper-dark/lower-pale side windows are visible; upper centre/end junctions obscured. No ornamental name or exact lattice inferred.
- Adjacent official18016 pedestal closeup corroborates rear hall platform identification, NOT an independent rear-wing facade photograph.
- Only lowest three-bay exterior: coarse red frames/two broad window fields; photo-open central door is CLOSED in game because interior is not modeled. `facadeVerified:false`, `roofTypeVerified:false`, `wholeObjectAccepted:false`. Hard-gable roof, all metres/coordinates, pane subdivisions/door count, hidden sides and porch depth are fits. Dedicated vs generic Tongdao MAIN roof conflict belongs to existing main hall, not proof of this wing roof. Do not duplicate well, pedestals/furniture or invent room access.

## Actual space / body

Centre `(167.3,443.3)`, rot `PI/2`, faces courtyard/game -X. Body6.6×3.2, platform7.4×.2×3.8, real step2.4×.1×.4. Complete bounds `[164.92232637405397,-1.49e-9,439.5999999523163]..[169.67767362594606,5.332399845123291,447.0000000476837]` inside single reserve `X[164.8,169.8], Z[439.4,447.2], Y[0,5.5]`.
30 per-mesh triangle owners +2 actual stone Boxes =32; two exact real tops `rescue:false`. No new contact/virtual support/rooms/maps. No claim of full same-height support across the whole footprint at the step's ground edge.
Front WEST wing west-six item49 (z419.1), rear Tongdao item47, front main item46 and all existing wings unchanged. Whole main-hall roof/windows keep their own current source/identity.
Normal preflight `loadAll:false`, west-six/garden/axis-courts+global (not all zones): 82443 potentially intersecting old triangles inspected; old visible triangle/owner/support/water intersection0. Sixteen radius.5 non-route back-edge body sample reds retained, not claimed traversable. Fixed start `(161,440)` native clear.
Same XZ high column above Y5.5 intersects3 old roof triangles; minimum full-triangle vertexY7.075637817, conservative separation≥1.743237972 from new max. No blanket high-airspace claim.

## Verification

1. Seven missing-builder RED tests observed before source. Then `node --test tests/r161-xianfu-west/component.test.mjs tests/r161-xianfu-west/routes.test.mjs` 8/8 (7 components+local1): independent ID/evidence limits, real bounds, exact mesh owners, Boxes/tops, actual-library UV, registration guards and one-time resources.
2. `node --test tests/r161-xianfu-west/world.test.mjs` 1/1 green. AUTHOR loader-injected builder, not normal hook. Original six route full objects match preflight; all4094 old mesh geometry/UV/index/matrix/materialcolor,1650 colliders,106 tops, rooms/maps/regions retain exact stream including both Yongshou rear wings.
3. Original `tests/fixtures/r47-r46-auto-routes.json` first-three-point gate approach substrings only (not full hall entry): Yongshou `(87.4,300.4)→(95.4,300.4)→(95.4,307)` and Xianfu `(142.5,406.2)→(150.5,406.2)→(150.5,411.7)`, each return same points,30walk/run=4/525frames. Fixed courtyard `(161,440)→(164.5,440)→(164.5,443.3)→return`,30walk/run=2/141frames. All six666frames arrived/peak0, exact full-object preservation. No route moved after preflight.
4. New `(164.5,443.3)→(165.45,443.3)→return`10/60walkrun four68frames (5/5/29/29), peak.10384865380157157; all arrive. Complete World/local objects INCLUDING actual end exactly equal; original driver's plane crossing unchanged; postsettle native body clear/feet0. Two closed-door/back-wall negative routes refuse. No claim of entering room or traversing backgap.
5. Two actual geometry CPU images personally inspected,1204 exported triangles include12 QA ground triangles. Fallback material swatches only, NOT HD/GPU/mobile screenshots. No geometry changes after testing.

Raw only `/tmp/r161-xianfu-west-1429`; official photos/html remain/tmp, not Git. Manifest pins all raw/source/selfCPU. Scripts write fixed outputs: integrator must copy/change output/base and remove author injection; never overwrite author raws. Normal production hook/build remains unique integrator's gate. Preserve existing six raw objects, new four and32 owners/two false tops.
Inherited World test diagnostic title says YongshouRearWest; actual module/zone/base/coordinates/routes/output are this Xianfu rear west. Label only, not substituted old test results. No whole-object or entire court acceptance claimed.
