# Yangxin glazed facade implementation plan
> Native single-writer superpowers:executing-plans; independent read-only review. User/parent requested continuous implementation, not repeated approval prompts.
**Goal:** Complete source-bounded three-part glazed facade surface ensemble without any geometric or physical support change.
**Architecture:** dedicated YangxinGlazedFront.js applyYangxinGlazedFront(kit,f,profile) called once at end of YangxinCourtEntrance builder; no shared merger/controller or profile-data mutation. Split exact selected BoxGeometry front source faces into ordinary meshes, private procedural materials only.
**Tech:** existing Three.js/Canvas/Node/Vite; no added dependencies.
**Spec:** DESIGN.md.

## Review focus
- Material arrays are dropped by current merger: ordinary meshes only, unchanged exact final rendered triangle count/multiset.
- Source normals/group/index/UV mutations must reject before staging, never repaint rear/side faces or nearby roofs.
- Full materials remain private with no legacy furniture-gold name collision; distinguish fitted appearance from actual relief/new support.
- Metadata/geometry nonwritable fields, late construction/context failures, disposal once; defined atomic boundary only.
- ActualWorld both gate/screen/bypasses and old high presets; inherited gaps/illegal starts cannot be counted as successful traversal.

### 1 Full front surface composition and source extraction
Files create src/scene/palace/special/YangxinGlazedFront.js, tests/major-pilots/yangxin-glazed-face/{fixture,composition,source,contract,lifecycle}.mjs; modify only YangxinCourtEntrance import+hook.
- [x] Red missing13 front faces/4 distinct fields and private finish materials.
- [x] Implement exact canonical guard and detached front/rest extraction; keep all source positions/normals/UVs and original scalar material for residual.
- [x] Fitted flower-medallion/corner/band/base surface ensemble, different central vs side proportions; private ownership and image resolution/cost explicit.
- [x] Green source triangle/material conservation raw+merged; identity/value physical contract; wrong-host/source rejection and late-failure cleanup.

### 2 Complete-zone and actualWorld
- [x] Actual bb430800 builder replay, all non-target meshes and complete-zone collider/walkable/room/region/map equality.
- [x]10/60Hz run/walk/jump both directions main portal, inner woodscreen, two bypasses; .3/.5 callers; compare parent high-preset/floor-origin traces, preserve observed old failures.
- [x] Full original R73 entrance/routes/world group; independent read-only source/design/code review, fix proven problems red-green.

### 3 Frozen serial verification/checkpoint
- [x] Specialized fullgroup, shared40files161items, outer navigation32, residential195 with actual-parent deltas as needed; old failures retained, never claim whole-project green.
- [x] Threebase memorycompile, final source fingerprint, real-material cost, old14dirty report hashes and outputsize.
- [x] Final review and frozen RC, explicit scoped local commit. Keep safe bb parent and both WIP branches; no push/deploy/main/cleanup.

Final complete groups:41/41 specialized,7/7 original R73 with actualGLB,161/161 shared,32/32 navigation,184/195 residential identical11 actual-parent failures,3/3 Vite bases. No wholeproject-green claim. Source65bc4277c69ec6b91afc6810cb8d5f5d5de39b1668b95fe3cf4e05cd7c84d755.
