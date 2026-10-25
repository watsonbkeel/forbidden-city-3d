# R85 Taihe exterior cloud plaque Implementation Plan

> For agentic workers: execute the approved bounded plan inline as single implementation owner, with fresh independent final review.

Goal: replace only Taihe's exterior rectangular board with an independently fitted cloud silhouette and separately proportioned blue text core.
Architecture: Taihe-only closed extrusion helper, existing unchanged mounting rays, plus conservative whole-envelope roof-triangle clipping validation. A full-box clearance proof is stronger than checking only the cloud silhouette and is allowed to reject a candidate rather than silently shrink or alter roofs.
Tech Stack: existing Three.js/Canvas, no new dependencies or official photo texture.
Spec: docs/photo-fidelity/RESIDUALS/TAIHE-EXTERIOR-PLAQUE-PLAN.md and its actual-component/addendum records. Current execution authorization supersedes those documents' historical planning-only gate, not their factual limits.

## Constraints and choices
Actual production buildComplex floor9.9375, height3.0476, old position[0,26.51712148249181,-14.483]. Keep height and total depth.15; trial ratio1.085 within1.05..1.10. Blue core47% width/63% height, center shifted upward~.084height. Use plain system-font 太和殿 separately, not stretched old artwork or asserted calligraphy. Gold outline and red-brown cloud body remain simplified, back/hardware/carving unknown. Retain all unrelated geometry, physics, roof coordinates and interior plaques. No main/Pages/remote write, no deletions.

Approaches: reject stretching old full-board texture because it distorts letters and retains rectangular composition; reject new generic shared-board refactor because scope is Taihe-only. Use one owned noMerge root with closed cloud geometry and separately owned inset pieces. Existing resource owner must dispose all owned geometries/materials/textures without affecting shared library materials.

## Steps
- [ ] Capture actual first Taihe hall through production buildComplex and baseline inventory/geometry/navigation.
- [ ] Red tests for complete envelope, non-rectangular silhouette, core proportions, closed positive solids and source metadata.
- [ ] Implement helper, run green, commit.
- [ ] Red whole-triangle clearance tests, including an obstacle between old12ray stations and near-vertical faces; implement clipping/SAT certificate, reject mismatched envelope or insufficient margins.
- [ ] Integrate only exact Taihe exterior branch; actual pre/post merge root, material ownership and navigation retention.
- [ ] Run focused, fullworld nav/flight/night as affected, raw152failure baseline comparison, root/subpath production checks and one backup. Fresh independent review before frozen candidate delivery.

Review focus: hidden rectangle restoration, child depth protrusion, wrong standalone floor/clamp height, between-probe roof intersections, stale rectangular appearance metadata and owned texture leaks. No GPU/photo-match acceptance without actual rendered evidence.

## Implemented review corrections
The locally grouped four-material cloud mesh remains one noMerge object, so final material merging cannot detach layers from the mount ownership root. Complete-box roof clearance uses all candidate-region roof triangles, not just the inherited twelve placement rays. Known placement or typed complete-clearance rejection removes/disposes the proposed geometry and remounts the retained rectangular board; an explicit rejection diagnostic is retained. Cached builder-owned materials are not prematurely disposed. Unrelated errors propagate.

Final root/subpath build identity and new evidence are successor-specific. The navigation snapshot test serializes both sides consistently because JSON omits profile.cells:undefined; the first raw harness mismatch is preserved, not a physical-world change. No GPU acceptance or remote upload is implied by CPU evidence.
