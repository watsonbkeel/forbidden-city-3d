# R52 Wuying current-world QA consumer migration

Base: ee93c2ab103d41955b7b35df900e76fec952b6b7. QA-only branch; no production, data, collision-engine, main or Pages changes.

## Route contract

The old `(219.5, -212.2, feet=0)` source spawn is inside the newly solid terrace. It remains rejected; there is no rescue or below-deck route. Current consumers use `wuyingMoonTerraceAccess`'s exact side-stair contacts, unchanged physical waypoint crossing, then the retained Wuying/Jingsi I-plan gallery. Gate routes cross the real west lateral portal and descend its retained north stair before approaching the terrace from the side. The centre north stair is covered and is not reused as a ground approach.

The fixed 33-route CLI defaults to R52. Only its Wuying ingress changes; original Xihe/bridge prefix, first two points, row name, driver and gallery endpoint are retained. All other 32 rows are byte-equivalent as JSON. The original R48 frozen oracle and JSON are unchanged in their expectations; the oracle explicitly selects `FIXED_ROUTE_CONTRACT=r48-leaf-turn`. Its assertions still pass against that historical generation contract.

All original height, collision, actual-body triangle, room-visit, start-on-ground, no-rescue and one-placement assertions remain. R36/Wuying route hooks use the same successor rather than new independent coordinates. Old `-6.3` lateral door turns use the already-established `-5.95` leaf-clear turn.

## Verification

- `before-audit.txt`: original current-world audit is 0/8, blocked at the obsolete low spawn.
- `after-audit.txt`: successor 8/8, 10/60 Hz × walk/sprint × forward/backward; original body/ceiling assertions retained.
- `before-profile-consumers.txt` / `after-profile-consumers.txt`: 9 stale R36 route cases fail before and all 9 pass after.
- `verified-live-routes.txt`: 56/56 selected live route/consumer tests pass in one serial Node process. This includes both named auto-routes in all 8 modes, both sides' exact canonical coordinates, the frozen R48 exact oracle, actual gate profiles, same-world map checks in the inherited R36 adapter, and nineteen exact normalized new supports with the two covered ramps removed.
- `before-review-consumers.txt` / `after-review-consumers.txt`: two sampled old west/east review routes fail; all sixteen migrated review routes pass with the original full-body/new-detail triangle guards.
- `standalone-flight-descent.txt`: standalone CPU wrapper passes 2/2 at 10/60 Hz.
- `flight-descent.json` / `.txt`: real full ZoneManager world and actual mesh-derived envelope, production `FlightState.board/update/landAt/exit`, 10/60 Hz, radius 5.7, zero position writes. Continuous climb/cruise to Wuying, actual downward input blocked at 13.15 / 12.85 m (envelope minimum 12.752823448181152 m), rejects terrace ground landing/dismount, then physically returns, descends and exits at home. This is programmatic CPU controller input, not browser/UI/GPU evidence.
- `intermediate-current-consumers.txt` preserves an earlier 60/64 run: three generic failures below, plus a test-only metadata-count mistake corrected by comparing real CollisionManager-normalized supports. The final live suite passes that corrected check; no production metadata was added.

Run the final live command:

```sh
node --test --test-concurrency=1 tests/r52-wuying-route-consumers.test.mjs tests/r48-audit-real-world-gallery-details.test.mjs tests/r48-fixed-route-leaf-turn.test.mjs tests/r36-navigation-adapters.test.mjs tests/r36-dated-gallery-composition.test.mjs tests/r36-south-independent-hall-integration.test.mjs tests/r36-south-world-helper.test.mjs
```

Additional narrow commands:

```sh
node --test --test-concurrency=1 --test-name-pattern='Wuying south-entry' tests/r48-review-outer-finishes.test.mjs
node --test --test-concurrency=1 tests/r52-wuying-flight-descent.test.mjs
```

Integrator entry points (no rebuild): `runWuyingConsumerChecks(t, W, {fps,sprint,backward})` and `verifyWuyingFlightDescent(W, envelope, {fps})`. The southern-route owner covers the full START→Xihe→Wuying journey and map arrivals on the release candidate. This branch does not claim those final integrated results.

## Unchanged red generic assertions and exact R51 comparison

The current whole R48 gallery file is not declared wholly green. Its old augmentation-equality expectation rejects the intentional new supports/ramp removals. Its new-geometry area guard also found zero-area moon-rail finial pole triangles; reported to the geometry owner, not weakened here. See `baseline-generic-red.txt` and `narrow-consumers.txt`.

Crucially, ee93 is already an A+B candidate, NOT the R51 baseline. `fac791-to-ee93-budget.json` uses the same direct `ZoneBase.buildHall` fixture on frozen fac791 and ee93 production. `fac791-generic-check.txt` runs the original named assertions at fac791.

- `wenhua: source-bound independent five-bay halls joined by one physical connector`: already red at fac791, unchanged metadata mismatch at ee93.
- `wuying: source-bound independent five-bay halls joined by one physical connector`: already red at fac791, unchanged metadata mismatch at ee93.
- `wuying: dated exhibit identity replaces generic royal furniture and finite geometry has a bounded budget`: NEW R52 budget regression, 132,466 → 158,494 triangles (+26,028, +19.65%), exceeding the original 150,000 limit by 8,494. Moon terrace contributes 11,068 tagged triangles. Refined-form tagged geometry is 17,648, replacing 2,688, net +14,960. Wenhua remains 41,940. No threshold was raised; integrator/geometry owners must resolve the candidate budget.

`baseline-pure-generic-red.txt` means the pre-QA-adaptation ee93 candidate, not R51. Reproduce numeric comparison with `node reports/r52-wuying-consumers/compare-budget.mjs <frozen-fac791-worktree> <candidate-worktree>`.

Only trailing whitespace on Node console-output blank lines was normalized in the committed text logs; outcomes and assertion bodies are unchanged.

No browser, GPU, texture, performance or timing acceptance is claimed. The prior browser/socket and sandbox denials were not retried or bypassed.
