# Taihe display-pair successor prototype R2

Status: isolated, self-authored CPU mesh repair candidate; independent re-review pending; owner CPU culling projection found repaired wings and limb/beak continuity, with visibly coarse fallback remaining. The original frozen prototype is preserved unchanged. No product wiring, browser, renderer, Blender, GPU run, publication, GLB export, or runtime acceptance was performed by this worker. The owner's separate CPU projection is diagnostic, not in-game acceptance.

## Files and reproducible checks

- `taihe_display_pairs.py`: deterministic `build_display_pairs('S' | 'fallback')` returns eight assemblies, local triangle meshes, one positive translation per pair member, semantic component/material keys, and source-sized crane anchors.
- `mesh_kernel.py`: private triangle builders; no `bpy`, third-party dependencies, product import, or scene state.
- `verify_candidate.py`: deterministic export and CPU geometry inventory.
- `integration_geometry.py`: deterministic CPU-only non-indexed flat position/normal adapter; no product dependencies or scene effects.
- `geometry_guards.py`: exact fallback material sides, declared reverse-face pairs, targeted outward winding and actual mesh-derived joint/contact checks.
- `tests/test_candidate.py`, `tests/test_repair.py`: 24 targeted standalone tests, including deliberate failing geometry mutations. Run `python -m unittest discover -s tests -v`, then `python verify_candidate.py`.
- `artifacts/meshes-S.json`, `artifacts/meshes-fallback.json`: actual positions, triangle indices, existing material keys per triangle, component names, flat triangle normals, and eight assembly transforms.
- `artifacts/INVENTORY.json`: exact counts, bounds, pair hashes, reference identity, source hashes, and validation scope.
- `SOURCE-NOTES.json`: references only; no museum imagery is embedded or redistributed.

No files in the frozen V16 checkout or the separate V17 column candidate were edited. Reference identity is 57db2276404220f2072d182f759f1422871ac371. The older design card's base notation and old combined triangle arithmetic were not adopted.

## Candidate counts

Counts include both members and all supports. These are rendered triangle additions, not counts discounted by instancing.

| Family | S | Fallback |
|---|---:|---:|
| Elephant/vase/high open stand | 1,128 | 164 |
| Luduan/low stand | 786 | 78 |
| Indoor crane/rock/wood stand | 720 | 110 |
| Provisional incense cylinder/support | 1,164 | 128 |
| Total | 3,798 / 4,800 | 480 / 480 |

The fallback cap has no spare triangles. Counts include 26 explicitly authored reverse triangles for selected FrontSide sheets; they are not discounted by material sidedness or instancing. `local_mesh.two_sided_pairs` lists each intentional opposite-winding pair. The original prototype had 476 triangles but depended on an incorrect all-DoubleSide assumption. The revised ledger and exact component delta are in `REPAIR-DELTA.md` and `artifacts/REPAIR-DELTA.json`. All eight slots already exist; S uses seven, fallback six, and neither uses `glyph`.

## Positions and dimensions

Y-up metres; south/front is -Z. Local hall floor maps to world Y=9.9375. No rotation, reflection, or negative scale is used. Pair mesh identity is exact; left/right differ only in translation. All positions, yaws, support types, and all non-crane dimensions are authoring estimates, not current measured placement.

| Family | x pair | z | support origin y | proposed width × height × depth |
|---|---:|---:|---:|---|
| Elephant | ±1.30 | 11.75 | 2.06 | 0.52 × 1.75 × 0.70 m |
| Luduan | ±2.05 | 11.10 | 2.06 | 0.54 × 0.58 × 0.68 m |
| Crane | ±2.80 | 10.20 | 2.06 | 0.60 × 1.78 × 0.82 m |
| Incense cylinder | ±2.85 | 8.30 | 2.06 | 0.72 × 2.60 × 0.72 m |

The owner approved changing crane y from 2.02 to 2.06 (+0.04 m) and cylinder y from 2.03 to 2.06 (+0.03 m), so supports meet the actual frozen dais-top surface. x/z and object dimensions are unchanged. This corrects the model surface alignment; it is not new museum measurement. There is no arbitrary floating epsilon, architectural edit, or collision edit.

The crane is exactly 1.68 m above its 0.10 m wood stand, overall 1.78 m. The rock/wave base is included inside that 1.68 m. Each mesh-derived straight leg centreline is 0.45 m; the actual lower beak tip to lower root-edge midpoint is 0.17 m. The 1995 account describes restoration in October 1992; these are not a 2026 survey or a modern tolerance claim. All actual upper leg-ring vertices touch the belly; all lower-ring vertices touch the rock. Both actual neck-end rings and the beak-root triangle are within the adjoining head/body surfaces in both LODs.

## Material and geometry integration contract

Resolve triangle material keys against the existing Taihe `M` map. Frozen fallback material sides are DoubleSide only for `gold` and `darkGold`, because existing `tier()` changes those shared materials. `dark`, `teal`, `pearl`, `red`, `stone` and `glyph` retain the Three.js FrontSide default. S source separately disables material backface culling; its behavior must not be generalized to fallback. The source-linked guard verifies this distinction. Do not construct new material objects or change properties, shader features, `vertexColors`, opacity, lights, atlas/UV ownership, or global helpers. Existing MergeUtils normalization does not preserve arbitrary color attributes; this module deliberately supplies none. No glyph or atlas geometry is emitted.

The light crane uses existing `pearl` triangles and green feather regions use `teal`. This is a muted approximate light/green contrast. `pearl` remains its inherited scene-linear (0.27, 0.287, 0.278); it cannot create calibrated white enamel. Gold legs and lacquer-red crown likewise reuse existing materials. The owner's diagnostic projection colors are not a claim about Three.js lighting or actual runtime appearance.

Owner integration after the independent column candidate freezes:

1. Choose exactly one LOD. S replaces fallback decoration; never instantiate both.
2. For each assembly, bake its positive translation into positions. Keep the stated coordinate convention. Blender conversion is (x, -z, y), a proper rotation; it does not require reversed triangles.
3. Split triangles by existing material key and **expand each triangle to separate vertices** with its explicit face normal before creating/merging geometry. `integration_geometry.flat_attributes(mesh, key)` demonstrates this deterministic position/normal-only step. The JSON opposite-face pairs share vertex indices; indexed `computeVertexNormals()` averages their opposite normals to zero and is prohibited for this topology. Do not weld reverse sheets back together. Equivalent split vertex indices are acceptable if every front/back face retains a separate finite unit normal. Any later smoothing must preserve those splits and be independently checked. No material changes are needed.
4. Merge through the existing pipeline. Verify decoded exported positions/counts and the final total of at most eight materials/batches. Seven reused keys here do not independently prove the integrated GLB/runtime batch count.
5. Preserve permanent display blocking and every existing route/camera/anchor. Do not add walkers or colliders, change the dais, or reposition the throne to accommodate these estimates.
6. Run the product's full applicable CPU and GLB checks, then the unchanged visual/navigation/lifecycle/performance gates when the GPU/browser owner permits. The standalone checks are not the app's aggregate suite.

High elephant stands have a genuinely empty centre below their apron. Legs, tusks, trunks, necks and beaks are tapered mesh geometry. Fallback uses very coarse solid/sheet silhouettes. Exposed FrontSide tabletop, ear, crown and shaft sheets have explicit counted reverse triangles; teal wing fields are outward faces of the closed crane body. Pyramid faces are rewound outward. The exposed trunk tip is capped. The omitted elephant rear-head triangle is entirely embedded inside its torso, and the pavilion finial shares every edge of the open upper-eave rim. The exposed lower-eave underside disk is retained. Other open contact rings are checked against their adjoining solids. No material side changes are required. Diagnostic culling inspection and full visual acceptance remain separate. It is not a detailed sculptural reconstruction.

S cylinders have mostly continuous octagonal walls, twelve discrete geometric windows with 12 mm-deep reveals, sparse self-authored winding relief, and double eaves. Roof and finial connections are supported. No translucent lattice or opaque tube secretly fills the windows. Current Taihe-specific cylinder appearance is weakly evidenced: the photographed museum specimen is a generic morphology analogy. Exact present object pattern, support, and position remain provisional.

## What the CPU checks establish

- Eight objects and eight supports per LOD; exact translation-only pair identity
- Actual vertex bounds include all trunks, ears, beaks, eaves and stands
- No positive-volume overlap between display AABBs; clearance from the frozen rail/screen/throne envelopes
- Support bottoms align to y=2.06; no negative scale; no zero-area/nonfinite normals or undeclared duplicate triangles; explicit reverse-face pairs are separately checked and counted
- All actual quadruped leg-tip centres are connected to their body mass; fallback leg bases meet their support surface
- Crane actual upper and lower leg rings contact belly and rock; neck end rings and beak roots are embedded in the adjoining geometry
- Selected convex-component outward winding and explicit sheet partners under actual FrontSide semantics; not a global proof for every curved surface
- Conservative union of frozen rail inner X=3.45 and screen front Z=13.3615, without moving any display
- Published crane anchors and the 1.78 m overall authored envelope
- S and fallback addition caps; existing material-key-only contract

Intended local intersections at anatomical/structural junctions join limbs, necks, tusks, ears, decorative appliqués and support members. These are different from forbidden positive-volume overlap between separate display assemblies. There is no claim of globally manifold union topology or complete triangle-level self-intersection elimination. Close visual inspection is still required for transitions, facets and coarse fallback forms.

The reviewed predecessor and all its evidence remain byte-for-byte unchanged. `artifacts/PREDECESSOR-RECEIPT.json` identifies it; `artifacts/PREDECESSOR-UNCHANGED.log` verifies its independent-review manifest. This successor preserves its first failed joint candidate, exports and hashes in `artifacts/failed-junction-candidate/`, with failed test logs. The current exports and receipt are the only R2 review targets.

No statement here accepts the room's historical registration, in-game appearance, performance, navigation, loading/disposal behavior, release readiness, or current-day authenticity.
