# Taihe screen crown candidate

CPU-only original simplified openwork/scroll geometry. This does not reproduce dragon carving, infer an exact dragon count, or calibrate the screen dimensions. The existing estimated 4.2 × 3.8 m envelope, equal-width leaves, 0.33 m steps and registration remain unchanged.

## Evidence and design boundary

Museum installed view: https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg, from https://www.dpm.org.cn/explore/building/236465.html. It supports a raised bilateral center crown, three varying mirrored flank pairs, broad rolling shoulders and genuine background-visible gaps. The central upper silhouette spans neighboring lower leaves; the candidate's 1.06713131484 m central span, approximately 1.82 times its retained 0.585 m body width, is an authored visual estimate, not a photograph measurement. Roots remain on the central substrate. All ornamental dimensions, cross-sections and paths are estimates. Museum research images are not included here or in any runtime file.

No new materials, textures, light changes, fallback changes, navigation changes, display furniture changes, chair changes or calibrated registration are included. Ordinary front/oblique eye-level appearance and runtime/performance acceptance remain pending owner review. CPU figures are orthographic geometry diagnostics with diagnostic shading, not rendered-product evidence.

## Exact semantic retirement

Baseline: `public/models/interiors/taihe-furniture-0bfa52b758cb.glb`.
SHA-256: `0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea`.

Per leaf, retire these complete original source objects:

- `screen_i`: 32 triangles (the full-height substrate owns its apex)
- `screen_i_panel` and `.001`: 24 triangles
- `screen_i_stile` through `.003`: 48 triangles
- Only upper rails `screen_i_rail.001` and `.003`: 24 triangles

Also retire each appended `furniture_screen_i_crest_curls`: 88 triangles, and exactly the last 32-triangle closed cap component of each `furniture_screen_i_register_frames`. The other three 16-triangle frame components remain untouched. Total: 63 original objects, 7 complete appended curl parts, 7 partial appended cap components, **1,736 triangles**.

`derive_retirement.py` executes pinned original source only to its pre-merge boundary and pinned furniture source. It requires one-to-one exact oriented float32 triangle matches and unique semantic owners. There is no bounds, proximity or material-only face selection. Source bounds in the mask provide exact existing planes for reconstruction; they do not select faces.

Mask SHA-256: `7231ffb388115f3cf3f9e9745de82e645bd9cda091a2d352c795d54479490805`.
Blender 4.3.2 regenerated this mask byte-identically on the second run.

`retire.retire_screen_headers(base_bytes, mask_bytes=None)` returns `(retired_glb, receipt)`. It only changes the three designated index views, their counts/min/max, buffer offsets and container lengths. Every attribute view and other index byte stays exact and retained indices stay in original order. It deliberately leaves all node/contract metadata untouched; integration must update retired/partial inventory and identity. It preserves unused original vertices rather than compacting or reexporting them.

## Replacement and budget

`geometry.build_candidate(profile, 'detail', crown_style='outline')` returns the same mesh dictionary shape as the furniture builder, with only existing `gold`, `darkGold` and `red` material tags. The bounded `crown_style='sculptural'` alternative thickens main scroll sections from 30 to 49.5 mm (1.65×), main supporting branches by 1.4×, and retains thinner inner branches. Both styles have the same topology and budget, and both pass the geometry, root, clearance, retained-surface and aperture tests. The owner selected the sculptural alternative for integration. The outline remains an explicit comparison/default; the integration builder must pass `crown_style='sculptural'`. Neither is claimed to reproduce the original carving.

- New header solids: 756 triangles
- New cap-frame components: 224 triangles
- New open crowns: 1,260 triangles
- Total replacements: **2,240 triangles**
- Candidate core: 17,266 − 1,736 + 2,240 = **17,770 triangles**, net **+504**
- Limit: 17,866 candidate ceiling; original 18,000 ceiling unchanged
- Material batches: existing eight only; owner appender integrates existing lacquer

Original X/Z face planes and lower Y values are copied exactly from baseline float32 source geometry. The body/slab/stile upper planes stop 0.35 m below the existing leaf top. Top rails are lowered wholly within that header. Tests compare source and replacement surfaces bidirectionally below the new header, sampling vertices, edge midpoints and centroids of each clipped face. This permits changed coplanar triangulation while verifying actual surface occupancy rather than merely equal bounds.

All closed components have positive signed volume, consistent winding, finite unit normals and no degenerate triangles. Every crown component intersects a previously connected component or the retained-height replacement header. Neighboring central/flank crown surfaces clear 15 mm. Four designs are distinct; the center is bilateral, and three pairs are mirrored. All seven original top heights remain exact in the authored profile frame.

Fourteen declared aperture disks have 672 front-to-back segment-ray samples through both old screen faces. They test all decoded retained baseline triangles plus all new candidate triangles, so retained backing cannot silently block the openings.

## Reproduction

From repository root, with no browser or GPU:

```
PYTHONDONTWRITEBYTECODE=1 blender -b -t 1 -P assets-src/interiors/taihe_screen_crowns/derive_retirement.py -- --output /tmp/rederived-crown-mask.json --diagnostic-screen /tmp/diagnostic-screen-faces.json
cmp /tmp/rederived-crown-mask.json assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json
PYTHONDONTWRITEBYTECODE=1 python assets-src/interiors/taihe_screen_crowns/test_geometry.py
PYTHONDONTWRITEBYTECODE=1 python assets-src/interiors/taihe_screen_crowns/test_retirement.py
PYTHONDONTWRITEBYTECODE=1 python assets-src/interiors/taihe_screen_crowns/diagnostic_preview.py --output /tmp/taihe-crown-diagnostics --face-map /tmp/diagnostic-screen-faces.json
```

The diagnostic script emits before/after front, oblique and upper-silhouette PNGs; deterministic candidate geometry JSON; a receipt; and an index-only intermediate GLB. That intermediate has intentionally stale baseline contract metadata and is **not** a publishable runtime asset.

## Verification at CPU handoff

Both styles: 19 geometry tests and 13 retirement tests passed. The project's current-state suite passed 890 tests, top-level Node suites passed 841 tests, and Python suites passed 29 tests before final runtime integration. The original derived mask was independently regenerated byte-identically. CPU figures include `crown-section-alternatives.png` for visual review of the two section widths.

The selected sculptural crown spans 1.08918666949 m, approximately 1.86 times the retained 0.585 m central body. Exact triangle clearance to either neighboring crown is 0.17638418522 m. This variation changes main section widths and support widths only; no additional triangles, materials, textures, path anatomy or screen registration were introduced.
