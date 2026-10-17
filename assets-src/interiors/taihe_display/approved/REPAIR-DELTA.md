# R2 bounded material-side and contact repair

The original reviewed prototype remains unchanged. R2 is a separate CPU-only source candidate, not product integration or runtime acceptance.

## Counts and explicit deviation

Both copies and all eight supports are included. S stays **3,798 / 4,800**; fallback is **480 / 480**. No slots, material properties, vertex colors, atlas ownership, architecture, collision or navigation data changed.

| Fallback pair | Predecessor | R2 | Delta |
|---|---:|---:|---:|
| Elephant | 164 | 164 | 0 |
| Luduan | 86 | 78 | -8 |
| Crane | 112 | 110 | -2 |
| Incense pavilion | 114 | 128 | +14 |
| Total | 476 | 480 | +4 |

The first written proposal was 164/86/110/120, conditional on hiding the lower roof disk. Geometry inspection showed its underside is exposed. That disk was **retained**. The owner then approved 164/78/110/128, recovering eight triangles from the pair of closed, continuous luduan bodies. This is an explicit approved deviation from the first proposal. The discarded candidate and failures are retained for inspection.

## Exact geometry changes

Per object unless stated otherwise:

- Elephant: torso 12 to 8 triangles, still closed with a broad belly and continuous head intersection. Rear head triangle 4 to 3, with all three omitted-cap vertices inside the torso; no exposed cap is removed. Two tabletop and two ear reverse triangles are added. Exposed trunk tip gains one cap triangle. Trunk root, ear roots and vase lower neck ring are locally seated in adjoining solids. Four leg pyramids are rewound outward. Total remains 82. Tall stand central void, outer bounds, vase height and descending trunk silhouette are retained.
- Luduan: one closed 14-triangle body/head becomes a closed 10-triangle mass with a raised fore-head, shoulder ridge and rear belly. All four actual leg tips remain inside it and every lower leg vertex touches the support. Horn and ear roots are locally seated; horn/leg faces rewound outward. Total 39. Overall envelope and mesh bounds are unchanged; coarse facets remain explicit.
- Crane fallback: two detached one-sided wing sheets are removed; two existing outward body faces carry the existing teal key. Crown gets one explicit reverse face. Lower-beak sides are rewound. The triangular rock's upper front width increases from ±0.18 to ±0.20 m so all six actual lower-leg vertices contact; neither assembly bounds nor placement change. Neck end-ring radius, head joint and crown base vertices are locally adjusted to ensure actual contact. Published 0.45 m leg and 0.17 m lower beak centreline stay unchanged. Total 55.
- Pavilion fallback: eight shaft-rib reverse triangles added. Upper-eave top cap (2 triangles) is replaced by an exactly shared four-edge finial junction: finial 3 to 4 side triangles. The separate exposed lower-eave underside disk remains all 4 triangles. Total 64. The four broad wall regions and gaps are a coarse fallback, not a detailed perforation reconstruction.
- S crane: six crown triangles across the pair rewound outward. Stronger joint tests also found two beak-root corners and two of seven terminal neck vertices outside the old head. The front head section changes halfwidth/halfheight from 0.018/0.024 to 0.024/0.028 m, and terminal neck radius from 0.029 to 0.022 m. Both end rings and beak-root vertices now lie in the adjoining solid. This is **not winding-only**. S counts, placements and complete assembly bounds remain unchanged.

## Material and guard corrections

Fallback `gold`/`darkGold` are DoubleSide in the frozen path; all other keys remain FrontSide. No property is changed. The explicit sheet registry contains 26 reverse triangles across the full fallback set: elephant 8, crown 2, shaft 16. Both members of each declared pair have exactly opposite winding, identical material and positions. An undeclared duplicate or same-winding partner fails.

Actual crane ring geometry is checked rather than trusting separate anchors. Deliberate +0.50 m actual-leg shifts, +0.10 m neck-top shifts, reversion to the rock overhang, a flipped beak triangle, a corrupt reverse face, a removed roof disk and detached luduan legs all fail the appropriate guard. Targeted normal tests cover selected convex primitives and both integrated wing fields; this is not an all-surface manifold or visibility proof.

The architectural guard now uses the conservative S/fallback union: inner rail X=3.45 m, screen-front Z=13.3615 m. No display moves. Original clearances remain positive. Source formulas and hashes are recorded.

## Mandatory normal integration

Explicit reverse faces share position indices in this source interchange. Indexed `computeVertexNormals()` cancels their normals to zero. Integration must expand to non-indexed triangles with explicit flat normals, or split front/back vertex indices before generating normals. `integration_geometry.py` supplies a deterministic CPU-only per-material attribute adapter. Tests reproduce the indexed-normal cancellation, reject zero/non-unit or winding-inconsistent normals, and check every expanded triangle. Do not weld the split sheets during merging. Export geometry remains unchanged by this adapter.

## Reproduction and status

Run `PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s tests -v`, then `PYTHONDONTWRITEBYTECODE=1 python verify_candidate.py` inside R2. Tests: 24 pass. Inventory contains exact positions, all-vertex bounds, material/component triangle counts, pair hashes, sheet registry, actual-ring contact records and source hashes.

Museum material remains evidence only. Color, coarse facets, estimated placement, and especially present-day Taihe pavilion appearance remain provisional. No Blender, browser, GPU, renderer, app integration, GLB merge or product suite was run. Owner CPU culling projection found the formerly missing wing visible and limb/beak silhouettes continuous; fallback remains visibly coarse. This diagnostic observation is not runtime approval. Independent successor review remains a separate step.
