# R12 rear-palace terrace candidate

## Evidence and exact scope

The Palace Museum's Jiaotai page, its 后三宫 glossary, describes a **2m shared terrace** with Qianqing, Jiaotai and Kunning arranged on it. https://www.dpm.org.cn/explore/building/236467.html . This is a nominal height above the surrounding court, not a site-wide surveyed elevation datum.

许以林《紫禁城后三宫》, 故宫博物院院刊1983年第5期, p7, says the raised Qianqing approach is approximately10m wide and the terrace north of Qianqing uses grey brick with glazed openwork low walls. https://www.dpm.org.cn/building/talk/223417.html ; page https://img.dpm.org.cn/Uploads/pdf/2201/T00007_00.pdf . The page8 plan supports the cross-axis Jiaotai approaches, but is not a dimensioned survey used to infer exact widths. https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf .

Current official public hotspot photographs were inspected on2026-10-18. PHOTO-SOURCES.json contains exact URLs and SHA256s. The Jiaotai frontal/side views show the central east/west flights and the low hall-edge stone. Qianqing and Kunning obliques show the same near-level relationship between hall doors and common deck. Capture dates are unknown; URL upload dates are not photograph dates. The public images are research references only and are not embedded as project textures.

## Implementation

- Shared rear terrace5→2m. Hall lips Qianqing2m/Jiaotai1.5m/Kunning1.9375m→one0.16m stone lip. The one-stone topology is photograph-compared; **0.16m is a visual-fit trial**. The obsolete three high front/rear plinth stair sets are removed together with their collision ramps, rather than leaving invisible stairs.
- Horizontal anchors and each hall's existing body/roof proportions are retained. Qianqing had a body-height formula coupled to the old floor; its old7m reference is explicitly retained for body proportions so lowering its deck does not enlarge its timber body. Other generic hall callers are untouched.
- Qianqing causeway8→approximately10m width. It remains at1.5m and meets the2m terrace slope atz297.5. The width's outside/clear measurement basis is not specified by the1983 text. Existing1.5m approach elevation, court anchors, palace-front stair topology and gate rear landing are retained modelling assumptions.
- Jiaotai receives two symmetric side flights at its existing side-door axisz354.1. Outside width5.6m, run3.2m,13treads,0.45m cheeks are **provisional model-fit dimensions**, not measured stair counts. Closed treads, visible cheeks, perimeter openings and collision ramps share one profile. No imperial stone is invented on these side stairs.
- The northern two terrace sections use existing grey-brick material and a simplified actual-depth yellow/green openwork low wall. Wallheight0.65m and module spacing are approximate. The model does not claim exact historic brick arrangement, conservation colors or current visitor access.
- Kunning furniture GLB contract metadata is rebound to floor2.16m. Its complete BIN chunk, geometry, materials and COL/WALK proxies remain byte-identical. Reproduce/verify with tools/rebind-kunning-inner-levels.mjs. Original asset is retained for rollback.

## Cost and boundaries

CPU merged-geometry inventory before/after: rear complex29→31 meshes,45720→50100 triangles, **+4380 total scene triangles and2 material batches**. No new texture. This is real total cost, not a transfer to another layer. Gate triangles14276 unchanged versus the gate-only R12 checkpoint. Wumen, Shenwumen, Taihe Gate, river and all front-three-hall merged geometry remain byte-identical.

Missing low rooms beside the Jiaotai flights are visible in the museum photos and remain a known gap. Terrace footprints, exact front/moon-platform layout, lip and stair dimensions, body proportions and complete decoration have not become survey-certified. The independent R10 rear native lateral-route and physical-mobile acceptance gaps remain open. Pages publication remains paused under the existing R10 request; this local candidate is not a substitute publication.

## Verification binding

Gate-only baseline product4e01a6a5ca9baafe4cb3f8d1a216e75fa1505ab0. Historic test snapshots remain; the eight changed back-causeway collision boxes and one widened walkable are explicitly separated from the unchanged front gate. Hall-surface comparison allows only <=3e-6m floating-point position difference after subtracting each floor, <=3e-5 roof-normal difference, and the known world-height projected UV phase shift on two roof box materials.

Focused controller replay exercises both Jiaotai flights and all existing Kunning entry/end-passage roundtrips with real collision and box rescue disabled. These deterministic controller tests do not replace native browser interaction. Browser evidence and full frozen regression are recorded separately when completed.

## First browser finding and localized correction

The first same-view candidate showed black glazed low walls and stair cheeks. Root cause: the shared mergeByMaterial normalizer intentionally removes vertex color attributes, while the new material still requested them. The unmerged CPU check had missed the final rendering path. Corrected locally to two ordinary green/yellow materials with identical geometry/collisions, plus a final merged-object colour/material regression. This adds one batch over the rejected one-material candidate, for two batches above the gate-only baseline. Global merger, lighting and exposure remain unchanged. A single same-camera native screenshot confirmed the correction: green/yellow objects render normally. The source camera and FOV remained identical to the rejected image.


## Original performance failure and distance-detail correction

The a40d91a candidate completed all original six viewpoints and60 frames, but the Taihe forecourt measured964979 triangles versus the original874189, exceeding the unchanged+10% limit by3371.1 triangles. That failed run remains recorded. The other five triangle/call checks passed; all six software-renderer FPS-P5 warnings remain. These are not physical-device smoothness results.

A localized240m distance LOD keeps the complete near glazed wall geometry, materials, transforms, UVs, normals and all navigation byte-exact. Far away it keeps every continuous cap and stair cheek, and one in four tiny openwork modules. This is an explicitly simplified distance representation, not a change to the near architectural model. The threshold and10% return hysteresis are visual trial parameters.

Cost is accounted separately: near rear complex50100 triangles/31 meshes, far46404 triangles/31 meshes, resident51972 triangles/33 meshes. The second level adds1872 resident triangles and179712 geometry-buffer bytes; it uses the same two materials and no new textures. It saves3696 submitted triangles in the far main view; it is not a claim of zero resource cost. Compared with R11, near whole-scene added geometry is4496 triangles; resident added geometry is6368 triangles. The frozen69ec2ce build passed the unchanged original6x60 call/triangle limits, with six software-renderer smoothness warnings. Actual near detail and natural far-level selection were observed; the far wall itself is behind buildings at the Taihe viewpoint, so exposed far detail remains unreviewed. The a40 route evidence is retained only after independent exact geometry/navigation hashing.
