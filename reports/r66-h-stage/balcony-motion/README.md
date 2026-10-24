# R66 H balcony / gate / flight QA

## Outcome and scope

Only QA files were changed. No production edits, commits, browser, whole-world construction, altered physics, invented stairs, enlarged rail walls, reduced body radius, or extra support surfaces were used.

The original R66 turned south-rail candidate was withdrawn by the production owner during this audit. The final scene retains all 110 actual R65 rail meshes (geometry, material, matrix and visibility hash identical), all 273 R65 architectural collision proxies in order, the same walkables and ground-room navigation. Eight old unverified ground-furniture proxies are intentionally withheld by the separate inventory work. FirstPerson.js and Collision.js are byte-identical to R65.

The retained-scope suite passes 30/30. This is NOT a full-body jump/drop acceptance. The deliberately strict final body suite remains red: 3 passed, 11 failed. The original candidate's frozen strict suite remains red: 3 passed, 9 failed. No skipped, TODO or expected-failure wrapper hides those failures. Reports contain their actual process exit codes (0, 1, 1).

## Reproducible commands

- node --test --test-reporter=tap tests/r66-h-balcony-motion.test.mjs
- node --test --test-reporter=tap reports/r66-h-stage/balcony-motion/strict-acceptance-original.test.mjs
- node --test --test-reporter=tap reports/r66-h-stage/balcony-motion/strict-current-body.test.mjs

The first checks retained scope. The second reasserts no-penetration against frozen ORIGINAL candidate frames, not current geometry. The third replays CURRENT production controls/geometry and deliberately fails the unresolved strict acceptance. Do not report all three as green or sweep archived strict failures into a successful release claim.

## Full-body evidence

The independent oracle intersects each actual world-space rendered triangle with an axis-aligned feet-to-eye body, radius 0.5 m and height 1.7 m. A 0.00001 m surface-touch epsilon excludes resting contact; it does not remove lower legs. Per-mesh AABBs are only a broadphase. The tight full-body proxies and production checkCollision result are recorded separately. Additional 0.04 m chord samples are reported separately from actual update-frame contacts because the controller resolves horizontal movement before gravity.

All probes begin at finite, actual balcony floor coordinates x=216, z=478.03, feet=7. This is conditional safety testing, NOT a route or permission to reach the upper level. After that one spawn, only real FirstPerson jump and input/update movement is used.

### Unresolved retained defects

1. Immediate forward jump, 60 Hz, walking speed, no diagonal. First rendered-frame contact is frame 6 (zero based), t=0.116666667 s, x=216, z=477.9034122432576, feet=7.731111111111112, head=9.431111111111111. The real top rail and baluster intersect the body, tight full-body proxies intersect too, but production checkCollision=false. Rail top is 7.98. The collision body's inherited 0.35 m lower-leg clearance allows this crossing before the complete body is above the rail. Sprint and both diagonal jumps also reproduce it.

2. Immediate walking-speed forward jump, 10 Hz. At frame 10, t=1.1 s, x=216, z=473.5693761312301, feet=5.679999999999998, head=7.379999999999998, the player descends through real lower roof/soffit and eave triangles with no production collision. The moved R66 plaque may also intersect this already-invalid descent; this is not used to attribute the old roof defect. R65 has the same roof contacts, frame count and trajectory. Walking-speed 60 Hz and diagonal cases reproduce lower-roof contacts too.

3. Real rail-top step-off/drop, 60 Hz. Jump at t=0, begin forward at 0.2 s, stop at 0.35 s, resume forward at 1.4 s. The player actually lands on the retained 7.98 m rail before walking off. Frame 90, t=1.516666667 s, feet=7.976111111111111, head=9.67611111111111 has a real rail contact while production checkCollision=false. The narrower 0.3 m support footprint loses support before the 0.5 m body clears the rail. Lower-roof fall-through follows. The 10 Hz case also has real roof contacts and a sampled rail chord contact. No airborne spawn or forced feet was used.

Exact triangle vertices, body bounds, proxy indices/bounds and matching R65 first contacts: first-contact-triangle-witnesses.json.

## Passing bounded checks

- 10/60 Hz ordinary walk and sprint with straight, left-diagonal and right-diagonal inputs: 12 cases remain on actual floor y=7, do not fall, and have no body/triangle or swept chord contacts. This does not mean jumping is contained.
- Intentional jump with forward sprint beginning 0.2 s after takeoff: both rates fully clear the low rail, clear the roof, and land at ground y=0 without triangle contacts. The low rail is not supposed to be an unjumpable invisible wall.
- Actual jump onto the real rail, stop, then step-off correctly changes grounded/airborne state and follows gravity. These two state tests explicitly diagnose the unresolved body contacts and are NOT geometric acceptance.
- Actual FlightState board/update/landAt and FlightTour.exit: both rates reject balcony landing and airborne dismount, blocking descent at the real-mesh local envelope (minimumY=15.091273880004882), then return to default home and permit stopped ground dismount. The actual FirstPerson handoff restores feet=0 and head bob, actual model exit offsets are used, two parked collision boxes are registered, and the full body is clear of the actual helicopter model. UI/DOM are stubbed; browser control success is not claimed. Only one hall is in the envelope, so return flight proves local invariants, NOT a whole-world route.
- Closed Yinghua door: both approach directions, 10/60 Hz, walking/sprint and three lateral offsets (24 replays) stop before actual closed door leaves, with no actual arch/door triangle contact. Threshold walking animation is not relabelled as door penetration.
- Actual ZoneBase buildGate snapshots for 揽胜门, 建福门 and 寿安门 exactly match R65 geometry, colliders, walkables and maps, including the rotated gate.

## Retained-vs-original proof and artifacts

- r65-r66-initial-matrix.json: frozen 48 original R65/candidate replays, 24 pairs, all trajectories identical. Never overwritten after rollback.
- retained-final-matrix.json: 28 final R65/current pairs (56 replays), all trajectories exactly identical, including intentional delayed jumps and real rail step-offs.
- retained-comparison-summary.json: compact pair comparison, initial contact witnesses and endpoints.
- original-strict-red.tap: original candidate's 9/12 strict failures.
- current-strict-red.tap: current retained geometry's 11/14 strict failures.
- retained-scope-final.tap: 30 passing scope checks, including explicit known-residual diagnostics.
- flight-final.json: both-rate flight and real dismount details.
- r65-retention-baseline.json: immutable R65 source-derived snapshot before accounting for separately authorized ground inventory removal.
- final-source-hashes.json: exact final tested sources and QA helper hashes.

Each standalone suite took approximately 0.1–1.3 seconds locally. Replay construction is bounded to individual fixtures; no world/browser work was launched. No production file was edited by this worker.

## Reversible report containers
Pure final-matrix output and TAP logs are stored as gzip with original hashes in ../raw-logs-index.json. The original strict-test input remains raw, so all three replay commands above still run unchanged. Run python scripts/r66-h-stage/verify-report-archives.py [new-destination] from repo root to verify or restore exact original bytes. The raw source/evidence commit remains6e3beaf8983e57beb196240419248f81a324bd6d.
