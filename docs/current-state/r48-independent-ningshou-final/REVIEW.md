# R48 independent NingShou final-six portable audit

## Critical boundary: the original architecture tests used a stub material library

The original review and this portable replay target product commit `8b974ee129298d80488a11e7fdbff21e231fbfc3`. They use `library()` from `tests/lib/inner-palace-fixture.mjs` for the architectural kit, and the existing stub-material collision world from `tests/lib/world.mjs`. They do **not** establish compatibility with the production `TextureLibrary`, browser rendering, or GPU/phone performance.

Huangji's GLB is genuinely decoded from the unchanged shipped asset using the pinned local CPU Draco decoder and is installed by the production `InteriorLoader`. That fact does not turn the surrounding stub-kit geometry into a real-material-library test.

After the original review, a separate audit found that bare-key stub material names and production `${key}_material` names made seven NingShou identities differ in retained old shells or roof coloring. The original `8b974ee` green results must not be generalized to that production-library case. The later real-material repair is product `a32cf01cd21673d2063988bd69ba3a70efd02f0b`, covered separately by `docs/current-state/r48-remaining/independent-real-materials/REVIEW.md` (audit commit `03f37082cb38108c65863888234d79496667431c`, owner integration `3320425`). That later report is not part of this historical product tree. Its findings are not backdated into this run. This package does not rerun or independently re-certify that later product.

This package changes only tests, a six-identity fixture, historical evidence, and this report. No production source, asset, binding, configuration, or published site is changed.

## Scope

The six identities identified from the original ledger and commit delta are:

- 皇极殿: `place-ningshou-b607aa467b`
- 养性殿: `place-ningshou-e32471b7c3`
- 乐寿堂: `place-ningshou-c715f850da`
- 符望阁: `place-ningshou-722e40e471`
- 倦勤斋: `place-ningshou-f4d12b27e6`
- 畅音阁: `place-ningshou-82e7771bd4`

The previous thirteen identities are not claimed as newly reviewed. Visible raw-signature comparisons and shared-helper navigation regressions remain regression evidence only. Unknown dimensions and the new Yangxing framing are fitted model decisions, not measured historic inventories or engineering certification.

## Portable positive suite

From the repository root, with the repository dependencies installed and Node.js supporting `node:module.registerHooks` (the recorded run used Node.js v24.19.0):

```sh
node --test --test-concurrency=1 tests/r48-independent-ningshou-final-*.test.mjs
```

The suite contains exactly 42 positive cases:

- `tests/r48-independent-ningshou-final-huangji-body.test.mjs`: 16 actual-GLB normal-entrance cases. The formerly illegal route must stop, then retreat and use the nearby valid passage without teleporting or resetting feet. Both 10/60 Hz, walk/sprint, forward/backward. Actual visible triangles are tested against production-size bodies, extended to eye height, at every steady platform-height frame.
- `tests/r48-independent-ningshou-final-huangji-lifecycle.test.mjs`: nine real-asset scenarios, including load failure, invalid inventory, partial collider mutation, partial scene mutation, cancellation, stale delivery, and repeated suspension/unload. Only the four isolated fallback meshes are hidden; rollback restores baseline arrays and unrelated object identities. Injected failures intentionally print warnings while their recovery assertions pass.
- `tests/r48-independent-ningshou-final-yangxing-physical.test.mjs`: three selected original physical reruns, covering anchored custom roofs, the actual octagonal aperture/caisson, and the fitted slab-to-beam-to-ground-post chain. These are identified as extracted owner-test reruns, not newly invented independent checks.
- `tests/r48-independent-ningshou-final-yangxing-routes.test.mjs`: eight selected original real-controller doorway/circulation reruns, with actual visible-body checks.
- `tests/r48-independent-ningshou-final-geometry.test.mjs`: six independent geometry cases. They examine eligible custom-shell winding/edge closure and sampled actual floors/voids, not metadata alone. An ordinary layered roof is not claimed to be a closed custom solid; Huangji has no custom-shell or partial-upper-floor samples in this test, as preserved in the original result.

New helpers are exclusively named:

- `tests/r48-independent-ningshou-final-replay.mjs`
- `tests/r48-independent-ningshou-final-visible-body.mjs`

The immutable six-building input is `tests/fixtures/r48-independent-ningshou-final/scope.json`. Existing in-repository helpers supply the production world, controller, waypoint driver, stub library, and CPU Draco adapter. The shipped GLB/decoder and source modules resolve within the current checkout. There is no external-clone root, environment-selected integration root, browser, network fetch, or `review-output` dependency. Running these tests does not write reports or alter the product.

The 42-case selection preserves the original final 36 functional/lifecycle/Yangxing cases plus six independent geometry cases. The portable replay passed 42/42 with zero failures; its log is `portable-run-8b974ee.log`. A second replay in a fresh relocated checkout, with copied package dependencies and no `review-output` directory, also passed 42/42. It deliberately set `R48_INTEGRATION_ROOT` to a nonexistent path and enabled the old report-writing environment flags; neither affected execution, and the checkout remained clean. That log is `portable-relocated-run-8b974ee.log`. The old all-63 consumer run is preserved separately in `history/8b-final-joint-auto63.log`; this packaging task did not rerun the broad aggregate.

The eight existing route-consumer checks remain runnable, if needed by the integration owner, without duplicating their implementations:

```sh
node --test --test-name-pattern='all baseline and explicit|all 63 current automatic|R48 retains all63|R48 raised offset|R48 registered Huangji' tests/auto-routes.test.mjs tests/r48-auto-route-consumer-contract.test.mjs
```

## Original findings and repaired behavior

The original frozen `e0d19a575e0840fd8a52a5b45a02561e48610c1d` allowed normal-entrance body penetration through Changyin stair bracing/guards and the bottom of a Leshou tapered column. Actual Huangji golden-column carving also extended outside its original four proxies. The Huangji route was independently reproduced with the actual R47 loader and same asset at `d37cf4de2a87f6deffff4e57e20c22f7a2dd779c`, so that third defect is inherited, not caused by the new four-fallback atomic switch.

The reviewed repairs use actual column bounds, short transformed sloping-member segments, and localized 0.25m-high Huangji pillar envelopes. They do not add a whole-staircase or whole-gold-material obstacle. Existing asset proxies remain; all new interior boxes share the layer's unload ownership. Old illegal paths need not continue through the obstruction: stopping safely, retreating, and taking the verified nearby passage is the positive behavior.

Yangxing's west slab originally had only rear contact. The candidate adds two ground-bearing corner posts and seven plain fitted beams. Actual mesh contact was checked from platform .9 through posts ending at 4.07 and beams 4.07..4.32 to slab underside 4.32. The rear bearer reaches the old three posts. These are explicitly fitted supports, not a claim of historical column counts or new upper-floor visitor access.

## Preserved history, not default red tests

The `history/` directory retains:

- `e0-programmatic-body-red.log/.json`: the four original Changyin/Leshou failing modes.
- `e0-huangji-body-red.log/.json`: the two original actual-asset Huangji failures.
- `r47-huangji-body-red.log/.json`: their matching actual R47 reproduction.
- Original final functional, geometry and route logs; exact source/hash comparison; and the original bounded review, now prominently annotated with the material-library limitation.

Historical absolute paths appearing in logs identify where the original runs happened; they are not execution dependencies. No historical failing `.test.mjs` is placed in the default discovery set. Failure evidence is not relabeled as success or erased.

## Remaining limits

- Local Huangji pillar-envelope corners retain approximately 2.5–18.8cm of empty clearance at four sampled positions. These conservative AABBs were explicitly accepted as a bounded approximation after nearby legal circulation was tested. They are not carved-mesh-precise collision.
- Inherited `COL_dais` and kit throne keepout prisms remain conservative. Air above a low visible dais is not asserted to be sculpture.
- The original room-grid scans are finite sampling, not exhaustive proof. They and normal-entrance routes cover different failure modes.
- All 63 route names remain; 52 entire objects were unchanged and 11 changed. Two cross-zone Huangji exterior points keep the center-axis viewing purpose but move south 0.8m, from z 269.0 to 268.2. Exact point preservation is not claimed.
- The official Palace Museum source places “畅音阁” at the upper eave: https://www.dpm.org.cn/explore/building/236437.html . The sampled model sign is at that upper level, not certified historic calligraphy. Unknown measurements, inventories and actual visitor access remain unknown/fitted.
- The documented Chromium process failed before page execution. No WebGL screenshot, real-device visual acceptance, or GPU performance result was obtained. Changyin's added short collider segments were not a runtime frame-rate guarantee.
- This package is neither a current full-product acceptance nor a later-real-material-library review. The separate a32cf01 report must be consulted for that later boundary.
