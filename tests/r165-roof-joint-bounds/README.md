# Call-local roof clipping bounds

Base: `adc306fcac0cff588ee2ae348ed7ae5a6c99338f`. Only the exact reviewed `CanopyRoofSurfaceJoint.js` runtime changes. Frozen old bytes are checked against that Git object; source tests compare every other tracked runtime/data file. Historical source normalizers accept this exact new SHA, then restore the exact old bytes, rather than exempting a module from verification.

Run 20 new lightweight cases:

```
node --expose-gc --test --test-concurrency=1 tests/r165-roof-joint-bounds/{bounds,equivalence,lifecycle,joint,source}.test.mjs
```

Run the existing eight boundary/library/player-clearance cases:

```
node --test --test-concurrency=1 tests/r49b-roof-joint-boundaries.test.mjs tests/r49b-joint-library-compatibility.test.mjs tests/r49b-canopy-player-clearance.test.mjs
```

Run two actual production zones serially (not World):

```
node --expose-gc --test --test-concurrency=1 tests/r165-roof-joint-bounds/production-zone.test.mjs
```

Optional evidence output: set `ROOF_BOUNDS_EVIDENCE_DIR` to an existing directory. Full raw and merged payloads, materials, metadata, contacts, tops, roof digest, map/rooms/regions, collision queries and source release/re-registration are checked against the old joint implementation through the otherwise unchanged production ZoneBase. West-six also executes the existing real-controller Chongjing routes. Tests do not render GPU frames.

Reproduce component CPU samples, without parallel tasks:

```
node tests/r165-roof-joint-bounds/benchmark.mjs
```

Optional `ROOF_BOUNDS_BENCH_OUTPUT` writes JSON. Each component uses two warmup pairs and ten alternating AB/BA pairs. Only its production build call is timed, excluding material-library setup, snapshot comparison and disposal. Every run asserts full identical geometry/physical/metadata output. This is a Node component CPU sample, not a whole-zone, frame-rate, Mac temperature, browser or crash-root-cause benchmark.

Red/green: the original Chongjing algorithm projects numeric X/Z polygon bounds up to 720 times per internal polygon; the new bounds test requires at most two (once per axis). The old code fails it. Current three consumers retain exact outputs. First/last WeakMap failures preserve the original exception and release allocated resources; repeat calls do not reuse prior polygon bounds. Synthetic tests preserve existing transformed, edge, signed-zero, empty, NaN/Infinity and invalid-penetration results/errors, without claiming to improve their validation.

The memo is private to one invocation and only keys arrays of internally copied, subsequently immutable points. It is not a scene/source identity cache. No cached collisions, asynchronous loading, changed player logic, lower precision, increased 32 MiB admission or relaxed certification is introduced. Temporary JS bookkeeping adds one bounds record per visited polygon; peak memory/GPU impact was not measured.
