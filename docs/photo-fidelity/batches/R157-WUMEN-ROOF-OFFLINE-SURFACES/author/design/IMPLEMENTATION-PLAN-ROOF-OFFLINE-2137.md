# Offline Wumen Roof Section Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Single writer; independent Astra gates between stages. Do not implement before this plan is reviewed.

**Goal:** Generate inspectable, non-installed roof-layer candidates for the four pavilion and two wing instances from the pinned 2112 recipe, with actual bearing-knot mesh rows and explicit geometry/Y/UV deltas.

**Architecture:** Add only offline scripts/tests. A numeric evaluator maps old ring corners through the contract's monotone horizontal knots, then interpolates each actual edge; it does not scale a merged mesh or a Three Group. A surface generator builds indexed tile/soffit/fascia geometry, followed by a separately reviewed trim stage. No existing RoofBuilder defaults or production callers change.

**Tech Stack:** existing Node/Three, node:test, SHA256, Float32 BufferGeometry; no dependencies.

**Spec:** archived `R157-WUMEN-UPPER-PRECONTRACT/author/design/ROOF-SECTION-DESIGN-2103.md`, embedded `scripts/photo-fidelity/batches/wumen-joint-layout/upper-contract.json` (SHA a4cf1263ae9a8cac38a4e0002458bc8cf413b6426cb59bad9c56575c1227e4b2), complete embedded 2112 recipe (source SHA ce14c0f4213a2d19b70ff4ad78b3a1979b5c26614d70e222890290ee917bde81), and independent 2102/2108/2114/2123 reviews. Predecessor checkpoint b9863902bd7370b84d1b3ec2582976c0d119c896.

## Global Constraints
- All 600 runtime src/data files remain byte-identical; no runtime import, installer, collider, walkable, World, controller or layout changes.
- Only six canonical instance IDs and their recipe layers are accepted. No arbitrary sizes/options. Invalid/sparse/non-finite or changed canonical contract fails closed.
- Four pavilions each have lower+upper layers, two wings one layer: ten roof-layer outputs, not six complete buildings. Main roof and 52 main columns are outside scope; links, NE wall, 104 shafts and eight unknown interface areas are not implemented here.
- Output remains accepted=false/runtimeInstalled=false/routeAccepted=false. It is an engineering fit, not a roof survey or an occupied building.
- Wing geometry is computed at local base 6.5, converted to Float32, then parent Y=12.3 is applied. No direct generation at18.8 advertised as predecessor equivalence.
- Preserve named no-lift base-profile anchors/recipe parameters. Record actual lift/tube-derived Y changes separately; do not claim all old vertex Y values or highest points are invariant.
- Low detail is explicit. No new generic walking beasts. Columns/radii, masonry and actual building roofs remain untouched.
- Old fixture is complete only for its recorded fields, unit tile/aspect/basecolor material and replaced finish; not TextureLibrary pixels/production merging. New UV tests are metric tests, not photographic texture verification.

## Review Focus
1. Non-square pavilion and rotated wing coordinate confusion: Task1 axes/parents and Task2 actual corner/bearing tests.
2. Continuous-function equality hiding coarse mesh non-contact: Task2 exact sample rows plus actual triangle intersections.
3. Apex/ridge collapsed triangles and normal winding: Task2 Float32 area/index tests, explicit rejected topology ledger.
4. Changed lift influence or tube tangent causing undeclared Y drift: Tasks2/3 separate base/derived ledgers and negative controls.
5. Allocation failure, borrowed materials and non-target mutation: Tasks2/3 disposal counters and Task4 full predecessor/source audits.

## Files and public interfaces
Create beside the existing offline helpers:
- `scripts/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.mjs`: pure numeric rings/profile/UV metric.
- `.../roof-section-surfaces.mjs`: tile, soffit and fascia only; no decorative trims.
- `.../roof-section-trims.mjs`: separate hip tubes/ridge/finial generation after surface review.
- `.../roof-section-audit.mjs`: independent enumeration and serializable delta ledger, no renderer.
- Corresponding four tests under `tests/photo-fidelity/batches/wumen-joint-layout/roof-section-{evaluator,surfaces,trims,audit}.test.mjs`.
`predecessor` mode means an old-parameter offline resampling reconstruction, NOT original RoofBuilder mesh bytes: inserted tw rows, degeneracy removal and revised V table are declared differences. The independent original fixture baseline remains the sole original-byte record. No changes to the frozen upper-contract/baseline helpers or gold. External original RED/TAP/freeze/JSON remains in a new phase directory; historical test snapshots are gzipped when packaged.

### Task1 — Pure section evaluator and sampling contract
**Consumes:** `createUpperReassemblyContract()` and exact instance ID/layer.
**Produces:** `createRoofSection(instanceId, layer, mode)` where mode is `predecessor` or `proposal`; immutable object exposing `ring(t)`, `point(face,t,s,{lift})`, `baseY(t)`, `sampleT(kind)`, and `uv(face,t,s,tileSize)`, `fasciaUV(face,s,a,tileSize)`; no Three objects.
- [ ] Write failing tests for all ten layer pairs; exact canonical anchors at t=0,tw,1, wing rx=13.2 predecessor and proposed contract rx, lower hipLineSteps6/tubeSegments8, all coordinate-role distinctions. Rejected unknown ID/layer/mode and mutated contract are explicit tests. Also reject unknown face, non-finite/out-of-range t,s,a (valid closed interval [0,1]), invalid tileSize, and prove mutating returned arrays cannot alter later results or the canonical contract.
- [ ] Run `node --test --test-reporter=tap tests/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.test.mjs`; preserve actual RED and denominator.
- [ ] Implement odd, piecewise-linear X/Z maps from the canonical old/new knots. Map old ring CORNERS first, then interpolate face edge at s=(1-cos(pi*b))/2. Do not pointwise-map the interpolated old edge. For skirt use its inner/bearing/eave rings; hip uses ridge/footprint/eave. At knots use stored exact targets, not rounded recomputation.
- [ ] Base Y retains original expression ordering, pinned a/H/eave and P(a,t). Lift uses pinned L/O/D but the new edge length in its original influence formula; t<=tw has no lift. UV U retains the original convention: dot(mapped no-lift XZ, eave unit tangent corners[k]→corners[k+1])/tileSize, with section-local zero origin. No aspect parameter is introduced: current roof tile/rafters do not consume it. V=(S(1)-S(t))/tileSize uses mapped no-lift face-centre normal distance rho and base Y, sampled at the sorted union of i/64 and tw; interpolate using actual surrounding nonuniform t values, never t*64 indexing. Tile/soffit pass their own material tileSize, finite and positive; test unit and non-unit values. This is an approximate no-lift profile arc metric, not actual lifted-surface geodesic spacing or old UV-byte preservation. Fascia has a separate longitudinal parameter a∈[0,1]: U as above and V=a*1.5*th/tileSize, explicitly retaining the old non-fully-metric V convention despite the additional .03 top offset.
- [ ] Sampling is sorted exact union: tile original i/nT plus tw; soffit original tw+(1-tw)*i/rs, where rs=max(2,round(nT*(1-tw)*1.5)): lower3, upper/wing2, plus exact tw/endpoints. Common bearing boundary uses the identical s array and ring evaluation. No epsilon-based merging of unequal authored knots.
- [ ] Green run and independent review of evaluator only; freeze source/test and numeric outputs. Commit only explicit offline paths if independently accepted. No entity output counted at this gate.

### Task2 — Actual Float32 tile/soffit/fascia surfaces
**Consumes:** Task1 section object.
**Produces:** `buildRoofSectionSurfaces(section, materials)` → `{group, audit, dispose()}`. Materials are borrowed explicit tile/soffit/fascia references. Group has identity scale. Pavilion baseY is already component-local, therefore its parentY=0; wing is local base6.5 then Float32, with parentY=12.3 and Ry=pi/2. X/Z instance placement is a declared derived/uninstalled frame, never an implicit city transform; wing midpoint follows the two frozen wing referenceZ endpoints and side-specific reference X centre. Parent frame is recorded separately from vertex data. dispose owns only created geometry and is idempotent.
- [ ] Write RED tests that require ten candidate layer groups and predecessor-mode groups; actual geometry samples at all bearing knots on both tile and soffit; all finite attribute/index data, in-range indices and nonzero actual Float32 triangle area. Independently calculate cross-products, normals and bounds rather than trusting metadata.
- [ ] Run the surface file alone and preserve RED. Implement shared rows with exact point reuse at face/section boundaries. Omit only triangles structurally collapsed at the old apex/ridge; ledger face/cell/triangle IDs and old/new counts. Any other Float32 collapse is an error, not silently discarded. No blanket area epsilon to turn a hole into acceptance.
- [ ] Winding is outward for tile/fascia and inward/downward for soffit. Compute normals from actual emitted surface, with separate geometry at deliberate hard seams. Validate finite unit normals and dot against independently computed nonzero face normals; do not claim smooth physical contact from normals.
- [ ] Verify actual triangle/plane intersections at the footprint bearing line. Tile and soffit are separated by the pinned thickness, NOT coincident; the no-lift soffit bearing is the pinned fanY within a documented Float32 rounding bound derived from coordinate magnitude (not gap-bridging). Include a mutant deleting tw from sampling and a shifted underside; both must fail. Record actual residuals, never merely the analytic point values. fanY here is only a reference plane from the pinned recipe: no enlarged actual fan, bracket or beam is generated in this phase, so this is a prospective bearing contract, NOT actual entity support/contact acceptance.
- [ ] Fascia retains original top .03 and bottom -1.5*thickness offsets. Do not call this a watertight whole roof: only declared boundaries and surface pieces are tested. Explicitly report open boundaries and intended overlaps.
- [ ] Independent UV tests verify each emitted UV against the metric oracle including seams/non-unit tileSize and separate fascia a. Record UV topology/count and normal/index deltas; old predecessor fixture remains unchanged.
- [ ] Resource tests: allocation failure disposes every created geometry, borrowed materials untouched, repeat dispose harmless. Test no mutation of canonical data or parent fixture. Run surface+evaluator, freeze, request Astra review **before Task3**.

### Task3 — Separately bounded hip/ridge/finial trim
**Consumes:** accepted Task2 section and pinned old recipe; no source default generation.
**Produces:** `buildRoofSectionTrims(section, materials)` → same owned-resource structure. It is not a complete RoofBuilder replacement.
- [ ] RED tests for lower hip control steps6 with tubeSegments8/radial4; upper/wing tube8/radial4 and original starts/offsets; explicit low decoration counts; pavilion finial pinned profile/hf/base and six radial segments; wing ridge box/cap pinned cross-section with proposed ridge length; lower skirt four hips PLUS its one surrounding ridge prism. The lower prism follows source-pinned RoofBuilder.js skirtRoof: horizontal half-size new innerHalf+hr, Y=[Y(0)-hr,Y(0)+1.8*hr], original prism UV tile=1. This supplemental formula is from the pinned source, not an edit to the immutable 2112 JSON.
- [ ] Implement regeneration from section curves at fixed metre radius, not scaling a tube mesh. Preserve old expression/order for predecessor-mode computation. Tip extension3r/Yraise1.6r is explicit. Finial dimensions stay pinned; ridge length changes, cross-section does not.
- [ ] Enumerate actual trim Y bounds and per-parameter centreline/base differences. Fixed-radius tangent-derived surface Y is allowed only as an explicit measured delta, not claimed zero. Wrong radius, scaled Y and leaked default high-detail mutations must fail.
- [ ] Apply the same positive-area policy to trim topology: identify any source structural degeneracies separately, do not silently accept them or claim original indices preserved. If an unanticipated closure/normal issue appears, stop and propose a reviewed topology revision.
- [ ] Resource/normal/UV tests and per-instance delta ledger; independent gate before combined export. No cap/beam/caihua/bracket inferred merely because roof is wider; those supporting entities remain a separate future design.

### Task4 — Full offline evidence and next gate
**Consumes:** independently accepted surfaces/trims, old complete fixture and frozen source manifest.
**Produces:** `auditRoofSectionCandidate(...)` serializable report with ten-layer identities, parent transforms, actual triangles/attributes, degeneracy decisions, open boundaries, named-anchor errors, actual base/lift/tube Y deltas, UV and resource checks. No acceptance flag automatically upgraded by these numbers.
- [ ] RED audit mutants: fake metadata with shifted actual vertices, omitted bearing row, index deletion, flipped normal, UV scaling, radius scaling, moved parent, default-high decorations. All must be rejected by actual geometry checks.
- [ ] Verify actual source set=600 and each SHA=checkpoint; complete existing predecessor signature and original gold exact. New scripts must never replace components inside captureGate at this stage.
- [ ] Run four new files plus original upper-contract5/upper-baseline6/lower19, sequentially under bounded heap. Preserve every original command/exit/TAP; report executed denominator, not planned count.
- [ ] Only after review and resource-slot approval, make separate complete-face CPU evidence with exact camera/matrix/triangle inventories. CPU is not GPU or building acceptance.
- [ ] Save limited offline checkpoint with RED/GREEN, hashes and reviewed deltas. Next approval must cover supporting shell/columns/NE wall/transverse links and real bearing/platform FP together. This phase cannot close actual upper assembly, eight interfaces, complete route, World/full/build/GPU or historical missing-ref P1.

## Stop conditions and self-review
Do not start generation until Astra accepts this plan's boundaries. Stop a task at an unaccounted geometric/Y/UV change; keep its RED and revise contract openly rather than broadening tolerance. Each task has a separately reviewable deliverable. Source registration, coordinates, actual knot rows, positive area, normals, UV metric, derived Y, ownership and non-target preservation map to Tasks1–4 above. No test is inferred from prior 30/30; new denominators require actual TAP.

## Revision 21:36 (2130 original retained)
Astra pre-review corrected the soffit sampling attribution (rs, not nT), removed an unused aspect API, fixed U origin/direction and nonuniform V interpolation, separated legacy fascia V, qualified reference-plane bearing, and explicitly included the lower surrounding ridge. No source/entity has been generated.

## Revision 21:37
Explicit old-parameter reconstruction vs original bytes; pavilion parentY0 / wing parentY12.3+Ryπ/2; finite bounded evaluator arguments and returned-data mutation negatives. Original 2130/2136 retained.
