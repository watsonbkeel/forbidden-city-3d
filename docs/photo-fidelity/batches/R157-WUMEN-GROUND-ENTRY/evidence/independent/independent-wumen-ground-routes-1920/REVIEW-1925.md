# Independent review — real-ground engineering-rig entry and stopped routes

## Decision

**Limited acceptance of Task3/Task4 within the explicitly registered local engineering rig.** No P0 or new P1 blocker found for that scope. This is not a live World/PalaceBuilder installation, a surveyed architectural entrance, an unrestricted movement/landing/release implementation, or whole-project acceptance.

I independently ran the 18 small-step tests and replayed the recorded positive/negative positions through the real CollisionManager. I did **not** rerun FirstPerson routes or World, modify repository source/tests, or overlap the author's tests. The author executed the actual FirstPerson runs. All independent artifacts are in `independent-wumen-ground-routes-1920/`.

## Frozen identity and narrow source change

- Reviewed worktree: `r157-wumen-joint-layout-1622`, HEAD `3b2d95ae544d41d348a536a41a4f89026d62e24b` **plus uncommitted candidate changes**; not a claim of clean HEAD runtime.
- Task3: `task3/source-freeze-1917.json` has exactly **600** source/data files; `selected-freeze-1917.json` has **39** inputs. Independently checked every SHA and the complete source path set.
- Formal Task4: `task4/selected-freeze-1921.json` has **40** inputs, adding the formal driver. All 40 and the same 600 match at final review.
- Relative to Task2's 600-file 1908 freeze, only `WumenJointAscentMotion.js` changes, SHA `8a2d186757c12d4b087c25d98191a4db83de1692bc252b3b9b2704995a2afa9a`. Collision, Handoff, FirstPerson, authentication and sweep sources do not change in Task3.
- Actual shared `r72-player-fixture.mjs`, `ui-dom.mjs`, `package-lock.json` and FirstPerson are additionally checked byte-equal to HEAD; their hashes are recorded in `input-freeze-audit.json`. FirstPerson remains `c90de689a5710d1ed272482429b25b14774591eb0f6dd09731cf6bc8c4d5c61c`.

Motion takes the fixed optional domain from immutable registered ground identity, **before** live authentication. Removing the registered ground cannot shrink that domain into an OUTSIDE/null fallback. Only the two authenticated north approach patches enter the live connected graph; the entire ground rectangle is not included. Existing actor/radius, 0.25m maximum substep, height matching, exact adjacency, full-footprint and piecewise body-sweep logic remain unchanged. An unopted-in approach retains OUTSIDE. Independent small-step run: **18/18**, exit 0, 338.832339ms, including both sides, both edge directions, missing ground/entry/neck/receiver and finite-window limits.

## Real geometry versus authority

This successor actually creates the local closed ground box: **+1 visible mesh, +1 ordinary collider, +1 flat support**, relative to the older interior rig. Positive counts are **15 meshes, 545 colliders and 15 walkables**. The two authority patches themselves add no physical rows. Their y=0 top is independently authenticated against the actual ground mesh/body/support, not implicit world zero. These remain detached local experimental surfaces, not an Environment or historical-building ground survey.

The start/end adds the actual zero-height patch centre, one metre north of the entry edge. The remaining centres and seam midpoints stay on the engineering rig; the opposite endpoint is the explicitly labelled receiver test block. Heights, patch length and receiver remain engineering assumptions, not verified pavilion access.

## Driver and all 6,334 positive frames

Initial external driver SHA:
`2f62a881ea22f173b7d1ab141145df370cb696ccab2801008698c52812d1ab6b`.

Formal driver SHA:
`126649832cbebb938f2628656be8066db9a527491f9e109f191c2f401ef195ca`.

The formal file adds explicit test-only source-removal modes and adjusts the expected providers to the actually retained owners. With no negative mode, its **entire 6,334-frame JSON is byte-identical** to the initial positive JSON, SHA:
`8c06251bf2e417283b5ad955b8c83c78fa681754268e669cf41cba86ab70967b`.

The fixture constructs real FirstPersonControls and CollisionManager; it is not an Object.create substitute. Position/ground state is initialized once on the source-defined starting surface. Per frame, the driver changes only camera heading and the forward-input flag; sprint is fixed per case. It does not teleport positions, rewrite velocities or replace controller physics. These are programmatic controls, **not a claim of DOM keyboard-event testing**. The existing deterministic clock and disabled head bob are explicit fixture setup.

The stopping strategy is unchanged from the earlier accepted stop driver: near the final point, release forward based on native velocity damping and distance, then let the actual controller settle. Intermediate waypoint crossing still permits crossing-plane progression; final acceptance does **not** use crossing alone.

Independent offline audit (`audit-ground-stop.mjs`, `stop-frame-audit.json`):

| Measure | Recomputed result |
|---|---:|
| Side × up/down × 10/60Hz × walk/run | 16 cases |
| Total frames | 6,334 |
| Real CM ordinary body hits | 0 |
| Missing source centre / independent full-square .5 footprint | 0 / 0 |
| onSupport missing / airborne frames | 0 / 0 |
| Max authored feet / groundY / vertical-velocity error | 0 / 0 / 0 |
| Input-policy, velocity-recurrence, motion.speed, stable-counter mismatches | 0 |
| Maximum final distance (limit .12m) | .07097741469282867m |
| Tail position drift | 0 |

The footprint audit uses a separately implemented z-slab/x-interval union, not the provider's coverage function. The body replay uses the actual registered 545/15 fixture. All providers, positions, finite state and recorded distances are rechecked. Each case releases forward once, never represses it; the final 10/60 frames have forward false, velocity and motion.speed exactly zero, onSupport true, airborne false and unchanged XYZ.

The stop duration is one second by frame count. Reconstructing the fixture's floating-point clock yields a minimum `0.9999999999999633s`; this is disclosed IEEE accumulation, not a claim of mathematically exact continuous time. Frame records alone do not establish arbitrary unrecorded trajectories; the source's existing accepted-substep sweep is a separate retained contract.

## Original RED and actual fault probes are retained

1. **Same initial ground driver before Motion integration:** 0/16, exit 1, **25,200 frames**, no arrivals. Eight uphill cases fail actual onSupport; eight downhill cases fail final arrival near the entry boundary. This is a genuine pre-approach-Motion assertion RED, not an import failure and not the old 48a Collision-only comparison. The original TAP/JSON are preserved. Its command/source-binding record is explicitly **post hoc**; elapsed/RSS were not captured and remain null. TAP duration is separately available. I checked its hashes and the old Motion identity; I cannot retrospectively turn that record into contemporaneous resource telemetry.
2. **Missing actual ground body after registration:** selected east/up/10Hz/walk fails in the real FP→CM→authentication path with `unique live ground body`. No route record completes; empty results is not a zero-frame passing route.
3. **Wrong ground name after registration:** same selected case fails in the real FP→CM→surface authentication path. Again source rejection, not a complete failing trajectory.
4. **Missing east neck:** the actual neck mesh is hidden and its body/support are not registered; the expected source/footprint table also excludes it. The whole low ground remains physically present. One selected actual FP route records **450 frames**, cannot arrive, and fails the arrival assertion at distance **2.880244834959036m**. Independent 450-frame replay reproduces zero body/footprint/height errors against the remaining **538 colliders/14 walkables**. It ends on `east/return` at feet 11.835971683168406, still requesting forward with velocity 5 but motion.speed 0. Thus it proves **refusal to cross the unsupported high gap, without a low-ground bridge**. It does not prove a natural fall, release-to-air or a real physical blocking wall.

Each of the three formal negative commands executes **one selected test, pass 0/fail 1/skip 0**. The other 15 cases were unselected, not skipped or verified. Do not describe these probes as 0/16 negative coverage.

## Terminal gates and denominator

Independently parsed raw logs/resources and verified:
- Task3 local **163/163**.
- Formal local **179/179**, exit 0: exact +16 ground-route titles, no removed title relative to 163. The existing 920-record parent/current comparison is a single test with its original field/scope limits, not 920 additional top-level tests.
- Six original component/controller/triangle/water/NPC files **55/55**, exit 0; these files remain byte-identical to HEAD. This is not the full project suite or a dynamic World proof.
- Formal positive JSON is exactly the initial 16-case positive JSON; original interior-stop/earlier complete-route RED evidence is not replaced.

## P0–P2 and remaining limits

- **P0:** none found in this bounded reviewed change.
- **P1 before broader use:** no real building/World installer or source-certified stair-to-pavilion entry; no accepted landing, arbitrary authority-window exit, airborne release or missing-surface fall semantics. Domain-boundary diagnostic exceptions/conservative movement refusal must not be marketed as natural traversal safety. Existing architectural topology, elevation, north platform and receiving-entry uncertainties remain open.
- **P2/evidence:** three actual negative routes cover only the named case; the RED resource binding is post hoc; positive FPS routes are deterministic programmed inputs; ordinary-body proxy/clearance is the previously disclosed approximation, not exact foot-to-triangle solid collision. Do not extrapolate local timings or 179/55 to World, full regression, build or GPU acceptance.

**Allowed claim:** authenticated engineering-ground approach joins the existing isolated rig and completes/stops on these 16 real-FirstPerson routes; selected source/neck faults fail closed as specified. **Not allowed:** “午门真实入口/整马道/整楼完成” or “World/full suite/GPU passed.”
