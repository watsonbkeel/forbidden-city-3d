# V17 Taihe column surface candidate

This isolated candidate starts at frozen V16 `57db2276404220f2072d182f759f1422871ac371`. It changes the six gilded shaft surfaces only. Existing column dimensions and inferred registration, bases, throne, screen, caisson, glyph UV fix/atlas ownership, fallback replacement, navigation, lighting and materials remain in the V16 state.

## Authored scope and evidence

The [Palace Museum building entry](https://www.dpm.org.cn/explore/building/236465.html) and [Wang Zhongjie, printed p17](https://www.dpm.org.cn/Uploads/pdf/2199/T00017_00.pdf) support fine/coarse applied gilded surface relief, cloud/dragon motifs and two shades of gold. They do not establish calibrated modern relief depths or a complete circumferential survey. The approved design was supplied separately with its decoded V16 audit and source manifest. No museum image, drawing, traced motif, sample, bake, or font is included in this asset.

The six existing 32-sector cylinder meshes retain their oriented vertex positions, dimensions, height endpoints and hard caps. Only their side normals are smoothed. Eighteen one-turn dark-gold tubes are removed. Each column receives six interrupted self-authored branching/curving ridge patches, using the existing gold material. There is no new texture, vertex-color pipeline, batch, fallback ornament, light or shared-helper change. This is a surface-refinement approximation, not an exact dragon reconstruction.

Authoring dimensions are explicitly estimated: 0.75 mm edge clearance above the actual polygon facet, 6 mm crown rise above that edge, and 30–65 mm nominal ribbon widths. Paths taper to capped top-surface tips. Every relief triangle is clipped at shaft facet boundaries before projection, so planar triangles remain attached above the physical 32-gon rather than cutting chords through it. These clearances are visual starting values, not measured heritage dimensions.

## CPU verification and visual gate

The decoded tests protect exact shaft positions, radial side normals/hard caps, absence of the old tubes, finite/nondegenerate outward relief, radius ≤0.52 m, shaft y limits, facet attachment, short disconnected patches, no positive-area facet overlap, all non-column vertex/normal/UV output, materials, eight batches, and the reclaimed triangle cap. Existing glyph tests continue against the selected asset; the historical UV-only before/after proof is explicitly pinned to frozen V16 assets.

The generated asset is `taihe-v17-a8e358509558.glb` (586,224 bytes), with 8,330 triangles and eight batches. Its relief uses 2,808 triangles (468 per column), reclaiming 648 triangles from V16. The fallback remains 1,078 triangles. Decoded maximum relief radius is 0.50678311 m, y is 0.57–7.97 m, and sampled facet separation is 0.74962–6.75045 mm. Exact non-column output contains 4,778 protected triangles.

Focused tests passed 109/109. The full serialized CPU suite passed 1,463/1,463 and the repository-subpath build passed. `CPU-REPORT.json` records asset/source identity and decoded measurements. Commands:

- `OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 blender -b -t 1 -P assets-src/interiors/taihe.py -- /tmp/taihe-v17-column-candidate.glb`
- `node --test --test-concurrency=1 tests/current-state/*.test.mjs tests/*.test.mjs`
- `npm run build -- --base=/forbidden-city-3d/`

The known Blender warnings concern an unwritable extension cache and unavailable optional Draco compression; uncompressed export completed successfully. The build retains the existing large-chunk advisory. Hard-cap attributes are byte-exact V16, including its inherited 1e-4 component rounding. The relief-normal test permits float32 error on narrow clipped faces while requiring outward normals. The default parallel baseline test invocation had six file-level failures without any signal or cause in its reporter. A serialized rerun passed 890/890. No OOM attribution is made.

No browser, server or GPU run is part of this candidate. Visual improvement, ordinary 1280×720 readability, side-route close views, and runtime acceptance remain pending a controlled V16/V17 A/B with fixed camera, FOV, lighting and exposure. V16's browser crash remains unresolved. No publication or main-branch update is authorized here.
