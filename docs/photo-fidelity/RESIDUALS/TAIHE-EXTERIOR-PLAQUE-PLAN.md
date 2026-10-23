# Taihe exterior-plaque engineering plan

**Status:** Future engineering plan only. Stage 5 closes without a sixth implementation. No production implementation, bundle build, full-world construction, browser review or ACCEPTED promotion is authorized by this document. The sole static component capture described below supplies existing parameters, not a new implementation.

**Scope:** FC-A478209231 太和殿, exterior `plaques_text_placement_orientation_occlusion`, residual action **A03-02**. This is the exterior “太和殿” board, not the retained interior “建极绥猷” plaque or its R13 frame.

**Goal:** Replace the remaining rectangular exterior-frame silhouette with an independently sourced cloud-shaped silhouette, while respecting the unchanged hall, roofs and actual inter-eave mounting space.

**Architecture:** One Taihe-only authored-geometry helper, carrying a truthful complete geometry envelope compatible with the existing nameboard mount. A separately fitted inner blue/text panel avoids stretching the old whole-board texture over the wider cloud frame. This plan does not change shared navigation or physics.

**Technology:** Existing JavaScript, Three.js geometry and current material/resource ownership. No new dependency, photograph texture, AI lettering or embedded official source pixels.

**Companion inventory:** `ACTIONS.json`, original FC-A478209231, action A03-02. `ACTIONS.md` and `ACTIONS.json` remain unchanged; this document refines that action's width/envelope constraint rather than silently preserving its old .62 ratio.

## 1. Own source and image-space controls

The original **1000 × 1500** image was independently viewed again for this plan. The source hash matches the reviewed manifest:

- Source ID: **SRC-7EB266209DC4**.
- [Official Taihe exterior-plaque close-up](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefbd5093a9.jpg).
- Manifest: `docs/photo-fidelity/REVIEWS/three-halls/SOURCE-VIEWS.json`.
- SHA256: `eebdbe096e5aeecc55d08e380775171438c75b635846dc013c452bce55f36c1c`.
- Photography date is unstated. This single front/low-angle close-up does not document the back, exact thickness, mounting hardware or a second independent direction.

Coordinates below use the original image's top-left origin, x rightwards and y downwards. They are **approximate visual controls, not traced survey points or physical measurements**. Allow roughly ±10–15 px at scalloped/occluded perimeter extrema and ±5–10 px at blue-field corners. Do not infer precision from the displayed integers.

| Control | Approximate image coordinate or bound | Meaning and limit |
|---|---:|---|
| Outer cloud-frame horizontal extremes | x ≈ 40…960 | Includes projecting upper cloud arms; not just the narrow central slab |
| Outer complete vertical extent | y ≈ 432…1280 | Includes lower hanging cloud feet; 1275 versus 1280 is within reading uncertainty |
| Blue field upper-left | (280, 520) | Inner color-field corner, excluding the surrounding gold/red frame |
| Blue field upper-right | (710, 520) | Approximate front plane; do not assume deprojected orthogonality |
| Blue field lower-left | (283, 1050) | Small edge/camera uncertainty remains |
| Blue field lower-right | (710, 1050) | No claim of exact physical field aspect ratio |

The broad outer bounding ratio is about **920/848 = 1.085** in this image. A provisional **1.05–1.10 width/height** design interval is therefore defensible for a source-guided photo-fit trial, not a measured real-object ratio. Perspective, relief depth and the low camera angle are unresolved; a straight-on independent view could revise the interval.

The blue field occupies approximately **430/920 ≈ .47 of outer width** and **(530–532)/848 ≈ .63 of outer height**, with its center higher than the whole frame's center. These are separate front-projection controls. The red-brown cloud wings, gold boundaries and hanging feet must not be confused with the central blue field or reduced to a uniformly enlarged rectangle.

## 2. Actual retained model and the proposed fit boundary

`src/scene/PalaceBuilder.js`, exterior-plaque construction, computes `ph = clamp(H * .32, 1.8, 3.4)` and calls `plaqueMesh(name, ph * .62, ph, true)`. **3.4 m is only the clamp ceiling.** A lightweight actual static capture followed the production `buildComplex` entry for 三台 through the first Taihe `buildHall`, then stopped before the other halls and `finish`. It constructed no full world or renderer. See [TAIHE-PLAQUE-CURRENT-COMPONENT.json](TAIHE-PLAQUE-CURRENT-COMPONENT.json), which binds the exact source hashes and records:

- Actual hall floor and `heightReferenceY`: **9.9375 m**, not the standalone fixture's assumed 10.2 m. The retained north-side room margin clamps the 2.2 m nominal plinth to 1.9375 m above the 8 m shared terrace.
- `H = (35 - 9.9375) * .38 = 9.52375`; actual board **height 3.0476 m × width 1.889512 m × depth .15 m**; width/height **.62**; scale **[1,1,1]**.
- Actual mount local position: **[0,26.51712148249181,-14.483]**; existing sampled lower/upper limits **24.730130902255638 /28.304112062727977 m**; **12 probes**, `sizeScale=1`. These are the old board's sampled limits, not clearance proof for a wider frame.
- `plaqueMesh` is a BoxGeometry marked `noMerge`, with rectangular painted borders and an inherited system-font inscription.

This supersedes both provisional draft assumptions: the 3.4 m maximum is not the actual height, and the 10.2 m standalone fixture floor misses the actual `room/ph` plinth clamp. The **2.108×3.4 m** pair remains only an upper-clamp example. The actual component evidence, not either shortcut, controls the future retained-height trial.

The current 256 px-wide vertical canvas is 413 px high; its blue field is 200 × 357 px. Thus the existing blue field is proportionally much taller within the board than the observed field. Simply spreading that complete texture across a new cloud outline would stretch both borders and lettering incorrectly.

Proposed future bounded trial:

- Retain the **verified actual old height**, not the 3.4 m clamp ceiling. Using the actual captured **3.0476 m** height, test width **3.19998–3.35236 m**, with a center trial about **3.306 m** for the observed ≈1.085 ratio. These are inherited-model PHOTO_FIT values, not measurements or pre-approved final dimensions.
- At that actual-height scenario, this is **1.310–1.463 m total widening** relative to 1.889512 m, about .655–.731 m per side. Do not conceal it inside the old narrow envelope.
- **Conditional 3.4 m scenario:** if a valid actual capture genuinely establishes height 3.4 m, or a future separate design explicitly chooses it, width 1.05–1.10×height gives **3.57–3.74 m**, about **3.69 m** centrally. This is not the actual captured retained-height result; enlarging height as well as width needs explicit fit/clearance disclosure.
- Do not squeeze the new cloud silhouette into the old .62 box or resize the hall/roof to create room. The new real envelope must pass the clearance gate below. The old mounting position is only reusable if it still passes at that new envelope.
- Start the blue field near .47 of the new outer width and .63 of outer height, approximately **1.50–1.57 m wide ×1.91 m high** for the actual 3.0476 m retained-height scenario; the conditional 3.4 m example instead gives about 1.67–1.75 m ×2.13 m. Its higher vertical placement and all values remain PHOTO_FIT; do not silently center it vertically within the full hanging frame.
- Retain the inscription string and inherited system-font family as an explicitly **unverified lettering approximation** on the separately fitted panel. Do not claim sampled calligraphy or redraw unsupported glyph contours. Text layout changes must be reported separately from frame shape.
- Outer cloud outline, broad visible color zones and inner gold boundaries are source-visible. Exact relief, molding sections, wear, color values, material response, back construction and attachment hardware remain unknown.
- The inherited **.15 m depth is not measured**. If provisionally retained, every frame/panel/text layer must fit inside that true total depth. If relief needs a larger actual envelope, declare that new fit and rerun all clearance checks; never retain a false `.15` parameter while child geometry protrudes outside it.

## 3. Geometry and mounting contract

Proposed helper: `src/scene/palace/TaiheExteriorPlaque.js`, consumed only by the exact Taihe exterior-board branch in `PalaceBuilder.buildHall`. Other halls, side gates and the generic `plaqueMesh` factory must retain their existing behavior.

The helper should return one mountable root Mesh with owned geometry/materials and `userData.noMerge = true`. It may have a separately fitted blue/text child, but **all rendered pieces must be included in the declared nominal envelope**. Expose finite positive `geometry.parameters = {width, height, depth}` with values matching the actual complete local bounding envelope, not the old box or the blue field. Center the nominal envelope consistently at local zero; record any panel offset independently. Do not add an invisible full rectangular backing that restores the silhouette being removed.

The existing `positionHallNameboard` consumes these dimensions and `roof.userData.doubleEaveMountingBand`. It currently uses wall gap **.12 m**, surface margin **.03 m**, and twelve real roof-surface ray hits. Taihe does **not** opt into `fitSizeToBand`; automatic shrinking is not a solution.

### Required roof-clearance method

1. Use the actual unchanged Taihe roof and actual hall transforms. Start with the existing roof-local depth relationship: `z = -band.halfDepth - .12 - depth/2`, using the **new true total depth**.
2. Recompute all **12 actual surface probes**: x at `[-newWidth/2, 0, +newWidth/2]`, both front/back z faces, each with upward and downward rays. The actual old probes are at ±.944756 m; the 3.4 m upper-clamp example would use ±1.054 m. Neither covers the new proposed edges. Always use the resolved actual new width, not either former half-width. Accept the current semantic lower-tile and upper-rafter/soffit materials only; missing/unexpected hits fail closed.
3. Derive the admissible vertical interval from the maximum lower surface and minimum upper surface, including the existing .03 m margins and the actual band bounds. Retain the previous position only if the new geometry fits there. Otherwise a separately reported, bounded recenter within the genuine band may be considered; no widening of the band, roof movement or hidden shrink.
4. **Twelve rays are necessary, not sufficient.** Validate the complete new frame/panel volume against actual roof triangles over the entire overlapping region. Use broad-phase bounds only to choose candidates, then actual transformed triangles: no plaque/roof triangle intersection, and at least .03 m vertical clearance to the lower/upper roof surfaces wherever their XZ projections overlap. Check extrema on clipped triangle-projection overlaps, not only vertices or a sparse sample grid. Vertical/near-vertical roof faces still require solid intersection testing even when unsuitable as height surfaces.
5. Include scalloped arm tips, concave outlines, hanging feet, front/back depth, and interior x stations where the roof can dip/rise between the three probe stations. Validate actual geometry after the production merge path as well as the isolated fixture; `noMerge` must preserve the board ownership contract. Record the limiting triangle/probe and clearance rather than only a Boolean.
6. If no candidate within the declared fit boundary clears the unchanged roof, **stop and retain the old implementation**. Report the limiting surface and required source/design decision. Do not force a cloud frame into the old narrow box, move the roof, guess extra clearance or label the original position valid by inheritance.

These are local visual solid-clearance tests, not authorization for a new shared collision/support system. Preserve all existing colliders, walkables, routes and controller parameters exactly.

## 4. Future testable work units, not current execution

- [ ] **Envelope and shape fixture.** Add `tests/r58-taihe-exterior-plaque.test.mjs` for the exact Taihe branch: finite closed geometry, correct winding/normals, noncollapsed UVs, complete true envelope, cloud silhouette rather than rectangular fill, separate blue-field proportions, readable but explicitly unverified system font, and unknown back/detail metadata. Test the lower and upper trial widths and reject nonfinite/degenerate dimensions. No production patch is made now.
- [ ] **Actual roof clearance and retention.** Add `tests/r58-taihe-exterior-plaque-clearance.test.mjs` using the actual buildComplex-derived Taihe floor/roof component initially, not a hard-coded 10.2 m hallCapture floor. Require new-edge 12 probes plus whole triangle-region clearance, transform/mirror correctness, between-probe intrusion rejection, missing/incorrect material rejection, depth protrusion rejection and no silent shrink. Preserve non-Taihe boards, interior R13 plaque, roof/hall source geometry, navigation hashes and resource disposal. Do not rewrite frozen R25 proofs to accept new geometry; add an explicit forward-scoped compatibility test.
- [ ] **Bounded helper and integration.** Only in a separately authorized future implementation, write the failing tests first, then the smallest Taihe-only helper/hook and truthful mount metadata. Keep source/control-point provenance and before/after envelope/position/clearance deltas. A changed frame must no longer advertise a rectangular-frame status, but must still say PHOTO_FIT, SYSTEM_FONT_UNVERIFIED and BACK/THICKNESS/CARVING_UNVERIFIED.
- [ ] **Production visual decision.** Future matched before/after actual-game browser captures are required: identical south-side legal-eye camera plus a matched source-angle diagnostic, with full plaque and adjacent lower/upper roof context; include an oblique clearance view. Compare silhouette, panel placement, lettering distortion, roof occlusion, material response and z-fighting. CPU pictures or successful ray tests do not replace this. Record any camera mismatch rather than presenting different views as a fidelity improvement.

## 5. Stopping and acceptance conditions

- **Current task stops at this plan, its actual-component parameter record and its addendum.** Stage 5 closes, A residuals are delivered, then B may proceed. This plaque plan is not a sixth implementation or a blocker on that handoff.
- Future work stops on an unresolved camera/plane fit, material/probe mismatch, any full-region roof collision, falsely declared envelope, unbounded text/frame deformation, resource ownership regression, collateral hall/roof/navigation change, or inability to demonstrate the fit without automatic shrinking.
- Missing opposite/back evidence limits the scope even if the front is improved. Do not turn a full-front close-up into a complete object reconstruction.
- A future successful implementation remains **PARTIAL / VERIFY_PENDING** until actual matched browser review and explicitly bounded acceptance. It cannot accept the complete Taihe exterior, interior or A stage.
