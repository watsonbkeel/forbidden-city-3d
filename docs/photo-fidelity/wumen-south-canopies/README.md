# R58-A N3: three south portal protective canopies

Object: `FC-AD4377DF51` (Wumen). This is a second, separately staged change after N2. Status: **VERIFY_PENDING**. It is not whole-Wumen or browser acceptance.

## Evidence and bounded fit

I actually viewed the official Palace Museum north-oblique and south photos before implementing these stages. The south image resolves **three narrow yellow-tiled protective eaves immediately over the three existing central south mouths**. It does not resolve bracket construction, concealed attachment, exact pitch, thickness or dimensions. The image is evidence for this exterior feature, not authority to add two lateral routes or change other roofs.

- South source: https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg
- North source: https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg
- Building context: https://www.dpm.org.cn/explore/building/236454.html
- Photography date is unspecified. The URL date is not asserted to be the photography date.

Implementation adds exactly three plain closed sloping tile volumes, using the existing `roof_tile` material. The original centers `[-17.5,0,17.5]`, portal widths `[5,9,5]`, and head datums `[6.5,8,6.5]` remain fixed. Conservative model-fit parameters: 0.7 m side overhang, 1.1 m south projection, 0.04 m concealed wall overlap, 0.18 m thickness, 0.2 m rise. The front underside is 0.1 m above the inherited head datum. These are **model-relative fit parameters, not measured historic dimensions**. Plain wedges deliberately omit unresolved brackets, rafters, ornaments and concealed connection details. They are not generic hall roofs.

## Scope and hookup

`WumenSouthPortalCanopies.js` owns only this optional layer. `HOOKUP-PROPOSAL.patch` is for the integration owner; no shared builder, kit, zone, data or queue files were edited here. Append its single root group at the end of `buildWumen`, just before `finish(g)`, rather than inserting it before inherited children. Thus inherited indices 0–40 and the ascent slot remain intact; root count becomes 42. Existing fixed-root-count guards need an explicit scoped additive-layer treatment by the owner, never blanket rebaselining.

The helper registers no colliders or walkables, creates no owned materials, and changes no original door, south mouth, north arch, platform, tower, wing, pavilion, ascent, upper support, main roof or plaque. Existing scene geometry ownership/disposal applies to the three ordinary new meshes.

## Checks and evidence

- `red-original.txt`: original red test output, 5 failures before implementation; retained unmodified.
- `green-focused.txt`: 56/56 passes for N2 standing/traversal and N3 focused suites. This does **not** include or supersede the separate N2 jumping failure described below.
- N3 tests verify exactly three closed positive-volume manifold meshes, top/bottom solid rays, grounded human clearance, all original-child fingerprints, physics/material registration preservation, invalid-profile rejection and exact finite historical-layer recognition.
- N3 actual FirstPerson controls: 3 mouths × 10/60 Hz × both directions, 12 traversals. They are grounded traversals, not full-height collision acceptance.
- `evaluateWumenSouthCanopies(W)` inspects only a supplied existing scene and CollisionManager. It does not build a world. Missing, hidden and zero-opacity roof negatives must fail. It samples both top and underside surfaces at six locations per canopy.
- `npm run build`: successful, with inherited large-chunk warning.
- N2 new jump-boundary investigation found central-arch shoulder penetration at 60 Hz near the legal wall boundary. N3 does not fix, conceal or broaden acceptance for that separate north-head defect. A later, separately approved north-head collision repair and its local integrated tests are recorded in ../wumen-north-portals/OVERHEAD-REPAIR.md; the original N2 red evidence remains intact.

## Actual-geometry CPU comparison

The four PNGs under `reports/r58-wumen-south-canopies` use the same actual mesh geometry, production HD albedo maps, fixed diagnostic lighting and identical camera for each before/after pair. N2 is present in both stages so these pairs isolate only N3. `cpu-capture.json` records source hashes and cameras. This is **CPU diagnostic evidence, NOT a browser screenshot or browser acceptance**. The cropped scope contains the Wumen base and canopies, not a full world.

- Wide: camera `[0,6,-58]`, target `[0,6,-13.3]`, FOV 58.
- Center: camera `[0,7.2,-28]`, target `[0,8,-13.3]`, FOV 42.

No source-photo file is copied into source, public assets, reports or a production ZIP. No browser workaround, upload, main merge, Pages publish, account or permission operation is part of this handoff.
