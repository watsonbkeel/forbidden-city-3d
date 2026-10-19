# R9: Taihe northern enclosure and ceiling depth preview

## Visible change and evidence

The northern flanks now use solid walls rather than eight duplicated southern lattice panels. The three central door bays remain open for virtual navigation. The Palace Museum guide and published northern-elevation survey support this topology; the museum interior photo supports a pale inner face with a low green-grey band. Existing wall line, opening, hall dimensions and navigation are retained. Wall thickness, dado height and colours remain visual estimates. Central rear lattice and the present-day public-access arrangement are not fully represented.

Twenty-eight shallow physical frame bars add limited depth to the central ceiling strip. Their cadence, thickness and drop are modelling estimates. The original four ceiling panels, caisson opening, anchors, lights, exposure and normal walking camera remain unchanged. No museum photograph was added as a runtime asset.

Sources:
- https://young.dpm.org.cn/uploads/1/file/public/202505/20250516181259_97digy9q27.pdf — PDF p5 / printed pp3–4, northern solid wall.
- https://www.dpm.org.cn/Uploads/File/pdf/57/b7/23/57b723492c90ce646a948b09c0b1ceca.pdf — 2011 issue6, printed p150, fig12, northern elevation survey.
- https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg — inner wall appearance; photograph date unknown.
- https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg — throne and central rear lattice; photograph date unknown.

## Frozen product and checks

Product source: `6917f067df586d07a56686a927c64af0ad421511`. Later commits change tests/documentation only. Relative-base production build passed; 120 product files are bound by manifest SHA256 `c67532ebfb30e5bb0f9b650c7864c225a7ec3123237877e4a3e24730507a01c0`. No test hooks are in the published build.

- Focused frame/enclosure tests: 14/14 passed. Full CPU run initially 2164/2169; exact historical source/mesh adapters corrected obsolete expectations. Second full run 2168/2169; the remaining negative-test mutation was corrected and final affected tests passed 25/25. These are composite results, not a claimed single 2169/2169 run. Product bytes did not change during those test corrections.
- Original controller matrix: 132 fixed and 236 generated routes passed with the unchanged driver. No collision or walkable geometry changed. The controlled matrix uses artificial starting positions and is not a full native walk-through.
- Same-camera entrance images were reviewed against R8 at 1180×757, FOV70. Solid northern enclosure is visibly improved; the coffer depth improvement is modest. A separate northern-exterior image confirms topology only, with gravity-adjusted eye height.
- Normal welcome-screen entry, M-map open, native W/S movement and resume after closing were exercised in the actual ordinary page with passive observations. W moved about7.50m during an8-second hold while the map remained visible; S reversed direction. No page/resource errors. The first native attempt received no inputs during a controller interruption, reached its150-second cap and was preserved as incomplete. The completed attempt took81.47 seconds and cleaned its owned process/port.
- Real mobile hardware has not been tested. Existing mobile behaviour is not newly claimed as verified.

## Honest geometry and performance accounting

Core S geometry stays17924 triangles within the unchanged18000 core cap. Existing permanent beam geometry60 plus new coffer geometry280 yields18264 combined core/beam/frame triangles, before other hall geometry. This is not presented as an18000-total result.

Two new wall flanks replace96 panel triangles with28, so the combined geometry change is +212 triangles, +1 material batch and +20640 geometry-buffer bytes. CPU merged hall totals are21 meshes/19034 triangles/1840488 bytes versus R8 20/18822/1819848. All visible geometry is included in whole-scene measurements.

Original six viewpoints ×60 frames at1280×720, high quality, DPR1 passed the original calls/triangles structural thresholds. At Taihe front, actual rendered totals are155 calls/960483 triangles versus R8 152/960051: +3 calls/+432 rendered triangles including passes. This is +9.87% triangles against the original874189 baseline and remains close to its unchanged+10% cap. No budget was reset.

Smoothness remains a warning: this cloud Chromium154 uses SwiftShader software rendering, averaging0.94–1.42 FPS (P5 .50–.79). All six original FPS warnings remain. Historical R8 used the same renderer model but was not concurrent; there is no claim of a smoothness gain or performance on untested hardware.

## Limits and next evidence-led work

The interior remains stylized and simplified. Foreground columns appear very large and the throne distant in the current entrance camera. A matched-perspective study using the officially documented plaque dimensions is needed before deciding whether geometry or observation perspective is responsible. R9 does not silently change FOV, default camera or unverified mounting heights. Current paint colours, finer ornament and exact room-height registration remain uncertain.

The inherited viewport-dependent central imperial-ramp pixel issue remains separately documented from R7. Central carved ramps are not ordinary stairs. Virtual access does not establish public access at the real museum.

R8 Pages rollback: `8e54f808b8883f75456894fb9c9c3eb0c6e49b99`. Main remains owner-controlled and unchanged by this release.
