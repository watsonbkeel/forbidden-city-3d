# R63-F Independent Bounded Integration Review

Reviewed 2026-10-23 UTC. Initial reviewed state: `b38459c` plus the uncommitted exact owner hooks in `ZoneBase.js` and `RemainingResidentialHalls.js`; frozen comparison baseline: `f87342d7e1506713df4a6877943eb377e8299593`.

## Status

**Three findings reproduced. Corrections assigned; corrective changes and regressions have not been independently reverified in this review. This is not a release pass.**

The review was read-only until writing this report. No production, canonical, fixture, or test files were edited. Only small isolated in-memory checks were run. No full-world, aggregate-suite, build, browser, WebGL, mobile, or historical-fidelity acceptance is asserted.

## Findings awaiting correction and reverification

### F1. Supplied-world Tongdao window consumer can pass without its upper rectangular grille

- Location: `tests/lib/r63-west-rear-windows-world-check.mjs`, `assertWestRearSouthWindowsInWorld`.
- Impact: Tongdao's probes cover sill, lower-side frame, lower glazing, and upper recess, but not the upper rectangular grille. The full-stage consumer therefore cannot establish that this requested feature survived the production merge.
- Reproduction: create `fixture(47, true)` from `tests/lib/r63-west-rear-south-window-fixture.mjs`. In each `frame-and-rectangular-lattice` mesh, remove every nonindexed triangle whose three vertices satisfy `x > centerX - 2.181`, `x < centerX + 2.181`, `y >= 3.0849`, and `y <= 4.6304`. Rebuild every geometry attribute from the retained vertices, preserving material, group, and metadata. Then call `assertWestRearSouthWindowsInWorld(world(f), 47)` after the normal merge.
- Observed: **5,344 upper-interior grille triangles removed; consumer still passed with 16 contacts.**
- Required verification: fixed, actual-triangle probes of the upper rectangular grille/interconnections, plus a negative regression reproducing missing upper geometry. A generic frame count is insufficient.
- Owner: `correct_rear_south_windows`. Exact reproduction delivered. **Pending fix/reverification.**

### F2. Window helper can reject after destructive mutation

- Location: `src/scene/palace/special/WestRearSouthWindows.js`, final `g.westRearSouthWindows = meta` assignment.
- Impact: metadata mutability is not validated before originals are removed and replacement resources allocated. The tested atomic-rejection boundary does not cover this supplied malformed state.
- Reproduction: create `fixture(47)` from the same window fixture, then `Object.freeze(f.frame.userData.structure)` before calling `applyWestRearSouthWindows(f.kit, f.frame, f.item, f.index)`.
- Observed: call threw `Cannot add property westRearSouthWindows, object is not extensible`; original target panels fell from **4 to 0**, new parts became **24**, and kit-owned materials increased from **8 to 12**.
- Required verification: reject non-writable/non-extensible metadata before materials, meshes, or removals; regression must establish unchanged originals, resources, and disposal counts.
- Owner: `correct_rear_south_windows`. Exact reproduction delivered. **Pending fix/reverification.**

### F3. Roof helper disposes geometry still borrowed outside the original roof

- Location: `src/scene/palace/special/TongdaoRoof.js`, `sourceRoof` ownership validation and old-roof disposal.
- Impact: uniqueness is checked among original roof meshes only, not against other kit objects. An attached non-target borrower can retain a geometry that the replacement disposes.
- Reproduction: create `r = fixture()` from `tests/lib/r63-tongdao-roof-fixture.mjs`; let `source = r.roof.children[2]`; attach `new THREE.Mesh(source.geometry, source.material)` at position `(100, 0, 0)` to `r.kit.root`; observe the shared geometry's dispose event; call `apply(r)`.
- Observed: call **did not reject**; borrower remained attached and the shared geometry emitted **one disposal event**.
- Required verification: preflight ownership across the kit for geometry and vertex/index payload resources before mutation; negative tests should establish zero disposals and unchanged original roof/physics.
- Owner: `correct_tongdao_roof`. Exact reproduction delivered. **Pending fix/reverification.**

## Positive bounded observations

- Built only Yangxin, west unnamed annex 3, Lijing 24, and Tongdao 47 using the **actual live `ZoneBase` owner hooks in one shared CourtKit**, then performed one normal merge and registered the actual CollisionManager. This was four scoped halls, not a zone/world build.
- The supplied-world consumers returned six Tongdao roof surface probes, two window targets, and 60 footstool triangles. These are CPU bounded checks, and do not negate F1.
- Annex 3 retained its global room ID `5`, doors, spawns, and floor metadata, with empty placeholder cover plus explicit `inventoryStatus: UNKNOWN`, `knownEmpty: false`, and `accepted: false`.
- Static dispatch inspection found the exact thirteen west declaration indices disjoint from the two rear-window targets; Tongdao roof runs before the window hook; Yangxin footstool runs after retained R53 warm-room construction. No normal-path coexistence failure was found in the four-hall check.
- The thirteen-declaration contract requires 80 removed placeholder meshes, 80 removed dedicated colliders, and 14 removed cover points, retaining UNKNOWN rather than claiming historically empty rooms. This review inspected the contract/consumer; it did not rerun the complete thirteen-hall suite.
- New route arithmetic is consistent: 16 rear-window modes + 104 annex modes + 16 B footstool modes = **136 B routes**; Yangxin S has **16 additional modes**. This is static census, not execution of those routes.
- `src/scene/palace/kit.js` and character data had no diff from the frozen R62 baseline at review time. No all-108/all-24 runtime proof is claimed by this review.
- At initial inspection the source freeze still contained 241 entries and the old owner hashes. The parent is preparing the final 245-entry freeze after owner corrections. That integration prerequisite is **not verified complete here**.

## Completion boundary

This report records initial findings and bounded positive observations only. Parent/owners must attach their exact corrective commits and targeted regression results, then perform the authorized integrated validation against the final source freeze. Do not interpret assigned fixes, passing unrelated component checks, or this report's existence as corrected/accepted status.

## Bounded corrections received

- 9229049aa2b94cfffd43be3d8fbb68c85e22acaa: roof-wide resource borrowing preflight, eight negative cases and independent-copy positive case. Successful roof geometry is unchanged.
- 691099a8792ed7e498e6b50df67c59f4c2dd1525: metadata writability preflight plus216 upper-lattice triangle probes, exact5,344-triangle omission and24 interconnection negatives. Original16 contacts remain. Successful geometry/physics/metadata fingerprints unchanged.
- f0d7cd4d0279fd14b47666d0205b05bc7f3a5eb1: candidate=false footstool fixture now reads exact hash-checked pre-hook owner bytes; live candidate cannot silently fall back if the declared actual hook fails to run.43/43 checks against actual owner.

Owner final integrated local and world results are separate reports; this review does not itself certify browser/GPU or full F acceptance.
