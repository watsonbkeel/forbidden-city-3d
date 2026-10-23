# R62 E: Jingren rear-hall south windows

Scope: **only the four existing closed south bays of east-six/items/3, 景仁宫后殿**. This is not the main Jingren hall's R40 north glazing or `JingrenSouthWindows`. This bounded correction does not complete Jingren, E61/E, or the thirteen-section register. `VERIFY_PENDING` remains; no browser/GPU acceptance.

Baseline: R61 `6b396800b6a03582aebf513fcef4966e9f5d0db3`. The branch changes only one new production helper and its new tests/reports. No shared builder, `ZoneBase`, kit, zone data, old R39 assertion, furniture, `main`, Pages, account permission, credential, upload, or release changed.

## Sources actually inspected

Official page: https://www.dpm.org.cn/explore/building/236509.html

- Gallery 05, oblique rear hall: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg . SHA-256 `7f20d6d67c50e8cc52599d5327eb682d72a88822891c33d45ea9ab1ab2a7ff8d`.
- Gallery 06, frontal rear hall: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c7345.jpg . SHA-256 `8ef05cc459518b644185a6048077265e923ab9420b88cf205288e1e795791a55`.

The implementer directly viewed both original images before editing and verified their bytes. They show a central door and four closed high-sill window bays. Each closed bay has three vertical fields, short rectilinear/stepped upper grilles, and a substantially plainer pale lower region. The relevant facade is the rear hall, not the main hall's differently patterned facade. Photograph dates are unknown; URL upload dates are not capture dates. Images remained in the private source cache and are not in this repository, generated textures or deliverable archive.

## Explicit difference list

1. Photo: grey high sill under each of four windows. Before: four full-height generic `lattice_doors` boxes. Change: four 1.0-model-metre sill solids above the retained .45 platform datum. Verification: actual triangle contact and before/after frontal/oblique CPU views.
2. Photo: three broad pale lower fields per window bay, not floor-to-head generic lattice. Change: twelve opaque pale recessed panels and two vertical divisions per bay. Verification: actual lower triangle contacts, raw/merged bounds, photographs 05/06, close CPU view.
3. Photo: an upper band with short stepped/rectilinear patterns. Change: four planar-union extruded red frames, each containing three upper fields with three outer and nested inner fitted step runs. Verification: actual outer/inner red solid contacts, dark recess contacts, nondegenerate triangles and no repeated geometric triangles. This is not copied Jingyang long straight grille geometry.

The 1.0 sill, 2.7 split height above floor, .10 outer frames, exact repeats, thickness, colors and backing depth are **reversible model fits**, not surveyed dimensions. Fine joinery, exact repeat counts, paint, lower glass/paper/backing material and reverse side are not established. Pale fields are deliberately opaque fit surfaces, not asserted historical glass. This is a coarse visible partition/pattern relationship, not a facsimile.

## Inheritance and strict boundary

Inherited unchanged: x=-93, z=347.4, w=24, d=9.6, pad=.6, ph=.45, colH=6.08, five bays, R39 hard-gable roof and flush ends, twelve columns, beams, wall heads, central south door/leaves and threshold, back wall, floor, terrace, existing generic furniture, original room/map identities and all navigation. There is one original south entrance; no north door or north glazing was invented. The parent's separate UNKNOWN furniture work is not duplicated here.

The helper is `applyJingrenRearWindows(kit, frame, item)`. Invoke after the existing `buildHallBaseline()` writes `rearHall` and `structure` records. Exact original item keys/values, assembly identity, zone/parent transforms and frame matrices, four source mesh transforms, full original position/normal/UV/groups/draw-range, geometry uniqueness and original closed-window colliders are checked **before mutation**. Non-targets and malformed sources return false without edits. Repeated calls return false. Only four source geometries are removed/disposed; their shared lattice material is not disposed. Four new materials belong to the kit. The frame strips are a planar union with no stacked internal coplanar boxes.

The baseline fixture SHA-checks the original R61 ZoneBase source (`509e784a584139e976a929789734446a5a3fb6de0e3b448910d2315285bd9819`) and resolves its real production dependencies. Candidate fixtures apply only this new helper after that real bounded hall build. The fixture contains project source, not museum images.

## Verification, including red results

- Initial missing-helper failures: `red.tap`.
- Initial missing already-built-W consumer failures: `world-red.tap`.
- A new inner-step surface test failed against the first sparse shape: `nested-step-red.tap`. It passes after the nested visible run was added.
- Final new bounded tests: 11/11; `combined-tests.tap`.
- New tests plus **unchanged** R39 hard-gable tests: 39/39; `final-bounded-tests.tap`.
- Foreign main/rear hall targets, malformed identity/transforms, missing/duplicate/shared/moved/edited/hidden source panels, missing collision, idempotency and material ownership are checked.
- All added triangles have finite positions/normals and positive area. Generated red unions contain no duplicate geometric triangles. Raw and material-merged surfaces agree within 0.0001 m float32 merge tolerance; actual bounds are checked, not metadata alone.
- Read-only existing-W consumer: 24 actual triangle contacts (sill, pale lower, section rail, outer step, inner step, upper recess across four bays), four closed-window collisions, three hollow south portal rays and a retained closed rear wall. It rejects deleted solids, missing collisions and absent target metadata.
- Actual `FirstPersonControls` at 10/60 Hz starts outside on ground, enters the real central south opening, traverses inside, exits, enters and exits again. 88/501 recorded frames, feet reach .45 and return to ground. No rescue/unverified support. Every fourth frame checks body collision and actual rendered overhead clearance; sampled minima are 3.6303997993 / 2.5803199768 m.
- `npm run build`: exit 0; existing chunk-size warning (`build.log.gz`). The helper is intentionally not wired by this branch, so this is not evidence of a released bundle containing it.

### Full current-state suite is NOT green

`npm run test:current-state` was also attempted. It exited 1: first candidate run 927 tests, 792 pass, 135 fail. The helper and its two new test files were then temporarily removed (and restored after the check) to run the untouched R61 production/source-test baseline: 974 tests, 839 pass, 135 fail. Failures include old exact-source/geometry guards, outdated product inventories and fixture API problems such as `lib.aspect is not a function`.

The default-parallel runs did not enumerate identical file/subtest counts. Their identical fail counts do **not** prove identical failures or a clean full regression. Both complete logs and every named failure/difference are retained in `all-current-state.log.gz`, `r61-all-current-state-baseline.log.gz`, and `full-suite-comparison.json`. No old assertions were changed, suppressed or claimed to pass. Parent cumulative release validation remains necessary. The latest dedicated geometry and R39 tests above are green.

## Actual CPU evidence

`tests/r62-jingren-rear-window-export-cpu.mjs` exports actual merged production triangles from the bounded R61 hall before and after the helper. The unchanged `scripts/r58-court-facade/raster-diagnostic.py` makes six diagnostic images:

- `evidence/jingren-rear-south-whole-{before,after}.png`
- `evidence/jingren-rear-window-close-{before,after}.png`
- `evidence/jingren-rear-south-oblique-{before,after}.png`

All six were directly viewed, with the three final after views re-viewed after the nested-run adjustment. Each pair uses identical local eye/target/FOV; exact camera matrices are in `evidence/proof.json`. Source hashes bind the pre-commit render to R61 plus the precise helper/tests/exporter bytes. The final independent commit is provided with the handoff. The images show actual sill/upper/lower partition changes while the surrounding retained shell remains fixed. Flat palette CPU output is not browser rendering, source texture evidence, matched-photo visual acceptance, lighting/time-of-day verification, or full-facade approval. No official photo pixels are reproduced.

Actual counts:
- Raw meshes: 44 → 72 (+28), replacing four boxes with 32 new solid meshes.
- Merged triangles: 1,632 → 6,496 (+4,864).
- Merged material meshes: 14 → 18 (+4).
- Owned materials: 7 → 11 (+4).
- Physics unchanged: 27 colliders, 1 walkable, 1 room, 1 map item, 0 regions.
- Non-target geometry hash unchanged: `5019243fc1afc6952b37cdee460532d4e394d923ab0937cd0e05871eb269ac7a`.
- Navigation/physics hash unchanged: `a86aff7aeac7c0596e582c0eff6460c32d3e573cd8401b7a42cbfd644bb73838`.

## Owner integration

One owner hook only: import `applyJingrenRearWindows` and call it on the already-built frame after original rear-hall metadata assignment. Do not alter the generic kit or R39 assertions.

`tests/lib/r62-jingren-rear-window-world-check.mjs` exports `assertJingrenRearWindowsInWorld(W)`, `replayJingrenRearDoorInWorld(t, W, {fps:10|60})`, and `JINGREN_REAR_WINDOW_VIEWS`. These consume the owner's existing W; they do not construct a world or insert/modify geometry, proxies, collisions, or walkables. Normal query scratch buffers and matrix updates are not a replacement for actual existing-world checks. This remains a partial E improvement with browser and complete visual fidelity unresolved.
