# R31 combined preview — 19 October 2026

Runtime: e446ecd4d8c66f632c625381dc207ddf2a4f8523. Tested source checkpoint: c8facc4572825e353dfb6fb6861e65099e63587a. This document is a later evidence-only addition. Main was not changed by this work.

## User-visible changes
- Esc now releases the mouse and opens clickable helicopter controls. The aircraft holds its position while that panel is open; explicit Continue reacquires mouse control. A stopped manual or automatic landing opens the same panel with a visible exit button. Airborne exit is disabled with an explanation. H remains available.
- Opening the map alone still permits flying or walking. Search typing is isolated from movement. Leaving the aircraft restores pedestrian controls.
- Qianqing Palace's two optional incense pavilions now have blue framed bodies, one broad roof and dark stepped bases, informed by the Palace Museum photograph. The entrance floor has finer brick joints; a coherent private stone finish spans the existing front platform and its lip. Lighting, dimensions, all navigation proxies and adjacent halls are unchanged.
- Six source-backed historical names are searchable: 玄武门, 奉天殿, 皇极殿, 思顺斋, 未央宫, 启祥宫. Matching preserves each current place's own card and destination. 皇极殿 intentionally returns two distinct places.
- Includes preserved R28–R30 improvements to Jiaotai and Qianqing, including Qianqing end passages. These are not newly claimed as R31 work.

## Five requested work areas
| Area | Outcome and evidence | Remaining limitation |
|---|---|---|
| Continuous central-axis walking | A 73-leg, ~1377 m CPU route using real collision and walking controllers passes. Ordinary native walking was observed from Wumen through the central bridge, Taihe Gate and court to Taihe's southern stair approach. | The remaining full native route was not completed: the cloud input tool sent no KeyD for D and NonConvert for Right. The approach at X13.39 was outside the stair's clear lane. No geometry was altered to hide that result. CPU route covers B geometry, not all streamed interiors. |
| Key hall entrance composition | Qianqing chosen because Taihe's dimensional registration remains unresolved. Same-camera entrance/near/court images reviewed, followed by a final platform-lip image. | Stylized detail remains; pavilion positions and .70 m elevation are inherited collision-safe estimates, not registered measurements. Official photo is undated. |
| Connected courtyard material sample | Qianqing platform/lip uses one private, pale low-contrast stone treatment; indoor bricks are distinct. Two 256² textures, no added resident triangles. | A deliberately bounded sample, not all courtyards. Distant floor pixel artifact remains inherited and unclassified. |
| Search / aliases / historical sites / return | 159 cards retained. 25 new event-driven CPU cases and related behavior checks pass. Ordinary card open/back/close, ASCII empty result and clear-to-159 observed. | Native Chinese typing could not run because the native accessibility input provider was unavailable. Two demolished gates and seven uncertain identity/history cards remain explicitly labelled. |
| GPU / physical mobile | Existing software-renderer measurement retained with the original six-camera, 60-frame protocol. | No connected physical device or hardware GPU is available. No real-device smoothness or touch acceptance is claimed. |

## Desktop helicopter observations
One ordinary Chromium application renderer, native controls, 497.08 seconds active and .12 seconds cleanup. Manual takeoff/landing, exit click, walking, reboard, automatic ascent to 100 m and descent, second exit and walking observed. Esc holds with and without map; map alone permits automatic movement. All three views used. Five actual screenshots reviewed. No page/resource errors; owned group and port cleaned. This does not revalidate the entire sightseeing route or every landing point.

## Tests and resources
- 1021/1021 current-state checks passed; additional 42/42 integration/retention checks passed. Counts overlap logically and are not added into a scene-certification total. Historical exact-byte fixtures remain explicitly historical.
- Production subpath build passed. 123 files / 34,079,430 bytes; all 120 public assets match source bytes; 102 referenced paths resolve; 26 GLBs have no external resources.
- Resident scene: 169 to 171 meshes, 87 to 89 materials, 22 to 24 textures; triangles remain 191,727 and geometry buffers remain 18,647,684 bytes. Both LOD levels count.
- Optional Qianqing: 8,240 to 9,024 triangles and 7 to 8 batches. All 27 optional proxies and 2,503 permanent colliders / 120 walkables are retained exactly.
- Final original six-point / 60-frame renderer sampling completed in 503.76 seconds, cleanup .50 seconds, zero resource errors. Calls/triangles passed the unchanged baseline ceilings. All six FPS-P5 values warn: .70/.93/.79/.84/1.15/.67; average FPS .96/1.00/.90/.97/1.36/.96. This is SwiftShader software rendering, comparable historical R30 averages .94–1.39, not concurrent measurements or physical-device performance. See PERFORMANCE-REVIEW.json. A structural budget pass is not smooth performance.

## Honest restoration limits
This is an approximate, evolving virtual palace. The Qianqing photograph is appearance evidence, not a dimensional survey. Taihe plaque/couplet registration is unresolved; no speculative ceiling or anchor shift is included. Seven cards retain uncertainty: 南薰门; 太极门; 长康左门; 长康右门; three individual 南三所 rear halls. The two demolished gate sites remain searchable historical places.

See docs/r31/ for component sources and details. Published branch/Pages receipts are separate from product acceptance. Preserve the previous public R23 commit 846072f1258b255d3eb8a40c2b3f8ae1f97a1cc4 for rollback.

## Remaining work at candidate freeze
The public site stays R23. This source branch preserves the combined candidate while a short native rear-route continuation is assessed using supported ordinary mouse/keyboard controls. It will be recorded as a separate start, not spliced into a claimed continuous full walk. No further product changes are required by the current evidence.
