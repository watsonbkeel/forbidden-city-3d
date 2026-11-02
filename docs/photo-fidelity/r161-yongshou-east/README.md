# R161 永寿宫后殿东配殿：三间最低外壳

- Original ID `FC-4FE9168B63`; source base `387e1f6c3dbc731f946458d6af489f52298ef39f`.
- Only new production `src/scene/palace/special/YongshouRearEastWing.js`. Normal hook is `buildYongshouRearEastWing(this.kit,this.kit.root.name)` immediately before ZoneBase finish, west-six only. Author has NOT installed normal hook, built full site or run full suite.
- Official https://www.dpm.org.cn/explore/building/236450.html explicitly distinguishes front wings from rear courtyard east/west wings each THREE bays. The text does NOT specify rear-wing roof type or front window layout.
- Official own named viewpoint 2930/group35 is “永寿宫后殿东配殿南侧”, sph1943468812863131648. Existing group JSON proves the name/cover relation. Primary photo https://file-pano.dpm.org.cn/sphPic/2026/11/01/093851b100064aaebd203d15e25d71f2.jpg (17932 B) was personally viewed: red solid flank, masonry foot, column, low platform and only a narrow dark window fragment. It does NOT establish complete front layout, roof top/end, precise dimensions or current admission. Pano/file dates are not capture dates.
- Accordingly this is a plainly closed THREE-bay body, not west-wing replication: no green window patterns/six-leaf claim. Central two coarse closed leaves/remaining plain front, yellow hard-gable roof, 6.6×3.2 footprint, location/rotation/height and hidden sides are explicit engineering fits. `facadeVerified:false`, `roofTypeVerified:false`, `wholeObjectAccepted:false`. No museum furniture, well pavilion, plaque or interior. This does not complete the whole palace.

## Space / actual real geometry

Centre `(77.4,343)`, rot `-PI/2`, faces courtyard/game +X. Reserve `X[74.9,79.9], Z[339.1,346.9], Y[0,5.5]`.
Actual complete body incl roof `X[75.02232637405396,79.77767362594605], Z[339.2999999523163,346.7000000476837], Y[-1.49e-9,5.332399845123291]`.
Platform 7.4×.2×3.8, one .1-high/.4-deep real step; real mesh-aligned Boxes and two `rescue:false` real tops. 16 per-mesh triangle owners plus two Boxes =18. No contact exception, virtual support, room/map or change to existing walls/halls/paths. Step edge can include existing ground0 in the footprint; no claim of full footprint uniformly on a single-height top.
Normal preflight west-six/garden/axis-courts + global, `loadAll:false`, not every zone: 82565 candidate-intersecting old triangles inspected, old actual triangle/owner/top/water overlap0; start `(83,340.2)` native clear. 16 non-route back-edge radius.5 body diagnostics remain red, not rewritten as all-box clear or a route behind the shell.
Original front east wing item9 at z319.8, rear main hall item8, front main item7 and new rear WEST wing FC-9E42F18295 are distinct and retained.
37 old roof triangles intersect the same XZ column above Y5.5; whole-triangle vertex lower bound7.211192131, at least1.878792286 above new maximum. Not a claim of unlimited clearance above the reserve.

## Tests / outcomes (all terminal)

1. `node --test tests/r161-yongshou-east/component.test.mjs`: actual missing-builder RED 7 failures before source.
2. `node --test tests/r161-yongshou-east/component.test.mjs tests/r161-yongshou-east/routes.test.mjs`: 8/8 green (7 components + local1). Per-mesh triangles exact, two real Boxes/tops, actual-library UVs, guards and one-time disposal verified. No late-publication rollback claim.
3. `node --test tests/r161-yongshou-east/world.test.mjs`: 1/1 green, AUTHOR loader-injected builder, not normal production hook. Original six route full objects preserved against scan. West-six BEFORE/AFTER every old mesh geometry/UV/index/worldmatrix/material color, collider, top, room/map/region stream preserved; 4076 old meshes/1632 old colliders/104 old tops includes already-built rear west.
4. Four new native controller roundtrips 10/60 Hz walk/run `(80.2,343)→(79.25,343)→return`, 68 recorded frames (5/5/29/29), all arrived; maximum feet/ground gap `.10384865380157157`. Local and World complete route objects INCLUDING actual end exactly equal. Native final body clear/feet0. Two closed-door/back-wall negative routes refused. No room-entry or back-gap claim.
5. Old original Yongshou/Taiji gate-front four routes552frames and fixed approach `(83,340.2)→(80.2,340.2)→(80.2,343)→return` two routes123frames: all six675frames arrived, peak0, exact full-object preservation. These are necessary local routes, not full palace acceptance.
6. Actual geometry exported and two 800×450 CPU z-buffer images personally inspected. 1036 exported triangles include12 QA ground triangles; colors are actual-library fallback swatches, NOT HD texture/GPU/mobile proof. No source geometry changes after those tests.

Original raw only `/tmp/r161-yongshou-east-1417`, no third-party photos or raw reports in Git. Tests write fixed raw paths: do not rerun and overwrite author evidence. Integrator must copy script/change base/output, remove injection in favour of one normal hook, hard-check18 owners/two false tops and preserve own baseline distinction. Existing whole west-side flow is NOT a new complete route replay for that object.
Inherited World diagnostic title contains `YongshouRearWest`; executable builder, scope/coordinates/fixtures/raw are EAST. This is a label only, not an old route substituted for the new one.
