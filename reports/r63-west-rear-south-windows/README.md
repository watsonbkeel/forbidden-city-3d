# R63: two west rear-hall south window corrections

This is a bounded facade correction only, not acceptance of either hall, zone F or the complete palace. Baseline: `f87342d7e1506713df4a6877943eb377e8299593`. Only the new `WestRearSouthWindows.js` module is production code; shared builders, roof code, canonical data, maps and room definitions are unchanged in this branch.

## Exact targets and evidence

- `west-six/items/47`, runtime 咸福宫后殿, canonical 同道堂, `FC-0B25381D42`. Official photograph: https://img.dpm.org.cn/Uploads/Picture/dc/18015%5B1024%5D.jpg . SHA-256: `c7e93e5dc4f186007c74d2f65a1cf5b3de4743c4f099e6ddda1a037218dda090`.
- `west-six/items/24`, runtime 储秀宫后殿, canonical 丽景轩, `FC-A7ECBBD837`. Official photograph: https://img.dpm.org.cn/Uploads/Picture/dc/18008%5B1024%5D.jpg . SHA-256: `0fc63393392cd835e23399eca305affb73eedd16ce38ce36fc62314e767ebc74`.

Both originals were directly viewed before modeling and their byte hashes checked. Photograph capture dates are unknown. No official photograph is copied into this repository, report, public directory or delivery archive.

Observed classes: Tongdao has masonry beneath upper rectilinear lattice and subdivided lower glazed fields; Lijing has masonry beneath shorter diagonal-lattice upper fields and larger lower glazed fields. The existing five-bay arrangement and dimensions are retained model fits, not measurements. Two fields per closed bay at Tongdao and three at Lijing are reversible visual fits. All lattice spacing, ornamental repeat counts, colors, framing widths, sill height and glazing appearance remain fitted, not surveyed. Unknown fine carving, inscriptions, joinery and historic paint are not reconstructed. Dark opaque glazing is an explicit visual surrogate; exact glass transmission and backing are unknown.

The source photographs' closed central leaves and modern visitor barriers are deliberately not copied into gameplay.

## Bounded change and navigation

The helper validates source index, exact item fields, runtime/canonical identity, rear-hall profile, zone and frame transforms, source mesh geometry attributes/UVs/groups, unique ownership, source mesh matrices and four existing collision slabs before any replacement. Repeated application, wrong identities or any malformed panel fail atomically.

Only four source `lattice_doors` closed panels per hall are removed. Each replacement remains within that panel's original 4.56 × 4.28032 × 0.14 model-metre box, centered at x = ±5.24 and ±10.48, z = -6.45, bottom y = .45. The sill is .9 fitted model metres tall. Framing and upper rectangular patterns use a planar union; Lijing's diagonal lattice is a single perforated extrusion per field, not overlapping diagonal bars.

All other original mesh objects, attributes, UVs, indices, transforms, materials, roof, columns, wall head, generic furniture, platform, plaque and threshold are retained byte-exact. The two existing open central leaves at x = ±2.2, z = -5.5688 remain unchanged. Each hall keeps 27 colliders, one walkable, one navigation room and one real south-door record. Room/map/region arrays are unchanged. There is no fake window-door route or new collision proxy.

This helper does not inspect, replace or alter roof geometry, so the separately owned exact roof correction can coexist. Its own retention proof intentionally includes the original roof unchanged. During combined roof+window integration, only the separately authorized roof triangles may be excluded from a cross-version comparison; window, leaf and physics checks must remain unchanged.

## Verification

- Final focused tests: `node --test tests/current-state/r63-west-rear-south-window*.test.mjs`, 29/29 pass. Logs: `combined-tests.tap`.
- Test-first failures: `red.tap`, `routes-red.tap`, `upper-lattice-red.tap`, `envelope-red.tap`. These show missing helper/consumer and the later tighter grille/envelope requirements failing before implementation.
- 9/9 selected bounded R39 rear-hall/roof regression tests pass: `legacy-r39-selected.tap`.
- Actual triangles are finite, positive-area, envelope-bounded and preserve their measured bounds through the production material merge. Removed unshared source geometries are disposed; new materials are kit-owned.
- Negative guards cover wrong index, hall/zone/canonical identity, malformed envelope, rotation and scaling, stale matrices, missing/duplicate/shared/edited panels, invalid material/UV/groups, missing source collider and repeat application. The world consumer rejects missing actual sill/glazing/lattice/frame triangles or collisions rather than trusting metadata.
- Pure parent consumer checks both halls in one existing scene: 36 actual triangle contacts and six clear central-portal rays.
- 16 actual FirstPersonControls combinations pass: two halls × 10/60 Hz × W/S × walk/sprint input. Each goes outside → inside → lateral interior → outside → inside → outside. Starting and ending feet are zero; maximum feet .45; no rescue or unverified support. At 10 Hz, walk/sprint routes use 97/53 frames; at 60 Hz, 582/308 frames. Minimum sampled overhead clearance is 2.5803199768066407 model metres; body collisions are checked at every fourth recorded frame.
- First normal build was terminated during transformation (`build.txt`). Retrying with bounded V8 heap, `NODE_OPTIONS=--max-old-space-size=384 npm run build`, succeeds (`build-retry.txt`) with the existing chunk-size warning. This branch deliberately has no shared hook, so that build does not establish integrated helper inclusion.
- No full-world/current-state aggregate suite, browser, GPU, texture-fidelity or historical visual acceptance was run or claimed. Parent integration and aggregate gates remain required.

## Actual same-camera CPU evidence

`export-cpu.mjs` uses the SHA-checked frozen baseline ZoneBase source to build the actual bounded production hall, applies only this helper for the candidate, then exports real post-merge triangles. The existing shared CPU depth rasterizer renders three identical-camera baseline/final pairs per hall. All 12 final diagnostic PNGs were directly viewed. These show the changed sill/lattice/glazed subdivision with the central opening and unrelated shell retained. Tongdao's roof in these images is intentionally still the baseline roof, not the separately owned roof correction.

- `evidence/{tongdaotang,lijingxuan}-south-whole-{before,after}.png`
- `evidence/{tongdaotang,lijingxuan}-south-window-close-{before,after}.png`
- `evidence/{tongdaotang,lijingxuan}-south-oblique-{before,after}.png`
- `evidence/proof.json`: source hashes, exact cameras, mesh/triangle counts, retention fingerprints, physical counts and real triangle contacts.

Lijing: 1,646 → 9,726 merged triangles (+8,080); 15 → 20 material meshes. Tongdao: 1,646 → 8,750 triangles (+7,104); 15 → 19 material meshes.

Both non-target local mesh fingerprints: `630adde8b79a5cb91fa6f4f437c06f41b7f72b1415f8fcb3de2e850a8c73aa20`.
Lijing physics: `16ef87ad0946252d0b5567863664057cd12a2c2667ade9fac041c25362da0871`.
Tongdao physics: `5e05cc35c06c8daa0689b1b05010c789fd4f393db16db9468a28ce62ba355645`.

## Minimal integration hook

Import `applyWestRearSouthWindows` from `../palace/special/WestRearSouthWindows.js` in the parent-owned ZoneBase. Immediately after `buildHallBaseline(item)` has assigned the rearHall/structure records:

```js
if (this.zoneJson.id === 'west-six' && [24, 47].includes(itemIndex)) {
  built.f.updateWorldMatrix(true, true);
  if (!applyWestRearSouthWindows(this.kit, built.f, item, itemIndex)) {
    throw Error('West rear south window profile failed closed');
  }
}
```

For an already built W, import from `tests/lib/r63-west-rear-windows-world-check.mjs`:
- `assertWestRearSouthWindowsInWorld(W)` checks both halls. An optional second argument 24 or 47 supports bounded diagnostics.
- `replayWestRearSouthDoorInWorld(t, W, {index: 24 | 47, fps: 10 | 60, backward: false | true, sprint: false | true})` performs the actual controller replay.
- `WEST_REAR_SOUTH_WINDOW_VIEWS` provides fixed local diagnostic cameras.

The consumers do not rebuild a world or mutate geometry, colliders, walkables or room data. They use normal production collision query scratch state only.

## Review hardening successor

Two concrete review gaps were reproduced before correction (saved in `qa-hardening-red.tap`):

1. The original supplied-world consumer could pass with all 5,344 upper-interior Tongdao grille triangles removed, because its frame contact was a lower jamb and its upper contact was backing. The consumer now keeps every original assertion and all 16 Tongdao core contacts, and additionally requires 216 fixed upper-frame triangle contacts: both vertical and horizontal sides of every outer/nested rectangle in all eight upper fields, plus 24 horizontal interconnections. Front-plane depth and actual material are checked. No metadata-only or search-for-any-survivor shortcut is used for these added checks.
2. A frozen `frame.userData.structure` caused the final result-metadata assignment to throw after geometry/material mutation. The production helper now preflights the only existing-object metadata write before allocation/removal: the record must be extensible and no own or inherited descriptor may intercept an existing result marker. Frozen, sealed, non-extensible, readonly-marker and own/inherited setter cases return false without source disposal or mesh/material/physics changes.

Final successor tests: 37/37 in `qa-hardening-tests.tap`. Mutation regressions cover the exact 5,344-triangle removal, each individual 1,336-triangle window removal, and each of the 24 interconnection front triangles independently. The original routes, portal, collision and geometry assertions remain intact. No heavy build or full world was run for this successor.

`qa-hardening-proof.json` verifies both successful target results remain bit-identical to the prior committed CPU evidence for all mesh attributes/transforms/material names, retained meshes, physics, owned counts and metadata. The existing 12 CPU PNGs therefore remain geometrically current; source hashes for the minimal guard and updated consumer are recorded in the new proof. This changes neither facade design nor any production geometry.

## Compound-aware route successor

The original isolated route is intentionally unchanged. Its Lijing start `(94.5, 439.7)` is inside the preserved Chuxiu main hall in the actual compound, not in a courtyard. Both frozen R62 and integrated R63 stop against the same north-wall collider: min `[81.25, .6, 440.9]`, max `[108.35, 3.6, 441.5]`. At 60 Hz the reproduced blocked witness ends near `(94.5, 440.37648)` with feet `.6`. The parent's original B-current failure was not edited, replaced or relabeled as green.

A QA-only opt-in, `compoundApproach: true`, now selects a legal existing compound approach:

- Lijing: east-side ground `(110.5, 440)` → `(110.5, 442.5)` → rear gap center `(94.5, 442.5)` → existing central portal `(94.5, 443.75)` → interior. The route returns around the same side and enters/exits twice.
- Tongdao: ground-clear courtyard endpoint `(149.3, 441.5)` → existing portal `(149.3, 443.35)` → interior, twice. This avoids return-settling drift onto the retained Xianfu north stair near the former isolated endpoint. It does not change, move or disable the stair or its support.

The entire production west-six zone is built for these tests, including Chuxiu main hall, courtyard, corridors, trees and other retained zone objects. The whole palace is never built. Frozen R62 uses the SHA-checked source fixture. The recorded candidate run used the actual integrated source at commit `2f8f4e931889e08bdfdac1b1336e33c80d490ff1`, with ZoneBase SHA-256 `c753ad4276a1f411c05a342f27d156ff0ada5a297779080a83b807533c01c3f1`. `R63_WEST_COMPOUND_SOURCE_ROOT` can select an integration checkout; without it, the fixture uses current source and applies the standalone window helper only if that hook is absent.

Final verification: `compound-route-tests.tap`, 34/34 pass: 32 complete-zone route combinations (R62/R63 × both halls × 10/60 Hz × W/S × walk/sprint) and two assertions preserving the old blocked witness. All new routes start/end with feet zero, reach .45, use no rescue/unverified support, and pass actual body/head clearance samples. `compound-route-isolated-regression.tap` retains 37/37 prior tests, including all original isolated route combinations. Earlier route failures and the initial endpoint-support finding remain in `compound-route-red.tap` and `compound-route-initial-diagnostics.tap`; the first diagnostic also exposed a test-only collider-wrapper lookup error subsequently corrected to inspect the real Box3 records.

`compound-route-proof.json` collects actual route diagnostics and source hashes. This successor changes QA fixtures, route selection and reports only. No production helper, builder, collider, walkable, map or room data changes; no heavy build or full-world run.
