# R8 — Zhonghe side stairs and Taihe incense forms

## Visible changes and evidence

Zhonghe's north and south central approaches are now separate carved imperial stones, with walking confined to the adjoining steps. The museum's building text states the three-approach arrangement and carved central stones. The two former central walking ramps are removed; six actual stair flights remain around the hall. Existing anchors, width and rise are retained modelling estimates. Existing illustrative carving material is reused; this is not a stone scan or a claim of present public access.

Taihe's four previously added incense tables now have splayed legs and wider waisted aprons. Their censers have rounded shoulders, truncated lids and genuinely open high ears. The official interior photograph supports these silhouette cues. The same-view scene comparison shows a modest improvement, especially the lids; from the entrance the objects are still small and simplified. This is not an overall photorealistic restoration. Exact size, curvature, material finish and temporary-carpet dating remain unverified.

No global lighting, exposure, camera FOV, plaque dimensions, throne/screen anchor, building layout or POI content changes are included. The earlier Taihe interior/exterior steps, 159 introductions and R7 behavior are retained.

Sources:
- Zhonghe building: https://www.dpm.org.cn/explore/building/236464.html
- Zhonghe front image: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff05cd7866d.jpg
- Taihe interior: https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg
- Taihe building: https://www.dpm.org.cn/explore/building/236465.html

## Byte bindings and completed checks

Product source 4f98b701f2f5c510101b6315cdc9e7f3231f8b35; test-only continuation 086c8d1f82acbbffb24f9af758545f34e70830ec.
120-file product manifest SHA-256: 8b430ba98b3759635758364104f13663c746527143180abdd3acf19de1645303.
Fine Taihe asset SHA-256: 24481a47ba8d199679f03c63ca818ef9efec2dff53977e5037e556b128cb9e70.

- Whole local test run covered 2,153 tests. 2,150 passed initially. Three older Zhonghe tests still assumed central imperial stones were stairs; those specific assertions/routes were corrected to preserve the stone and use physical side flights. The affected two test files then passed all 15 tests. No product bytes changed during this correction. Initial failures remain recorded.
- Original deterministic route driver: 132/132 fixed and 236/236 generated combinations passed, including both changed Zhonghe routes. App viewport320×200, 60/10Hz and walk/sprint combinations. One cold app, fixed followed by a warmed automatic batch. 56.59s active, 0.504s cleanup. No page errors; test-host favicon404 recorded. These are controlled routes, not full native user walkthroughs.
- Actual cloud native input: explicit start outside Zhonghe's south-west stair, map opened with M, W15s ascent and S15s return. 268 passive position samples, feet8→8.6→8, no penetration. Other flights have CPU/controller coverage but no new native walkthrough.
- Zhonghe before/after actual pixels used identical camera, FOV, viewport and quality. The stone-versus-tread change is visible. The low viewpoint does not establish whole-roof proportions.
- Taihe same-view actual pixels used identical position, orientation, FOV70 and1180×757 viewport with the previous R7 capture. S loaded, zero app/resource errors, 31.70s active and0.543s cleanup. Native browser translation UI overlaps only the upper ceiling, not the changed objects. No image retouching.

## Preserved budgets

Taihe S has17,924 asset triangles plus60 permanent beam triangles, within the unchanged18,000 ceiling. B remains1,600 triangles. Eight owned material batches and texture allocations are unchanged. Reusing neutral gold adds8,640 S and1,728 B bytes of runtime response buffers; exact totals are declared in the registry and tested. No structural performance limit is raised.

Original six performance positions ×60 frames passed the unchanged calls/triangles +10% limits at1280×720/high/DPR1. SwiftShader average FPS0.98–1.49 and P5 0.50–0.79 remain warnings versus the original baseline; this is not real-device smoothness validation. All six samples completed without page/resource errors; owned-process group and port cleanup passed. Historical R7 averages0.98–1.51 were similar, but the runs were not concurrent. The sampling run was completed against the exact product bytes above.

## Remaining limits

The interior remains stylized. Plaque/couplet hanging relationship, ceiling depth/count, screen registration and decorative detail still differ from the official photograph. All other palace stairs have not yet been individually corrected. Physical mobile hardware and all native garden routes remain unverified. The inherited viewport-dependent central-road missing-pixel issue is unchanged from R6/R7. Museum photos are reference sources, not redistributed runtime textures.

R7 Pages commit5aa2bc712b9489564452c838af510dcec8f7c7e5 is the immediate rollback; R6 remains available. Main must remain unchanged.
