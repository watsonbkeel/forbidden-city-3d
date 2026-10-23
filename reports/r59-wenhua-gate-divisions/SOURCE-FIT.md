# FC-5652FA389B: three visible major division cores only

Status: VERIFY_PENDING; whole gate PARTIAL. This successor does not implement the fine lattice or establish a window-leaf/opening count. The previous six CPU images and their reports remain unchanged.

## Source actually re-viewed

- Official photograph: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg
- Parent: https://www.dpm.org.cn/explore/building/236531.html
- SHA-256: `16c83fbc77280e5e5057df8bb77e48f345820eb6747f7ce822336e4569a6f6fb`; 1000 × 666 pixels.
- Photography date unknown. URL upload-path date is not a shooting date.
- Original and private crop were actually viewed again on 2026-10-22. Nearest-neighbour enlargement only aids inspection; it adds no detail. No original/crop pixels are included here, in public assets or in the geometry diagnostic.

## Observed topology versus unknowns

The lower clear region of the photo-right south window contains three major red vertical divisions and red crossed oblique fine members. Three narrow fields are clearer; the rightmost region is tree-obscured. This supports major visual divisions, not a leaf count, opening pose or historical timber construction. Exact fine-unit intersection topology, subdivisions and total repeat counts remain unknown. A standard diamond/three-direction lattice is therefore not generated.

The coarse predecessor has one uninterrupted dark field inside its red perimeter. The present bounded change inserts only the three confirmed major division cores. Fine lattice and full joined division-band widths remain visible residual differences.

## Explicit pixel and normalized FIT controls

Source observations use the lower window, approximately y=380–398. Vertical centres are approximately x=792, 819, 845, each with ±2 pixel fit uncertainty. Broader red envelopes vary by row and adjacent lattice joins: about x=788–796, 814–824, 840–849. Blur/tree overlap prevents treating these whole envelopes as measured solid timbers.

The model deliberately represents conservative visible red cores: 4, 4, 3 pixels. These are lower-detail fit choices, NOT measured full band widths. Core-width FIT intervals are [3,5], [3,5], [2,4] pixels. This avoids silently defaulting all bars to .26 model units.

The enclosing photographic FIT span is x=768–872 (104 px), not an exactly observed inner opening. Left control uncertainty is x=768–774; the unobscured lower lattice transition is nearer x=771–774. Right control uncertainty is x=869–876, LOW confidence due to the tree. These uncertainties permit a span of 95–108 px.

Existing model inner frame extends from local x=-10.79 (photo left) to -15.69 (photo right), width 4.90. Confirmed south camera makes screen-right local negative X. For centre p and core width q:

`u=(p-768)/104; localX=-10.79-4.90*u; modeledWidth=4.90*q/104`.

| Division, photo left → right | p | u | local X | q/104 | modeled width | propagated width FIT interval |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 792 | .230769231 | -11.920769231 | .038461538 | .188461538 | .136111–.257895 |
| 2 | 819 | .490384615 | -13.192884615 | .038461538 | .188461538 | .136111–.257895 |
| 3 | 845 | .740384615 | -14.417884615 | .028846154 | .141346154 | .090741–.206316 |

Bounds propagate minimum core width / maximum span and maximum core width / minimum span. Dimensions are reversible photo fits, not metres surveyed from pixels. The existing provisional coarse top/bottom frame controls are retained; tree-hidden upper joinery is not newly asserted.

## Geometry, contact and preservation

- Three red finite-depth extrusions reuse the exact existing red-frame material. No new material/texture, no generic fine grid.
- Same original wall/collider envelope. Each spans y=2.82–6.79, z=-.28 to -.12. The retained opaque backing remains closed; no room, passage, collision or support changes.
- Each extrusion has only front and side triangles. Its ends contact actual retained upper/lower rail triangles; its rear edges contact the actual retained opaque-plane triangles. Duplicate contact end/back faces are omitted, avoiding coincident new faces.
- All previous coarse mesh position/normal/UV/index triangles and materials, original wall's other five faces, non-target geometry and physics are retained. Opposite bay, north, Wuying, doors, roofs, steps, characters and paths are untouched.
- Delta: +3 pre-merge meshes, +18 triangles, +0 owned materials, +0 merged material groups.

## Portable before, tests and diagnostics

Exact coarse production helper is vendored and SHA-checked in `tests/fixtures/r59-wenhua-gate-window/WenhuaGateSouthWindows.coarse.js.txt`; provenance records source commit/blob without requiring their Git objects. No new runtime `git show`/historical Git dependency.

`red.tap` records three real failures against the existing coarse production (0 divisions instead of 3), before implementation. Compact tests additionally cover actual triangle contact, finite outward geometry, no duplicated contact skins, existing-frame retention, original collision/support query equivalence and real material merging. The existing closed-plane ray sample moves from x=-13.24 (now behind a division) to x=-12.6; its material/depth assertion is unchanged, and separate new rays test every division.

The merged depth difference is checked against Float32 world planes: `fround(-245.2-.12)-fround(-245.2-.28)=.1599884033203125`. This is actual world-coordinate storage precision, not a hidden geometric gap or an arbitrary relaxed tolerance.

One same-camera CPU near pair is stored only in this successor directory. Camera local eye [-13.24,4,-12], target [-13.24,3.8,0], FOV 38. Both renders were actually inspected: the single dark field becomes three red-supported divisions while all coarse frame/sill pixels remain. Fine red grille is still absent. CPU flat palette is not browser material/lighting acceptance. Browser restrictions were neither retried nor bypassed; no full world or full suite was run here.

No shared SouthCourtGates hook changes are required. Parent applies this commit only in its later B batch, not the running first-batch source freeze.

## Recorded result

- Focused command: `node --test tests/r59-wenhua-gate-divisions.test.mjs tests/r59-wenhua-gate-window.test.mjs tests/r49b-south-gate-planes.test.mjs` → 12/12 passed; repeated with a deliberately failing Git executable first in PATH → 12/12 passed (`portable-final.tap`). No Git executable was needed.
- `node --check` production helper/exporter and `git diff --check` passed.
- Both CPU near images inspected. Geometry-only delta: 9,782 pixels, bounding rectangle [385,69,564,336]. New before render's first 540 rows equal the archived coarse-after render byte-for-byte at pixel level. All six archived image SHA-256 values remain unchanged.
- New before PNG SHA-256: `94de39335eaf5001daa8700633c3020cf41dd535af4857fddb1b2ba3b4ce6f4b`.
- New after PNG SHA-256: `23682bbca796f9f0cc1411ee18ff197a4fbbc087cb066c44321f1ba5ccf604c5`.
- Exact same camera, retained geometry/physics hashes, source-file hashes and portable before provenance: `evidence/proof.json`; PNG checks: `evidence/image-hashes.json`.

No browser acceptance, full-world run, remote upload, shared builder change or current batch integration is claimed.
