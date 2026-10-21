# R36 independent baseline audit

Baseline: `0d7bbf23`, branch `feat/r36-south-layout-interiors-20261021`.
Inspection performed before R36 production edits. No production file or old fixture was changed by this audit.

## Freshly executed baseline

Command:

```sh
node --test --test-concurrency=1 --test-reporter=tap tests/inner-jinshui.test.mjs tests/r32-river-bed-integration.test.mjs tests/court-wall-contract.test.mjs tests/place-catalog-complete.test.mjs tests/current-state/r31-place-search.test.mjs tests/current-state/r31-flight-operations.test.mjs tests/map-gestures.test.mjs tests/map-inputs.test.mjs tests/input-physics-invariants.test.mjs
```

Result: 121 tests passed, 0 failed, 0 skipped; duration 4,630.6 ms. This is CPU source/geometry/input coverage, not browser rendering or native walking acceptance.

## Most exposed boundaries

1. Historical source and scene registries bind complete prior inventories. The R35 current-state source guard expects all production and provenance bytes to remain exact. New R36 sources or changed `ZoneBase` / zone JSON are expected to invalidate those old candidate identities. Preserve old fixtures and assertions; report historical applicability separately. Do not project R36 into R35 and label that a current-runtime pass. R35 already records a separate historical diagnostic with 175/183 passing and eight failures.
2. `InnerJinshui` currently models only the first-entry reach, with open ends at local X ±76. Its five crossings are separate N–S decks at X -30, -13, 0, 13 and 30. Equal 6.1 m widths and 21 m runs are explicitly fitted values, not five independently measured real dimensions. `Layout.js` still contains an obsolete rectangle/no-bow comment; actual runtime is bowed.
3. The new river must be one consistent water/ground-cutout/bed/bridge/collision model. Test the full Environment + PalaceBuilder + axis + outer-east + outer-west scene, not the river builder alone: decorative roads or courtyard ground can reseal the water even when isolated bridge tests pass.
4. `FlightEnvelope.createPalaceFlightEnvelope` reads north/south sampled banks as monotonically increasing X segments. Bent or N–S extensions require explicit compatible handling; otherwise new water may be landable. A mesh is automatically water-marked only when its material name matches `water`.
5. `tests/lib/world.mjs::hallGeom` and `auto-routes.mjs::hallRect` know only the old generic, pavilion, Qinan and Yanxi geometries. A new compound profile needs its own geometry/navigation adapter. Do not claim generic rectangular estimates prove entrance access to an I-shaped building.
6. Existing `auto-routes.test.mjs` starts its legacy controller at Y=300. That suite is useful as a historic regression diagnostic but insufficient for new ground-entry acceptance. New south routes must start on the ordinary ground once and preserve real stair contacts, support height and player radius across the entire trip.
7. South hall baseline is not differentiated current-display evidence: Wenhua and Zhujing use `A:palace-front`, Wuying has an explicit generic throne, Jingsi and Yude use `B:hall`; Wenhua uses one 37.5 × 50.5 m hall rectangle overlapping the separate Zhujing location. Tests should check the actual new constituent meshes and furnishings, not only metadata or display labels.
8. PlaceCatalog requires every existing name + zone binding exactly once. A split compound cannot produce duplicate named map rectangles or move a registered footprint center without preserving the binding rule. There are exactly 159 public cards and seven acknowledged identity/history gaps; new scenery must not silently promote those gaps to facts.
9. Zone streaming, material ownership/disposal and far silhouettes must be exercised for both affected zones. Rebuilding a zone must not stack duplicate furnished halls, resurrect generic thrones or leak colliders, walkables and geometry.

## Required direct-current acceptance

- Topology: distinct eastern and western courtyard graphs, true front/link/rear constituents, opposite-facing side halls, enclosing walls ending at real wall/gate/roof interfaces rather than an accidental mirror or disconnected courtyard boxes.
- Bridges: five retained axial crossings, separately evidenced western three crossings, and a distinct Duanhong crossing. Duanhong requires documentary 18.7 m N–S length and 9.2 m width, not a rotated generic five-bridge copy. Derive all route directions from actual built geometry and check water below the real vault opening.
- Physics: bridge deck triangles agree with support throughout each run, rail collisions stop lateral walking, approaches begin/end on dry ground, no non-bridge shortcut across water. Use forward/reverse and walk/sprint at 10/60 Hz with one real ground start.
- Walls: collision strips remain closed outside explicit portal cuts; wall mesh and collider endpoints meet each other, arches and adjacent buildings; each intended entrance has a playable, finite route on both sides.
- Interiors: actual source-backed displays differ by hall; no inherited generic throne assembly; all displays are inside documented room bounds with a usable aisle and no doorway overlap. Metadata alone does not prove the mesh exists.
- Public behavior: existing 159 identities, seven uncertainty labels, card search/back without travel, geographic map orientation, flight bounds/home/landing targets, Esc pause and grounded disembark remain intact.
- Verification claims: CPU geometry tests, browser visual inspection, native movement, optional S asset state, GPU performance and physical-device tests are separate outcomes. Never infer a passed unrun category from another category.

## Independent water integration checkpoint, 2026-10-21 02:39 UTC

These are in-progress observations, **not final R36 acceptance**. The production
owner is still editing water interfaces. The independent test file is
`tests/r36-south-independent-water-integration.test.mjs` and uses actual current
Environment, PalaceBuilder and all three southern ZoneBase merged groups.

- First full-scene diagnostic exposed both north-of-gate culverts capped along
  the actual X-direction flow by reused longitudinal bridge arch geometry. The
  owner replaced them with a Y/Z vault section extruded along X. Fresh independent
  rays at water + 0.05 m and + 0.45 m, in both directions, subsequently passed;
  upper wall/gallery and a physical platform layer remained present.
- The first whole-scene 10/60 Hz real-controller bridge replay reached the
  Wenyuan pond bridge and stopped at approximately `(-186.5, -157.0)`, against
  the old south courtyard wall. Ten preceding bridges had been exercised in both
  directions; the final Donghua bridge was not executed after that failure.
  This is a genuine integrated route obstruction, unlike an old source hash
  mismatch. It remains pending the owner's courtyard/interface work.
- The actual extended water polygon appeared in the real Minimap draw path with
  the retained north-up / geographic east-right coordinate transform. The
  southern flight envelope marked every sampled extension as water while all
  three declared landing points stayed safe. This does not substitute for the
  full all-zone flight suite or native browser behavior.
- Two initial independent-test assumptions were corrected rather than charged
  as production bugs: a manually chosen point outside the slanted channel, and
  expecting `CollisionManager.addWalkable` to retain `structureId` metadata.
  Support checks now inspect the actual builder outputs and match their numeric
  geometry into the actual manager, which deliberately strips that metadata.
- At 02:38:50 the next focused run encountered a concurrent editing state:
  `outer-east.json` already selected `wenyuan-pavilion` before ZoneBase routing
  was written. Its six construction errors are one **editing checkpoint
  blocked**, not six independently established regressions. Further execution
  is paused until the owner declares the interface checkpoint coherent.

Native GPU screenshots, WebGL rendering, frame rate and device interaction were
not validated by these CPU geometry tests.

### Stable water checkpoint 95082ea, 02:46 UTC

Fresh command:

```sh
node --test --test-concurrency=1 --test-reporter=tap \
  tests/r36-south-resource-lifecycle.test.mjs \
  tests/r36-south-independent-water-integration.test.mjs \
  tests/r36-south-world-helper.test.mjs
```

Result: **17 passed / 0 failed / 0 skipped**, 7.33 seconds. The pond bridge route
now reaches the actual north bank, turns east and avoids the six-bay pavilion's
center column rather than moving the bridge to a fictitious central entrance.
All 12 bridges passed in both directions at 10/60 Hz with a single ground start.

The helper change is limited to explicit `southGateProfile`. Its old no-profile
fallback remains byte-identical to R35. New tests compare real toe/portal
coordinates and execute all three portals of both actual gates from ground.
This is a diagnostic adapter repair, not a weakening of old scene expectations.

Resource tests use real Three disposal events and real TextureLibrary ownership.
Both complete southern zones, PalaceBuilder's water roots and Environment's
cutout were built/disposed three times with stable retained CPU inventories.
Actual ZoneManager loading/unloading also removed collision tags and did not
duplicate map identities. Private merged/source display geometry and materials
were released once; borrowed library resources remained alive. No GPU memory
measurement is claimed.

### Additional dated photo evidence

The independent auditor viewed the complete Wenhua front/link and rear contact
sheets and all 16 Wuying independent-case frontal images in their contact sheet.
The new evidence supports replacing the previous one-vessel-only conservative
fixture with a one-to-one source-linked 4 + 5 + 7 cabinet arrangement. The frozen
fact fixture `tests/fixtures/r36-wuying-dated-photo-evidence.json` is extracted
from the independently researched official 2021 panorama, not from production
coordinates. It records source URLs and downloaded-photo hashes without shipping
the photographs. The panorama's schematic camera points are deliberately NOT
converted into metric cabinet positions. Wenhua's passable front circle screen
and non-passable rear round display must remain functionally distinct.

### Independent current-byte checkpoint, 02:59 UTC

The five independent files below ran together with real current production
modules and returned **41 passed / 0 failed / 0 skipped**, 10.45 seconds:

```sh
node --test --test-concurrency=1 --test-reporter=tap \
  tests/r36-retained-public-contracts.test.mjs \
  tests/r36-south-independent-hall-integration.test.mjs \
  tests/r36-south-independent-water-integration.test.mjs \
  tests/r36-south-resource-lifecycle.test.mjs \
  tests/r36-south-world-helper.test.mjs
```

Every file under `src/` and `data/` was hashed before and after the run. No
production file changed during execution. The canonical manifest SHA-256 is
`a90d3ab25765ef720b8d7b607567af096bd8cedb5592622c9a9bdcab698a8bce`.
The log is `/tmp/r36-audit/independent-all-current.tap`. This is an intermediate
candidate, not a claim that later edits inherit the result.

The test counts at that point were public contracts 6, actual merged halls 15,
actual merged water/interfaces 11, resource ownership 4 and gate helper 5.
Dates now distinguish the publication date, panorama package date, reference
month and unknown photography date. The cabinet evidence remains a dated
installation, not a claim of the October 2026 inventory. Both Wenyuan side-wall
culverts retain their explicitly fitted, not photographed, status.

The subsequent helper diff review found and reported duplicated southern
route branches inside the generic `sideCorridor` search. They referred to
undefined `zone`/`out`. The owner removed that accidental insertion while
retaining the intended `zoneRoutes` adapter; the immutable old scene fixtures
were not altered to conceal it.

### Added negative approach checks, 03:00 UTC

Two additional tests target Wenyuan's new bent-path teleport exception. An
actual blocker at the north-bank turn correctly prevents travel. Removing all
resident pond-bridge supports, while retaining the authored water-crossing
footprint, incorrectly still returns `approachVerified: true`. The default
zero-height ground and the north-bank endpoint tolerance are insufficient
evidence of a physical bridge. This fault-injection safety gap is reported to
the production owner and is **pending**, making the independent suite 43 tests
with this newly added requirement red. It is not a claim that the complete
current bridge is physically broken; the complete bridge routes passed above.
The two-test log is `/tmp/r36-audit/wenyuan-approach-negative.tap`.

### Frozen production checkpoint be5b668, 03:18 UTC

Final independent rerun of the same five current-module files returned
**46 passed / 0 failed / 0 skipped / 0 cancelled**, 10.69 seconds, against
`be5b668b2cddf6ba20fa6027da593d09683f6823`. The counts are public contracts 6,
actual merged halls 17, actual merged water/interfaces 14, resource ownership
4 and gate helper 5. No `src/` or `data/` file changed during execution.

The canonical production manifest SHA-256 is
`10df25f8bfd48d2477317cb7250ce8a96f9a4bfaa324d4e8500b379cf24cadb8`.
The run log is `/tmp/r36-audit/independent-final-be5b668.tap`; its before/after
manifests are `/tmp/r36-audit/independent-final-before.json` and
`/tmp/r36-audit/independent-final-after.json`.

The previously red Wenyuan support requirement is resolved. Missing complete
bridge support, a transversely displaced real strip, an unloaded destination
and an actual turn blocker are rejected; the normal route remains usable.
The two added Wuying access checks enter the seven-case exhibit through both
side openings from a single real-ground start at 10/60 Hz, rather than only
walking around an inaccessible enclosure.

The subsequent non-test source review found and closed a true eastern
water-polygon self-intersection/union mismatch and Baoyun gallery ghost floors.
See `INDEPENDENT-CODE-REVIEW.md` for exact evidence and dispositions. Source
review also removed three unsupported Wenhua island low cases, retaining only
the one north long-face case directly supported by `a035-b`. The final
46-test result includes that conservative source correction and the new
Baoyun closed exterior geometry in actual zone lifecycle builds.

These results do not replace the coordinator's separate direct-current and
historical/mixed full regressions. No old identity fixture is called applicable
to changed R36 geometry, and no GPU, FPS or native-browser success is claimed.
