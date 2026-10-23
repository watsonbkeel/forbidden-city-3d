# R58-A / Taihemen south open veranda

Entity: FC-B3B12CF397. Baseline: `755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da`.

This is one partial Taihemen change, not acceptance of Taihemen, A37, or the whole project. New source files only; PalaceBuilder and canonical photo-fidelity status remain the integration owner's responsibility.

## Implemented, fitted, retained, unknown

- Implemented: the south eave has seven genuinely open porch bays and two closed end bays. The old six full-height eave infills, six folded eave leaves, continuous upper red infill over the seven bays, and broad two-part eave collision wall are replaced only on the south side.
- Implemented as an explicit topology fit: the inherited six closed / three open inner bay pattern is recessed to the first existing inner column row. The threshold and folded leaves move with that enclosure. Each new visible closed panel and folded leaf has a matching blocker. No floor support is added.
- Fit, not measured: the inner enclosure uses the inherited inner row at local Z −3.423333333333333, 6.846666666666667 behind the eave. The sources establish recession, not this distance. The leaf pattern and opening pose are inherited gameplay placeholders, not a verified door inventory or visitor-access policy.
- Retained exactly: 48.06 × 20.54 envelope, all 40 old column transforms, nine frontage bays, three modeled depth intervals, complete roof, plaque, north-half actual triangles/navigation, platform/approach geometry below the hall floor, south approach profile, and every walkable.
- BLOCKED_SOURCE: the museum states four depth bays, but a usable current plan / section and full column-occupancy evidence were not obtained. No fifth datum or speculative 50-column grid is generated. The physical four-depth reconstruction is still unimplemented.
- Remaining: full inner door/window positions/count, both end spaces, overhead hall frame/ceiling and decoration, back face, exact dimensions, lateral approach joins. No claim is made that unseen rooms are empty.
- VERIFY_PENDING: actual browser before/after views and source-camera alignment. CPU images are geometry diagnostics only.

## Owner integration

Apply the exact three-hunk `HOOKUP.patch`, or the before/after strings in `HOOKUP.json`, to PalaceBuilder.js. Do not change REAL.open, inheritedDepthBays, dBay, columns, north loop, roof, plaque or approach.

1. Import `buildTaihemenSouthEnclosure`.
2. In the existing facade loop, Taihemen/south alone calls the helper and continues before generic infills, header, beam and the old two broad colliders.
3. The generic threshold loop skips Taihemen/south only because the helper owns the recessed threshold.

The test fixture applies these exact strings in memory and reconstructs an independent pre-hook baseline if the owner already integrated them. It never writes PalaceBuilder.js.

## Checks

Run:

- `node --test tests/r58-taihemen-*.test.mjs`
- `node tests/r58-taihemen-cpu-export.mjs`
- Raster each `evidence/*-before.json.gz` and `*-after.json.gz` with `python tests/r58-taihemen-cpu-raster.py INPUT OUTPUT.png`.

The 20 focused tests cover true merged gate geometry and real FirstPersonControls at 10/60 Hz, walk/sprint, ground-start south approach, porch sweep, recessed center passage, north exit/return, visible closed-inner-bay stops, body clearance, rendered floor support and no selected rescue support. There is one placement call at route start, no corrective teleport or synthetic walkable. The pure `assertTaihemenInWorld(W)` consumes an existing W.scene / W.cm for the owner's final integration; it neither builds nor repairs a world. Negative mutation fixtures reject hidden lattice, hidden ancestors/materials, and loss of both platform and paving render meshes. Seven downward rays also verify rendered support. The retained slab caps sit 0.02/0.03 m above the unchanged support datum, so the probe explicitly allows the inherited 0.04 m paving tolerance.

The delta is +60 actual triangles, +0 merged meshes, +12 colliders, +0 walkables. Added blockers correspond to two end infills, six recessed infills and six rotated leaves; the two old broad eave AABBs are removed. Evidence and exact hashes are in `evidence/geometry-summary.json`.

Not run by this bounded implementation: production build/package, aggregate full-world regression suite, browser/GPU tests, phone/FPS tests, deployment. At baseline an incorrectly placed Node test filter caused the existing approach file's final canonical stepwalk subprocess to run once; it passed, was disclosed immediately, and was not repeated. It is not credited as final whole-world validation.

## Images and sources

`evidence/south-front-comparison.png`, `south-oblique-comparison.png`, and `porch-looking-south-comparison.png` show actual before/after gate triangles at identical cameras. The flat material-category palette is diagnostic, not the production textures, runtime shadows or sunlight. The blank neighboring world is intentionally absent in this gate-only capture. In the official looking-south photograph, the foreground is Taihemen; the distant Wumen must not be treated as Taihemen interior geometry.

Original official photos remain only in the external research cache and were actually viewed. They are not embedded in source assets, public files, or a production ZIP. See `SOURCE-DIFF.md` for source coverage, unknowns and next evidence needed.
