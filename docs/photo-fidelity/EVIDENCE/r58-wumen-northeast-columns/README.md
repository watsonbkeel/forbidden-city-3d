# R58-A northeast Wumen pavilion: north external column row

Status: VERIFY_PENDING_BROWSER. This is one bounded component of INSTANCE-A-WUMEN-EAST-NORTH-PAVILION, parent FC-86C9330D65. It is not acceptance of this pavilion, the four-pavilion group, Wumen, or A37.

Frozen integration source: 1549a70b51ac184695aeebbca725ec4d809a4454. Work branch: r58-wumen-northeast-columns. The integration tree and production PalaceBuilder.js were not edited by this worker.

## Actual change and hookup

Only new production file: src/scene/palace/special/WumenPavilionColumns.js. Apply HOOKUP.patch to the integrator-owned PalaceBuilder.js: one import and one guarded call after pb placement in the s === -1, pz === pN branch. The helper also requires the stable instance ID and retained transform/shape/proxy preconditions. No persistent child-number identity is used.

The two old middle north columns are removed. Four registered middle columns replace them, sharing the exact retained cylinder geometry and material. Both original corner meshes remain. The north row changes from four columns/three equal spans to six columns/five unequal spans; the south row stays at four columns. No side-row completion or mirroring to the other three pavilions.

Local increasing X coordinates (metres in the retained model):
- -5.5
- -4.081881533101045
- -1.7055749128919864
- 1.705574912891986
- 4.043554006968641
- 5.5

All have local Z = +5.5. Wumen-local row Z = -0.5; body center = (-47.7, 12.3, -6). Registration formula: x = +5.5 - (pixel - 239) * 11 / (526 - 239). East is image-right in the north-up eastern plan, but -X in this model. Five widths follow the pixel differences 37, 62, 89, 61, 38 in increasing model X, not five equal divisions. These are reversible pixel fits within the existing 11 m boundary, not surveyed measurements. Existing body height 7.5 m, shaft height 6.6 m and radii 0.25/0.2625 m are retained, not newly established.

## Source observation and limitations

The official 800 × 600 north-oblique photograph, its northeast-pavilion crop, and the 2021 eastern-plan junction crop were actually viewed. Source URLs, SHA-256 identities, direction, dates and exclusions are in source-registration.json. The photograph independently shows six foreground north columns, separate from the inner enclosure; the plan supplies the six axes and unequal spacing. The crop is not an independent photo. Photograph capture date is unknown; its URL upload date is not capture date. The 2021 plan contains temporary exhibition insertions, none of which were copied.

No source photograph, crop, or PDF is included in this repository delta. All four delivered PNGs are actual model CPU renders, with a visible non-browser label.

## Geometry, ownership and physics

Ten existing target-body raw mesh records remain byte-equivalent in the production capture: position, world matrix, geometry parameters, indexed positions/normals/UVs and material name. The two old middle mesh records are absent. All four new middle meshes preserve the original cylinder attributes/index/material and change only X placement. Other pavilion bodies/roofs, both wings, main tower, ascent, platforms, lower passages and canopies remain exact under before/after fingerprints. The original inner enclosure is retained, not independently accepted as correct.

Only the four matching north-column local collider records are replaced by six geometry-derived, y ≤ 3 proxies. The old generic 0.5 m-wide proxies under-covered the tapered 0.525 m feet; new north proxies use actual Float32 geometry bounds, including the retained corners. All non-north local proxy objects and values remain unchanged. Tests prove no obsolete middle-axis local proxies remain. The corrected columns near the old axes overlap those axes spatially, so an empty ray at an old axis would be an invalid ghost test; raw mesh identity and actual merged triangle/cap-center checks are used instead.

buildWumen does not register these local column records. Its existing northeast whole low-body AABB remains exactly [-53.2, 12.3, -431.1] to [-42.2, 15.3, -420.1] in world coordinates. All 335 runtime collider registrations and 13 walkables are unchanged. Between-column access remains blocked by the whole-body envelope. This work does not change controller, support, permission, or opening policy. The retained whole-body envelope is not claimed to match every external column's protruding radius.

All six column bases contact retained visible stone-slab deck triangles at y = 12.3 within 2e-7 m Float32 tolerance. Raw local-to-Wumen transforms and actual final world-space positions are checked separately.

No new geometry or material allocation is required by the helper. Removed meshes share geometry with surviving columns, so it is not prematurely disposed. Final merge disposes each merged source geometry once; retained noMerge plaque geometry is disposed on builder disposal. Merged geometries are disposed once, and materials are not disposed by the refinement/merge.

## Verification and exact cost

- Red-first: initial 8 tests had 6 expected failures, including count/placement/proxies, before the helper existed (red.tap).
- Final component regression: 10/10 pass (green.tap), including invalid/wrong instances, wrong transform, repeat application, complete body nondegeneracy, merge, retained collision, visibility/opacity negatives and disposal.
- Current focused regression: 94/94 pass for this component, north portals, south canopies and folded ascent (passing-focused-regression.tap).
- An additional historical-retention run: 96/101 pass, 5 existing failures in wumen-ascent-retention. Its old root-child assertion expects 41 but frozen source has 42 after south canopies. PalaceBuilder and those test/helper files are byte-unchanged from 1549a70. No unrelated historical guard was changed or hidden (focused-regression.tap).
- Exact two-line hookup executes in a temporary sibling module, with production PalaceBuilder.js left untouched. Its actual merged scene passes the consumer and all original runtime registrations compare equal (hookup-proof.json).
- Production TextureLibrary + HD textures: actual merged geometry/material-name consumer passes (production-material-consumer.json). The raw capture uses production UVs/material names; the separate baseline.json structural fixture intentionally uses stable stub library names/tileSize=1.
- Syntax checks and git apply --check HOOKUP.patch pass. No full world, full test suite, production build/package, browser retry, publication, push, or main changes were run.

Target body: 12 → 14 raw meshes; 432 → 528 triangles. Wumen: 424 → 426 raw meshes; 33,932 → 34,028 triangles. After actual merge: 25 → 25 mesh draws. Net: +96 triangles, +2 pre-merge meshes, no new material/draw call after merge. verification.json contains exact counts, hashes, fit, local proxies and the existing-W report.

## CPU evidence, not browser acceptance

before/after-north.png and before/after-northeast.png use the same cameras, FOV, dimensions, actual scoped Wumen triangles and HD albedo (capture.json). All four images were actually viewed. The north comparison shows six columns separated from the untouched inner enclosure. The oblique comparison confirms the same instance and contact while showing retained, uncorrected side-wall/roof simplifications. Differences are restricted to the column image region: north 31,453 pixels, northeast 24,104 pixels (pixel-difference.json). Pixel difference is a locality diagnostic, not an accuracy score.

Real browser acceptance remains blocked and was not retried. CPU renders cannot prove browser appearance, full architectural authenticity, or all other pavilion faces. The target's inner shell, side columns, roof detail, joined corridors and other pavilions remain separate review work.

## Reproduce and consume

Run node --test tests/wumen-northeast-pavilion-columns.test.mjs.
Run node tests/r58-wumen-pavilion-hookup-proof.mjs for the exact guarded hookup without editing PalaceBuilder.
Run node tests/r58-wumen-pavilion-columns-cpu.mjs <external-output-directory>, then use tests/r49b-plaque-cpu-render.py with the cameras in capture.json.

Parent integration must call assertWumenNortheastColumnsInWorld(W) from tests/lib/r58-wumen-pavilion-world-check.mjs on its already-built W. That consumer never builds a world or installs geometry; it verifies one stable instance, six actual merged cylinders (288 triangles), cap centers, displayed material, real deck contacts and the retained whole-body envelope. It accepts ordinary production material names and retained solid-batch material provenance. It rejects absent/hidden/transparent or relocated geometry, duplicate identities and a removed body envelope.

Rollback: revert the helper/evidence commit and remove the two hookup lines if they were applied. Do not delete or alter any earlier Wumen geometry.
