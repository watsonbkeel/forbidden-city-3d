# R52 rolling interior refinement: Wuying / Jingsi four forms

Base: frozen R51 `fac791c`. This is one integration unit, not an independent release.

## Scope and evidence

Only `WuyingRepresentativeDetails.js` changes runtime behavior. Four pre-existing cases receive distinct visual fits: front `d111`, `d112`; rear/Jingsi `59`, `61`. No case, pedestal, enclosure, scene placement, collision, character or shared geometry is changed. No collection identity is introduced.

The exact four official `photoFront` JPEGs in `data/architecture/wuying-2021-cases.json` were retrieved and visually inspected before coding. `source-evidence.json` records the URLs, image hashes, bounded object pixel regions and supported/fitted/unknown facts separately for each item. Only those four images were fetched. Original JPEGs remain local inspection inputs and are not part of this commit or the runtime.

- d111: rounded tapered body, real open upper ring and individually varied front crown/shoulder protrusions. The crown remains deliberately schematic, not a reproduction of identifiable sculptural figures; its continuous neutral core is a fitted support, not established hidden structure.
- d112: distinct curved belly, pedestal foot, flared long mouth, two neck divisions, two front-only layers of simplified shoulder relief. The layer counts, spacing and section depths are fitted, not surveyed.
- 59: rounded body, hollow wide rim, tall outward-curving handles instead of low torus loops, and three shaped feet. Numeric cross-sections and tripod placements are fitted. Feet overlap the actual body, rather than floating below it.
- 61: broad curved jar body, separate low domed lid, overhanging rim and rounded finial instead of the old pointed generic stack.

All four preserve their private inherited monochrome material. These are geometric refinements, not photographic textures, accurate painted patterns, complete sculpture replicas or claims about the 2026 inventory. Unseen rear ornament remains absent. The front is a local negative-Z viewing convention, not a verified geographic azimuth.

## Verification

- Before changes: existing R37 details suite 6/6 (`baseline.tap`).
- TDD: five missing behaviors fail on frozen R51; two preservation/budget tests already pass (`tdd-red.tap`).
- Final targeted successor: 7/7 (`tdd-green.tap`). Includes all four unique form behaviors, source/fitted/unknown metadata, finite real geometry, strict small triangle budget, original support-plane contact, and case-bound containment.
- Exact preservation: geometry attributes/index/parameters, materials/maps, transforms, metadata and complete case fingerprints match for d102, 60 and all ten other untouched cases. All original case/enclosure collision arrays match. `before-fingerprints.json` / `final-fingerprints.json` retain the audit values.
- Original R37 d102/60 behavior checks: 5/5 (`r37-preserved-selected.tap`).
- The original archival R37 assertion that **all other fourteen forms** remain unchanged is intentionally superseded for these four R52 targets. It is not edited or silently re-baselined in this patch. Its successor explicitly protects the other ten plus exact d102/60. The R52 integrator must classify this historical assertion correctly in aggregate test reporting.
- Static syntax check and `git diff --check` pass.
- No full-world test/build or GPU/browser run performed by this unit, to avoid competing with the single R52 integrator. Aggregate merged-scene, build and runtime checks remain with that integrator.

## Actual geometry review

`capture-geometry.mjs` calls the production `buildWuyingObservedCases`, exports its actual BufferGeometry, per-mesh transforms and material base colors. `render-geometry.py` uses the repository's CPU triangle rasterizer. No replacement shapes, generated reference image or hand-drawn render is used.

`before-geometry-views.png` and `final-geometry-views.png` show front, oblique and neutral-back views of all four actual objects. These are CPU geometry inspections under review lighting, **not browser/WebGL/GPU screenshots**. Glass and all but the unchanged upper pedestal pad are omitted only from this isolated inspection view. Runtime case components are not removed.

The first after-view exposed a 59 foot/body gap. A ray-intersection regression failed (`foot-contact-red.tap`); the upper foot contour was extended inside the actual belly while keeping all three bottoms on the original support plane. The final 7/7 result includes that overlap test, and the final CPU sheet was re-exported/rendered and visually checked after the fix.

Geometry cost for these four objects only: before 2,688 triangles / 9 meshes; after 17,648 triangles / 43 pre-merge meshes. No new materials or textures. The existing merge pipeline is expected to keep case-material batching; that aggregate behavior requires integrator verification, not inference from these isolated views.

## Reproduction

From the repository root:

    node --test tests/r52-wuying-next-forms.test.mjs
    node --test --test-name-pattern='d102|scene60|the two selected cases|each neutral label' tests/r37-wuying-representative-details.test.mjs
    node reports/r52-wuying-forms/capture-geometry.mjs final
    python reports/r52-wuying-forms/render-geometry.py

The before export/fingerprints are frozen evidence from `fac791c`; do not overwrite them with a later implementation. Per-object profile/relief/handle/lid parameters live together in `nextForms`, and a copy is recorded on the form metadata for auditability. Rollback is the inverse of this small commit. Do not publish this fragment independently.
