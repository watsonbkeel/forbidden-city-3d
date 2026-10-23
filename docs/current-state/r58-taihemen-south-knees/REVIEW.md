# R58-A · Taihemen south under-beam knees

## Bounded result, not building acceptance

Canonical object: **FC-B3B12CF397 / 太和门**. Local subfeature: **TAIHEMEN-SOUTH-EAVE-KNEES**.

The seven already-open south porch bays now have fourteen shallow scalloped knee halves, two inward-facing halves per bay. Only `TaihemenSouthKnees.js` and an import plus one call in `TaihemenEnclosure.js` change production behavior. All other production files and canonical queue/release/source-freeze files are untouched.

Status remains **VERIFY_PENDING_BROWSER**, with the enclosing exterior/interior still partial. This does not complete the gate, whole beam/ceiling grid, decorative carving or painted ornament.

Canonical feature linkage, for the integration owner:

- Exterior `bays_columns_brackets_beams_paint_zones`: this corrects only the previously missing south under-beam silhouette. Existing bracket shapes, paint hierarchy, north facade and the occupied four-depth-bay question remain unresolved.
- Interior `ceilings_caissons_frames_paint_screens_fixed_joinery`: the same eave-edge fragment is relevant evidence, not closure of the entire interior framing feature.
- Exterior-list `A37-required-scope-06` remains required and unresolved. No coffer/beam-grid reconstruction or canonical facet move is made here.

## Own references and fit

All three actual source images were viewed during this implementation. Exact source URLs, SHA-256, dimensions, approximate inspection regions and coverage are in `source-observations.json`. No official image pixels are included in this directory, Git change or generated evidence.

1. [Own south front](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg): establishes the seven open bays and repeated short silhouettes at their column ends, below the lower fascia, not above-beam dougong.
2. [Own oblique close-up 3](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9308131.jpg): resolves the heel beside the column and scalloped upward taper. Approximate inspection region is image x325–579/y745–835 in the 1000×1777 source.
3. [Own opposite oblique close-up 4](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9310fb3.jpg): corroborates that silhouette and distinguishes it from the painted beam face. Approximate region x389–665/y714–813.

The upper edge attaches to the existing beam; the root sits slightly inside the retained column mantle. A short heel and three simplified scallop groups fit the visible outline. No Xihe/Xiehe member is imported or reused. No unresolved curls, relief, dragons, exact gold outlines or texture motifs are invented. A single dark turquoise basic material represents the member category; it is not a claim to reproduce the full polychrome design.

These are **relative photograph fits**, not measured dimensions. Reach from the inset root is 0.27 of the existing 5.34 m bay (1.4418 m). Drop is 0.975 of the retained column diameter (0.83304 m). Exploratory reach/bay 0.24–0.31 and drop/diameter 0.8–1.2 describe fitting uncertainty, not confidence intervals or sourced metric measurements. Extrusion depth is an engineering assumption of 0.26 m; a 0.15–0.40 m sensitivity range is unmeasured, not extracted from the photographs. The 0.025 m beam overlap and 0.75-radius root position provide robust model contact, not reconstructed historic joinery.

Photography dates are unspecified. The 2020/04/16 URL path is not treated as capture date or proof of 2026 condition. Unseen reverse relief and thickness remain unknown.

## Geometry and exact retention

The actual production `PalaceBuilder.buildGate` and `mergeByMaterial` path is exercised on **Taihemen only**. The before case is the same current builder with only the new helper call removed in memory. It does not revert to the pre-veranda enclosure or overwrite source files.

- Before: 15,816 triangles, 17 merged meshes.
- After: 16,824 triangles, 18 merged meshes.
- Added: **1,008 triangles / 14 closed halves / 1 merged material mesh**.
- Existing 15,816 triangles, their world-space vertices, full position/normal/UV attributes, declared material parameters and root transform hash remain identical.
- All 40 retained column transform records remain identical.
- Existing roof, plaque, floor, platform, stairs, rails, north geometry, two end closures and recessed door/header/leaves are covered by the unchanged retained-triangle hash. No separate hidden geometry replacement occurs.
- **Collider delta: 0.** All 142 ordered registrations remain byte-equivalent.
- **Support delta: 0.** All 4 ordered walkable registrations remain byte-equivalent.
- Existing south approach profile and enclosure metadata remain identical.

Each new half is finite, watertight, outward wound with positive signed volume, and has no zero-area triangle. Actual front/back/top triangle rays establish the merged solids. Paired rays to the retained beam surfaces and column mantle prove overlapping physical contact rather than relying on helper metadata or bounding boxes alone. Negative controls reject missing/hidden knee geometry and detached supporting beam/columns.

Minimum knee y is 9.4403438568. The retained floor is y3.44. A conservative envelope using the actual 1.7 m player eye/head height, 7.2²/(2×14) m jump rise and an additional 0.5 m body-radius margin ends at y7.4914285714, leaving **1.9489152854 m** clearance. No collider is needed at this unreachable height; no full-bay floating AABB is introduced.

## Checks and evidence

- `reports/r58-taihemen-south-knees/red.tap`: four intentional new-test failures before implementation, retained as TDD evidence.
- `reports/r58-taihemen-south-knees/focused.tap`: 18 scoped checks passed, including exact retention, physical attachment, negative controls, pure-consumer nonmutation stale-matrix and caller-atomicity regressions, actual scallop cutout rays, and real-controller ground-start porch sweep/north return at 60 Hz walking and 10 Hz backward sprinting. No corrective teleport or synthesized support.
- `reports/r58-taihemen-south-knees/previous-regression.tap`: all 20 existing Taihemen profile/enclosure/fragment/consumer checks passed unchanged, including closed-inner-bay controller stops and inherited route cases.
- `evidence/geometry-summary.json`: original capture count/hash deltas, exact camera matrices and source-file hashes.
- `reports/r58-taihemen-south-knees/final-geometry-summary.json`: fresh final-code narrow production re-export and pure-consumer result after the two review fixes.
- `reports/r58-taihemen-south-knees/final-render-equivalence.json`: all six saved image exports have exactly the same triangle/material multiset, camera and palette as the final re-export. Only additive-call placement and derived-matrix refresh changed after capture. Original capture hashes are preserved, not silently rebound; unchanged images were not rerendered.
- Six `evidence/*-before.png` / `*-after.png` images: same-camera front, oblique and close views rendered from actual merged production triangles, with explicit flat diagnostic colors. Corresponding compressed triangle exports are included for reproducibility.

The six images are CPU geometry diagnostics. They are **not** browser/GPU screenshots, production texture/shadow verification, source-camera matches or visual acceptance. The known Chromium sandbox socket denial, prohibited sandbox path and cloud-localhost limitation were not retried or bypassed. No full-world creation, broad suite, build, upload, Pages action or dependency installation was run for this change. Historical failures outside these named focused checks are neither erased nor represented as passing.

## Parent integration

Import `assertTaihemenSouthKneesInWorld` from `tests/lib/r58-taihemen-knees-world-check.mjs`, then call it with the already-built `W` containing `scene` and `cm`. It imports no builder, fixture, world loader or production knee geometry. It observes actual merged surfaces and existing navigation and refreshes only derived world matrices when needed, without changing local transforms, geometry or registrations. The producer-level zero collider/support delta is explicitly labeled; the component report provides the before/after equality proof.

The exported `TAIHEMEN_KNEE_VIEWS` are diagnostic cameras only. Do not interpret them as source registration.

Canonical queue, feature acceptance, final cumulative-world checks, source freeze and release ownership remain with the integration parent. Final browser comparison, full overhead framing, member thickness, paint/carving, occupied column grid, north/reverse and complete interiors remain open.

## Reproduction

Run these scoped commands from this checkout:

- `node --test tests/r58-taihemen-south-knees.test.mjs tests/r58-taihemen-knees-consumer.test.mjs`
- `node --test tests/r58-taihemen-profile.test.mjs tests/r58-taihemen-enclosure.test.mjs tests/r58-taihemen-existing-world.test.mjs tests/r58-taihemen-fragment.test.mjs`
- `node tests/r58-taihemen-south-knees-cpu.mjs`
- For each exported `.json.gz`, run `python tests/r58-taihemen-cpu-raster.py INPUT.json.gz OUTPUT.png`.

The capture summary binds to the recorded base HEAD plus exact file content hashes, not an unstated clean-HEAD assumption. Final-code equivalence is independently recorded by `python tests/r58-taihemen-knees-rebind.py /tmp/r58-taihemen-knees-final` after a narrow export to that directory. A final commit binding is recorded separately after commit without regenerating unchanged geometry.
