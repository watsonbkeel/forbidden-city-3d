# R58 scoped upward-head clearance

This is a functional CPU correction, not browser or GPU acceptance.

The preserved actual Wumen jump red is under `../r58-wumen-north-portals/`: the old vertical integrator could raise the head into the new curved north-head masonry. Only three explicitly marked `piecewise-linear-x` solids are added. Their closed volume follows the authored rendered inner profile and uses the complete body footprint, not a centre ray or a closed rectangular replacement over the whole opening.

`CollisionManager` validates and deep-clones a marked shape before registration/update, uses its curve as narrowphase, and limits upward head sweeps. `FirstPersonControls` consumes that bound only during positive vertical velocity; downward motion is unchanged. The clamp leaves 1 mm clearance when approaching and never moves an already touching body downward. Unmarked boxes keep their previous body inset and upward behavior. Zone removal and clear have no separate shape registry to leak.

Evidence:
- `method-red.txt`: 8 method tests failed before this shared code change.
- `method-green.txt`: the same 8 tests pass after the change, including footprint edge, exact contact, descent, legacy behavior, malformed data, immutable clone, update and removal.
- `representative-controls.txt`: 150/150 existing tests pass. Explicit scope: ordinary keyboard/touch braking and stability, helicopter input handoff/flight operations, permanent Taihe interior navigation, Wumen folded stairs and Wuying moon-terrace routes. These are programmatic CPU controls, not browser UI or a physical phone.
- Full real Wumen stationary/moving/diagonal jump matrix and integrated-world verification are separately required. This method checkpoint does not substitute for them.

Commands: `node --test tests/r58-overhead-collision.test.mjs`; representative suite: `node --test --test-concurrency=1 tests/input-physics-invariants.test.mjs tests/input-stability-boundaries.test.mjs tests/r36-helicopter-input-handoff.test.mjs tests/current-state/r31-flight-operations.test.mjs tests/current-state/taihe-core-navigation.test.mjs tests/wumen-folded-ascent.test.mjs tests/r52-wuying-moon-terrace.test.mjs`.

A follow-up isolation test found that generic `supportHeight` would otherwise expose the curve proxy's broadphase top as an extra standing level. The head-only proxies are now explicitly skipped there. `support-isolation-red.txt` preserves the ninth failing test; `support-isolation-green.txt` contains all 9 passing tests. Existing unmarked support is explicitly checked and unchanged. The 150 representative tests were run before this additional marked-only skip; the new actual Wumen upper-platform check is recorded with the Wumen matrix.
