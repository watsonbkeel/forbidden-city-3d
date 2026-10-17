# Qin’an Hall exterior research prototype

This is a reversible local research candidate. It is not a complete outline, full timber-frame reconstruction, accepted present-day reconstruction, or current museum visitor route. The intended interaction is ground-level exterior preview.

## Identity and source boundary

- Base: accepted local skyline commit `a59fa7ec18b6ce991128a2e7700ba09be3128078`, whose parent is delivered V7 `35914d6c2bc16dbb9fd7245d6384195ece5e125d`.
- Dedicated dispatch: `structure: qinan-hall`, `qinanProfile: qinan`; only the Qin’an hall record changes in `garden.json`.
- Authoritative parameters: `data/architecture/qinan.json`. Pure adapter: `QinanProfile.js`; construction: `QinanHall.js` and `QinanRoof.js`.
- Profile ID `qinan-exterior-study`, revision `1`, content SHA-256 `c0af8e56dec75a586fcb3b9a9f67beea0beca2221e3697e52e560e768f9ea8b2`. Hash input is recursively key-sorted JSON excluding only `profileHash`; tests recompute it and detect a stale parameter. The digest identifies parameters, not successful route validation or the implementation source tree.
- Official photos and extracted PDF images were inspected privately. No source photograph, PDF crop, new texture, or external asset is copied into this repository or runtime.

Sources are [S1 structural study](https://www.dpm.org.cn/Uploads/File/2018/06/04/u5b1521c1583e4.pdf), [S2 historical drawings](https://www.dpm.org.cn/Uploads/File/2019/12/09/u5dedc722f21af.pdf), [S3 rebuilding announcement](https://www.dpm.org.cn/classify_detail/160235.html), and [S4 official photograph](https://www.dpm.org.cn/explore/building/236494.html). S1 is a 2015 publication using 2004 survey and 2013 indirect supplementation. S2 was published in 2015 and reproduces museum-held 1943 drawings; it is not a modern reconstruction as-built. S4 photo date is unknown. Rebuilding evidence does not convert historical dimensions into a present-day measured survey.

## Geometry and evidence classes

1. DIRECT_MEASURED lower foot bays: X = 4.030, 4.150, 4.710, 4.150, 4.030 m; Z = 1.650, 7.340, 1.650 m. Arithmetic totals are 21.070 × 10.640 m. Six X axes and four Z axes are retained; only the 16 perimeter nodes are built. The known four interior golden pillars remain omitted because their exact axis mapping was not verified. There is no automatic 24-column Cartesian grid.
2. DIRECT_MEASURED upper head bays: 2.382, 4.114, 4.625, 4.1145, 2.397 m, depth 7.1905 m. Their sum is 17.6325 m. This independent grid is not a roof-board size. Upper vertical frieze articulation is explicitly an exterior skin, not invented complete golden-column construction.
3. DIRECT_MEASURED heights remain relative to column-base upper face: eave column 4.290; lower purlin 5.180/5.460; golden column 7.485; upper purlin 8.555/8.834; ceiling underside 8.271; board underside/top 10.346/10.596 m. Only some are exterior geometry landmarks; unmodeled structural references remain provenance, not fabricated objects.
4. SOURCE_DERIVED wood board uses 14.3 × 4.1 m, with drawing-reading ranges 14.1–14.6 and 3.9–4.3 m. The two cut-rafter guides are 25.1 × 14.7 m at relative edge 5.15 m and 21.7 × 11.4 m at 8.55 m. They are structural section guides, not tile or ornament maxima. The lower inner height uses 6.9 m within the drawing range 6.8–7.0. Span/height reading allowances are 0.3/0.15 m; these are not statistical intervals or guaranteed current-building errors.
5. SOURCE_DERIVED annex projects 6.7 m south of the main front column line, within the 6.5–6.9 m reading range, with five bays. Main front local Z is −5.32; annex front is −12.02. Source drawings may share historical underlying material, so agreement is not independent survey corroboration.
6. SOURCE_DERIVED north wall: S1 Fig2 and S2 plan both show continuous north-wall hatching without a central doorway at cut height. This justifies removing the generic north-through doorway from this drawing-based preview; it does not assert that a real door is closed today, or prove no high-level windows.

The old 24.1 × 14.1 m OSM roof bounding rectangle, seven equal bays, 8.8 m column height, generic wudian roof, imperial throne, room/through-door metadata, north stair, south ramp, and generic rectangular platform are absent from the dedicated builder. No hidden generic geometry or second floor remains beneath the replacement.

## Explicit modeling approximations

All numerical approximation fields, including member thicknesses and sampling counts, are in the JSON under their own PROVISIONAL sections.

- World anchor (0,493.1), rotation 0: inherited model alignment, not a surveyed foot-grid origin.
- Floor Y = 1.5 m: inherited model fit. Column-base upper face = 1.62 m; the separate +0.12 m base offset is provisional. Measured relative heights are added to 1.62, never directly called world survey heights.
- Roof skin: thickness 0.12 m; drip extension 0.18 m; corner lift 0.18 m; sag control 0.12 m; shallow cover crown 0.08 m. Rectangular perimeter ridge is 0.22 m wide × 0.26 m high. Schematic finial is 0.75 m tall, radius 0.24 m; dimensionless rotational shape ratios are explicit. The resulting highest point 13.166 world m is a model output, not a measured total.
- Annex front column top is relative 3.0 m, rear roof connection 4.25 m. Front/side roof overhangs are 0.70/0.75 m; rear overlap 0.08 m and rear high-edge inset 0.70 m. No exact hidden joint or roof-type name is asserted.
- Annex front and side lattice panels are closed preview skins with unknown real door state, including unknown side-door/open-portico semantics. Their upper closures intersect the actual emitted roof triangles; no accidental wedge opening is left above a constant-height side panel.
- Main/upper bracket aprons are simplified painted enclosure skins, explicitly not measured dougong. They follow actual tessellated roof intersections and have outward-facing triangles; no DoubleSide workaround is used.
- Shared annex roof seam coordinates and subdivisions are identical on both adjacent patches, including their undersides. The crown vanishes at every plateau edge. Degenerate pole/collapsed triangles are removed; exposed annex rear tile edges have thickness caps.

## Support and access

SOURCE_DERIVED railing guides: main width 24.4 m, north Z +7.0, inset turn Z −7.0; annex rail width 22.4 m, south rail Z −12.9. Side stairs have 2.0 m plan width, center Z −9.9, and 4.3 m projection from the side railing centerline.

The visible support body is independently PROVISIONAL: stone extends 0.18 m beyond rail centerlines, with an 0.08 m paving cap. Main slab local bounds X ±12.38, Z −7.0…+7.18; annex slab X ±11.38, Z −13.08…−7.0. There is no overlapping duplicate floor. The side stair toes stay at X ±15.5; their physical run to the slab edge is 4.12 m, with ten 0.15 m risers. Every tread box, visible top, collider and support uses the same generated descriptor. Twenty-two supports have stable `qinan-*` IDs and `rescue:false`; no roof support exists.

Nominal rail-to-column-axis distances 0.665 m at the annex sides and 0.88 m at its front are not clear widths and cannot certify passage for the unchanged 1 × 1 m player box. Neither source geometry nor colliders are shrunk to force access. Side stairs are visible, physically supported study geometry; terrace and interior routes remain unaccepted. CPU incidental-approach probes stopped before the annex enclosure and could return to ground. That does not validate a terrace route.

Navigation exposes an exterior-view candidate at world (18,477), feet 0, looking toward the low annex. The profile factory explicitly returns an unvalidated candidate; the navigation worker owns actual-world validation and runtime acceptance. The map separately exposes two slab footprints and the unchanged main label anchor. It does not move the main structural origin to the annex-inclusive rectangle center.

Known visible omissions: the unresolved 3.0 × 6.7 m south axial composite stonework, Tianyi gate, Qin’an courtyard walls, exact rebuilt joinery/ornament, and verified interior golden-column mapping. The south axial footprint is retained in `omittedFeatures` metadata, never an invisible collider or walkable ramp. Its missing levels must not be invented to call this a complete outline.

## Ownership, lifecycle and CPU budget

Everything belongs to the existing garden ZoneBase/CourtKit lifecycle. No InteriorLoader shell, static GardenBuilder addition, new texture, global Collision/player change, or generic roof-builder overhaul is included. Architecture identity/provenance and map metadata survive material batching. Source geometries dispose during merge; merged geometries and owned materials dispose once on unload; library resources remain shared. Actual ZoneManager prebuild/load/unload/rebuild was exercised for three deterministic cycles.

| Exclusive role | Mesh instances | Triangle instances |
|---|---:|---:|
| qinan-support-body | 2 | 24 |
| qinan-support-paving | 2 | 24 |
| qinan-side-stair-step | 20 | 240 |
| qinan-main-column | 16 | 384 |
| qinan-column-base | 22 | 264 |
| qinan-annex-column | 6 | 144 |
| qinan-north-wall | 1 | 12 |
| qinan-main-side-wall | 2 | 24 |
| qinan-main-south-upper-strip | 1 | 12 |
| qinan-annex-front-panel | 5 | 60 |
| qinan-annex-side-panel | 2 | 24 |
| qinan-main-beam | 4 | 48 |
| qinan-annex-beam | 1 | 12 |
| qinan-upper-frieze | 4 | 48 |
| qinan-upper-grid-pilaster | 12 | 144 |
| qinan-railing-post | 41 | 492 |
| qinan-railing-panel | 10 | 120 |
| qinan-railing-hand | 10 | 120 |
| qinan-lower-roof-tile | 4 | 256 |
| qinan-upper-roof-tile | 4 | 256 |
| qinan-bracket-apron | 8 | 144 |
| qinan-wood-roof-board | 1 | 12 |
| qinan-flat-roof-cover | 1 | 48 |
| qinan-perimeter-ridge | 4 | 48 |
| qinan-finial | 1 | 80 |
| qinan-annex-roof-tile | 3 | 160 |
| qinan-annex-enclosure-apron | 3 | 52 |
| Total | 190 | 3252 |

- Full hall: 3,252 triangles versus old 3,382 (−130). New 140 colliders and 22 supports versus old 32 and 3; these CPU costs increase and must not be hidden behind triangle savings.
- New source geometry: 190 unique geometries, 286,088 CPU attribute/index bytes versus old 65 and 251,948 bytes. These are temporary source/CPU geometry facts, not GPU memory measurements.
- Actual complete garden: 53,656 triangles versus old 53,786; both have 20 merged material meshes. Removing the one dedicated hall produces 50,404 triangles and 19 merged meshes. Individual hall batching to 10 meshes is not a claim of ten renderer calls or draw-call savings.
- Alternative unloaded roof-tile silhouette: 720 triangles versus old 800. It retains actual main truncated roof and low annex tile surfaces. Gold finial/perimeter detail is intentionally absent from this existing roof-only LOD. Do not add the silhouette difference to the simultaneously visible full-hall difference.

All original global renderer budgets and the inherited Shenwu 11 m anchor issue remain unchanged. No GPU or browser gate is claimed by this CPU work.

## Validation checkpoint

- `node --test tests/current-state/qinan-hall.test.mjs`: 20/20 passed after the final cap-winding and input-validation changes. Red-first checkpoints include absent profile/dispatch, budget/board/apron requirements, stale hash, invalid dimensions, seam helper/outward faces, missing annex rear edge caps, and mirrored outer/inner cap winding. Both mirrored outer eaves pass FrontSide exterior rays at three stations; all 196 emitted vertical cap triangles across every roof patch face away from their own patch interior. The winding-only correction changes no profile coordinates or resource counts.
- Full-world no-rescue side-stair approach/retreat diagnostic: 18/18 passed over both sides, three lateral tracks and three CPU movement increments. It is not the full production-controller terrace-route matrix.
- Post-cap-fix current-state CPU suite: 456/456 passed on the shared integrated skyline/sun/Qin’an tree. This supersedes the earlier moving-tree 449/451 result, whose two failures were historical sun-versus-skyline snapshot assertions. The owner still owns the final integrated freeze run.
- Vite build passed before the final 12-triangle cap repair, with the existing large-chunk advisory. The owner will rebuild the frozen integrated tree; this card does not claim a final browser/GPU or production pass.
- No commit, remote push, main merge, publication, or deployment was made by this implementation worker.

## Frozen-browser texture correction

The first integrated runtime freeze (`9e16bd6d5f2b6c84f1008f8b24aab3b0f59c4d71`) passed 650 Node tests, but its actual compiled HD/SD captures exposed blue/gold vertical smearing on the new painted aprons. Their vertical faces had inherited roof XZ UV projection, so every one of the 196 apron triangles had a collapsed texture-space area. This is a rendering defect, not an evidence uncertainty; that first visual candidate was rejected and its raw images retained.

The repair changes only UV arrays: painted strips use edge-distance U at the existing library period and full-height V from the strip bottom to the actual roof intersection. The period continues around each connected apron sequence. Vertical tile-thickness caps use along-edge/down-thickness coordinates while the main top/underside roof UVs retain their prior projection. The new lattice-panel and painted-beam boxes use the project's existing full-height band mapping, rather than cropping a vertically clamped texture through generic box UVs. Existing illustrative texture assets and shared repeat/wrap/material objects are unchanged; this does not establish the building's true decorative pattern.

Independent pre/post mesh snapshots bind the fix to the first freeze: all 190 mesh positions, normals, indices, transforms and material identities, all 140 colliders, 22 supports, map/profile metadata and 3,252 triangles remain unchanged. Four added UV regressions cover nonzero vertical apron/cap texture-space area, full band height, every orientation and library-period continuity. The renewed browser freeze and final acceptance record, not the first Node pass, determine release readiness.
