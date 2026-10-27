# R119 — 交泰整室组合（开发版，施工前计划）

Base: R118 `3d40ed95af8009b2bff6620cc3a5ed5236c5fa15`; isolated branch `feat/r119-jiaotai-room-20261027`. R116/R117 have no accepted optimization. Full prebuilt/ready initialization and R118 routines stay unchanged. Major cumulative checkpoints remain R120/R126, with R120 same-quality performance work.

## Source and difference ledger

Primary facts: [Palace Museum Jiaotai page](https://www.dpm.org.cn/explore/building/236467.html), read 2026-10-27, says square three-bay hall, four central doors, painted beams, coiled-dragon caisson, Wuwei plaque, rear inscription screen, east clepsydra/west clock. The description is not a dimension survey. Official panorama photographs cached in R54 source-review were personally inspected: `jiaotai-interior-1.jpg` (front), `jiaotai-clock-context.jpg` (clock side), and `jiaotai-interior-2.jpg` (plaque close-up, **not** another whole-room camera).

| Region | Actual R118 ready artifact | Source-supported residual / R119 scope | Not inferred |
|---|---|---|---|
| Rear screen/plaque | Existing red body, upper/lower fields, .44-width Wuwei, simple gilt borders | Upper red/gold dragon-cloud massing, layered grey-green/red/gold plaque borders and field edge articulation within retained envelope | No enlarged plaque, moved screen, inscription transcription, signatures/seals, new hidden objects |
| Caisson/suspension | Nine fitted tier profiles, square/polygon/round zones, near Tube dragon, hanging cage and single sphere | Near-level inset lip/bracket-edge silhouette; cage end rings and sphere connection. Retain centre, height, opening and far outline | No claimed measured step count, new optical mirror effect or new column grid |
| Inner eave/frame | Thin common bearing beams; clock upper region has one generic beam | Blue-green/gold painted inner faces on existing central bearing frame and clearly observed clock-side upper region, with limited layered brackets | No mirrored unseen rear details or extra four gold columns |
| Low furnishings/routes | R54 low platform/three covered rows, R102/R106 textiles, two timekeeping landmarks, four doors | Preserve bytes/physics, four-door observation/rear circulation | No reconstruction of 25 covered seals; no new museum barriers |

Ready baseline is `reports/r119-jiaotai/visual/*-before-high.png` with serialized fixed cameras and actual scene triangles/maps. 22 color/21 normal files decode through production TextureLibrary; central atlas is synchronous Canvas2D. CPU perspective z-buffer is **not GPU/PBR/shadow acceptance**. The native CPU font does not reproduce Chinese glyphs in the existing plaque; blank CPU text is not evidence of a product regression. Baseline source remains unchanged R118.

## Implementation gates

1. Freeze R118 retained physics, textile geometry, timekeeping LOD, opening and portal records. Write and observe RED actual geometry/art assertions (not naming-only).
2. Make only approved three-part combination changes; do not change player/body/STEP, character registry, routines, routes, zone lifecycle or global art keys. Added overhead geometry stays out of player reach; any reachable footprint must remain inside retained finished envelope.
3. Use one small owned room atlas (~512×256, 0.5 MiB raw RGBA) plus existing central atlas; no new external asset or dependency. Merge per material. Keep near/far LOD and R106 textile policy. Dispose owned texture/material exactly once.
4. Fresh real-library high/low startup, key validation, finite geometry/UV/normals, source-bounded material checks. Four doors → clock/clepsydra → rear loop → return at 10/30/60 with unchanged player. Check actual finished triangles, not only owner metadata.
5. Same-camera after CPU output; independent comparison; retain fact/photo-fit/unknown separation. GPU/mobile VERIFY_PENDING unless genuinely executed.
6. Paired fresh-process construction/resource delta vs R118, preserving raw samples; no performance-improvement claim for added detail. Run existing Jiaotai/R106 and R118 protection gates, baseline-classify historical failures, build/release identity R119; root freezes/uploads cumulative exact tree.

### Pre-implementation source correction
Independent review rejected mapping “front-facing visible” to the south entrance perimeter behind the front photograph camera. The initial RED test used that wrong coordinate assumption. R119 therefore adds only west perimeter detail and the existing central bearing frame; south/east/north perimeter details remain unknown and unchanged. This is an explicit scope correction, not a passing result.
