# R58-A fifth batch: declaration-only unknown inventory

Baseline: c9a82aaa8316954e80a03aa934cd8e745065322e. Scope is only axis-courts/items/26, /27, /32 and /33. Production changes are limited to data/zones/axis-courts.json and src/scene/palace/GalleryInventoryPolicy.js.

## Identity and acceptance boundary

The canonical CROSSWALK runtimeInventory records identify these existing declarations as RI-1DCBD55D5B90, RI-BDA7502B3BD6, RI-2555B6BDA0A9 and RI-7D8EE589FEA1 respectively. Those records are unnamed static declarations, not verified current-render or historical-room bindings. Candidate associations to named annexes remain BLOCKED_SOURCE; this patch does not adopt those names or any guessed FC ownership.

Each opt-in policy contains only mode, exact declaration target and runtimeInventoryId. Every resulting candidate-room registration says inventory UNKNOWN, accepted false, knownEmpty false, layout UNVERIFIED, namedRoomIdentity null, boundaryValidation NOT_VALIDATED and navigationValidation NOT_VALIDATED. A retained generic runtime label is not a named historical-room identity. There is no empty-room reconstruction claim, no new room, no new shape, and no reconstructed room census.

## Measured bounded delta

The four predecessor declarations contained 725 meshes / 19,052 triangles and 577 colliders. The candidate contains 464 meshes / 15,920 triangles and 316 colliders. Exactly 261 preset meshes, 3,132 triangles, 261 exclusively owned colliders and 116 exclusively owned cover points are removed. The removed actual preset census is 22 kang, 22 cloth, 22 tables, 44 stools, 22 cabinets and 129 crates. All 32 inherited room AABBs and registrations, 4 supports and 64 spawn points remain. Doors, wall/floor/ceiling geometry, materials, geometry attributes, world matrices, maps, regions and navigation registrations compare exactly to the predecessor after removing only documented furniture-owned output.

All other JSON declaration lines are byte-identical, including the previous eight unknown policies and defaults 38–41. The previous eight metadata and physical streams remain exact. Removing only the four new policies restores predecessor component output. Baseline and candidate controls after the same ordered component construction have identical physical outputs; global Three.js UUID allocation counts are not artificially compensated.

component-delta.json contains per-item original/retained counts, ownership records, retained and removed mesh/triangle/collider SHA-256 hashes, support/navigation hashes, canonical actual entry paths and source hashes. The new compressed world contract is four declarations only. The previous eight contract is reused unchanged at tests/fixtures/r58-gallery-world-contract.json.gz (SHA-256 0db418d7f6d165f39cfc9ed52f20f93f441a144820add61fde8cfdfdad0d2a70); no duplicate giant oracle is generated.

## Existing-W consumer API

Import assertDeclarationInventoryInWorld and declarationEntranceRoutes from tests/lib/r58-declaration-inventory-world-check.mjs.

assertDeclarationInventoryInWorld(W) requires the owner's actual existing scene, collision manager and rooms. It never constructs a zone/world, reconstructs room registration or repairs geometry. It verifies all retained submitted architecture triangles and structural collider/support registrations, absence of removed prop shapes even with another material, absence of prop-owned ghost colliders, exact candidate bounds and unknown metadata, then invokes the unchanged previous-eight consumer. Expected totals: 4 new declarations / 32 rooms, 15,920 retained triangles, 3,132 absent triangles, 316 retained colliders, 261 absent colliders, 4 supports; combined with the previous eight, 12 declarations / 84 rooms. New+previous totals are 42,144 retained triangles, 8,004 removed triangles, 804 retained colliders and 667 removed colliders.

declarationEntranceRoutes(W) derives actual world-space entry-round-trip/frontage paths from registered bounds and doors, with explicit candidate ordinal selection and all 32 candidate entrance paths included. It does not use historical names or infer historical ownership. The owner can pass these paths to the existing runGalleryControllerRoute(W, points, options) with fps 10 or 60, sprint false/true and backward false/true. Starting feet for these low-plinth component entrance tests is 0. No new world is built here.

## Inherited navigation limitation, not repaired or concealed

Initial first/last-candidate probes exposed two inherited overlaps with the unchanged global river exclusion mask: item 27 candidate ordinal 0 and item 33 candidate ordinal 5. No structural colliders intersect those tested entrance centerlines. The previous geometry has the same exclusion. All 32 retain floor/ceiling and support, but only 30 tested centerlines are collision-free under the retained mask.

Successful canonical entry selection is ordinal 0 for items 26/32/33 and ordinal 1 for item 27. Successful bounded frontages use ordinals 0–9 for 26/32, 1–5 for 27 and 0–4 for 33. The invalid original first entry / full frontage of item 27 and full frontage of item 33 are still tested at 10/60 Hz, walk/sprint, W/S: all 24 probe combinations remain blocked in both predecessor and candidate. Outcomes compare within 1e-8 only for repeated floating-point mock-clock arithmetic; no production clearance or collision is relaxed. controller-initial-red.tap retains the discovery evidence. The canonical routes do not imply the complete world is traversable or the candidate boundary is historically validated.

## Verification and superseded assertion

- Baseline predecessor inventory suite: 31/31 pass.
- New successor tests: 133/133 pass. Includes 64 successful real production-controller routes, 24 paired preserved blocker probes, raw/merged component consumers, actual removal census, reject tests and byte/stream invariants.
- Unchanged previous consumer negative and real fallback texture tests: 9/9 pass.
- Unchanged predecessor eight-only inventory suite: 30/31 pass. The sole failure is “JSON adds only the exact eight policy fields and no structural values”. It correctly rejects the now-authorized four additional opt-ins and is explicitly SUPERSEDED_BY_TWELVE_DECLARATION_SUCCESSOR, not weakened or edited. All other predecessor assertions still pass.
- Red-before-production test evidence is retained in red.tap. Initial route-assumption and mock-clock precision failure logs are retained separately, not labeled as successful verification.
- No full world, full-world suite, application build, browser, official-source pixels, dependency changes, upload, main change or Pages publication was performed. Cumulative whole-world acceptance belongs to the owner.
