# R59: six unresolved Nansansuo declaration interiors

This change withholds unsupported generic furniture in exactly outer-east items 12–17. It is **not** evidence that these rooms are empty, nor that the inherited six-shell/two-row model correctly represents the three historical advances of each court. Current room names/boundaries/navigation remain unresolved. Each room exposes UNKNOWN inventory, UNVERIFIED layout, no accepted historical room identity, and explicit NOT_VALIDATED boundary/navigation metadata.

## Production boundary

- Six explicit data policies bind the exact existing declaration, coordinates, dimensions and runtime inventory ID. No new building/actor or placement.
- One narrow CourtKit method uses the existing private UNKNOWN-room contract only after exact allowlist validation. Ordinary halls still reject a public policy. Unmarked halls and corridor policy defaults remain unchanged.
- Exactly 48 generic meshes / 576 box triangles and their 48 furniture colliders are never generated. Cover references are removed with the props. All retained geometry/materials, structural colliders, floor supports, doors, original spawn points, room kind/bounds and maps are compared exactly against the retained unmarked fallback.
- Existing roof treatment, hall placement and unresolved courtyard identities are not repaired or newly accepted here.

## Verification

- `frozen-baseline-red.tap`: rerun with the exact frozen declaration data policy absent, producing six real unsupported-prop failures. This uses the retained unmarked production path; it is not represented as a complete older-world rerun.
- Initial fixture errors are preserved separately. They were caused by serializing the intentionally null pre-atlas plaque material, not gameplay failure. The serializer now records null honestly; no production material was changed.
- `green.tap`: 11 local checks. `controller.tap`: 48 actual-control round trips, six doors × 10/60 Hz × W/S × walk/sprint, ground → unchanged 0.9 m floors → ground.
- `world-consumer.tap`: actual raw and merged six-declaration geometry; missing-room and ghost-collider negatives fail closed. This is a small component fixture, not whole-world acceptance.
- `concentrated-local.tap`: final same-scope checks plus existing R58 gallery/declaration policy regression. See exact totals/exit in that log.
- The frozen JSON fixture is byte-exact with the recorded R58 source and SHA, independent of the availability of local commit IDs after publication.

`tests/lib/r59-nansansuo-inventory-world-check.mjs` consumes the integrator's existing W without building or mutating it. The compressed fixture is a lossless QA contract, not runtime data. Generate it with `node scripts/r59-nansansuo-inventory/export-contract.mjs`.

Whole-world 108 actors / 24 routes, streaming reloads and production build remain pending the concentrated B integration. Browser/GPU/phone and historical visual acceptance have not passed.

Final local classification: 117 tests, 115 pass, 2 fail. The inherited R58 eight-corridor-only assertion predates R58's final twelve-corridor/declaration policies (axis JSON is unchanged in R59). The R58 two-source-file-freeze assertion is inapplicable to R59's authorized exact Nansansuo and Donghua shared hooks. Both original assertions/logs remain red and are not counted as passes. `tests/r59-shared-inverse-contract.test.mjs` separately reverses only the enumerated new source fragments and verifies complete R58 SHA-256 equality for all three shared modules. This is a versioned scope proof, not an edited old oracle.
