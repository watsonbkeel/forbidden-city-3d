# R34 continuous-tour CPU validation

## Scope and limits

This is production-controller/DOM-fixture validation, not browser walking or a visual acceptance report. The route work does not change palace geometry, collisions, physics, user speeds or teleport behavior. It starts from R33 commit `1c60d533`.

The available browser could not create a WebGL context even on the existing public release. Localhost access and previously denied screenshot/file routes were not bypassed. Therefore actual rendered walking, native browser focus/pointer-lock behavior, mobile hit testing, and visual stair readability remain unverified. The tests intentionally distinguish these limits from CPU evidence.

## Continuous route

`tests/r34-continuous-route.test.mjs` runs 72 continuous trajectories:

- Ordinary ground start outside Wumen `(0, -470)` to the north Shenwumen exit `(0, 550)`, and the reverse direction.
- Wumen portal, Jinshui bridge, Taihemen, real side stairs of the three-tier terrace, Taihe interior bypass, Zhonghe's actual stair and throne bypass, Baohe interior and north descent, Qianqingmen side stair, Qianqing interior aisle, Jiaotai aisle, Kunning's actual southeast entrance and east passage, garden side path, Shunzhenmen and Shenwumen.
- B fallback and the actual checked Taihe/Qianqing/Kunning S assets installed by `InteriorLoader` into the retained production scene and collision world.
- Central route: 60/20/10 updates per second; ordinary/sprint movement; W and backward S motion; both geographical directions.
- Five-bridge excursion: all five bridges in one connected serpentine itinerary before continuing through the entire central route. Three bridge lanes (center and ±1.5 m), 60/10 updates per second and both geographical directions. This covers every bridge in both directions without teleporting between bridges.
- Exactly one `setPosition` call per trajectory, at the initial ground spawn. Every waypoint is physically crossed; the same controller carries momentum and height through all old test-segment boundaries. The player settles on ordinary ground at the opposite exit.
- Ground-support tracing rejects height rescue, unverifiable support selection, invalid coordinates and below-ground/roof-level trajectories. Sprint reaches the unchanged production 12 m/s on straight approaches.

`tests/lib/continuous-visitor-route.mjs` joins the established geometry-derived route definitions. It omits one artificial legacy test endpoint: after climbing Qianqingmen's real side stair and crossing onto its landing, the older segmented test backed south toward the central carved apron before the next segment teleported there. The connected itinerary instead continues north from the landing. The original segmented tests and their tolerances are unchanged. No carved stone is converted into a stair.

The test-only `buildWorld({ retainScene: true })` option retains the already-built scene solely so the real optional-interior contracts can validate and install. Default callers retain their former return shape and behavior.

## Session integration

`tests/r34-tour-session-integration.test.mjs` executes the real `main.js` UI callbacks by suppressing only automatic application startup and exporting its private class for tests. DOM/canvas and timing are fixtures; actual controls, map, settings, flight state, landing envelope, walking collision and input dispatch remain production code.

Four integrated scenarios cover desktop and mobile-input variants:

1. One continuous Wumen-to-Shenwumen walk, with map search/card/back and settings interruptions at three positions. Search text, focus and scroll return state survive; settings freezes the actual walking controller; resuming an open map restores free movement. Neither search nor any interruption calls teleport or `setPosition`.
2. Board at the real home pad; start automatic flight; search/read/return on the moving map; reject map walking-teleport while boarded; take over manually; pause via Escape and settings; reject airborne disembark; request and complete actual automatic landing at the Taihe forecourt pad; disembark through the explicit button; walk away and return along the clear exit lane; reboard. Aircraft position is never assigned by the test. The only post-spawn walking placement is the explicit disembark operation. Parked collision is present when unoccupied and removed on reboarding.

Mobile route movement uses real touch dispatch into the production joystick at a modest analog deflection; this verifies controller/session integration, not a device/browser usability inspection.

## Reproduce

- `node --test tests/r34-continuous-route.test.mjs`
- `node --test tests/r34-tour-session-integration.test.mjs`

The route tests must be rerun on the combined R34 checkout after art, courtyard and lighting changes are integrated. A central-axis-to-Chuxiu-and-back itinerary is a separate integration addition once that courtyard's route is finalized; it is not claimed by this initial report.

Initial checkout results: all 198 selected route/bridge/map/settings/flight regression tests passed, including the 74 route test nodes (72 trajectories plus two parent groups) and four integrated UI scenarios. `npm run build` passed; only Vite's existing large-chunk warning remains. These are pre-combination results, not final R34 acceptance.

## Combined R34 Chuxiu excursion addendum

After the courtyard addition, a continuous global approach exposed an inherited disconnected Yikun forecourt: the two estimated southern wing placements overlapped the main-hall side routes, while their outer edges met the court walls. Local tests starting inside Tihe had not detected this global-access gap. The grounded quarter-metre diagnostic and actual controller replay both reproduced the blockage. No test tolerance, wall collision, hall interior, or player radius was relaxed to make it pass.

The courtyard owner's separate repair moves only the two explicitly estimated wing positions south by 4 m and marks that placement as a reversible fit. It preserves their geometry and the main hall, rather than inventing unsupported doors through gable walls. Official descriptions establish the connected courtyard relationship, not these coordinates: [Yikun](https://www.dpm.org.cn/explore/building/236517.html), [Chuxiu](https://www.dpm.org.cn/explore/building/236486.html). This test contribution itself remains tests/documentation only.

`tests/lib/chuxiu-visitor-route.mjs` now supplies one complete model itinerary:

- Wumen exterior through the original central halls to Qianqing rear veranda.
- Outer Jiaotai terrace and its real side stair, not a shortcut across the raised Qianqing causeway railing or through Jiaotai display furniture.
- Yuehuamen, west long street, Yikun gate, one fitted side alley, Tihe, the new three-sided Chuxiu gallery, Chuxiu main hall and an accessory-hall entrance.
- The other Yikun side alley, back along the same connector to the central axis, then Jiaotai/Kunning, garden and Shenwumen.

The path has 133 waypoints and about 2,149 model metres. Twenty-four additional continuous trajectories cover B and installed S, both geographical directions, 60/20/10 updates per second, ordinary walking and sprint. Each run crosses all 132 waypoint boundaries with the same controller and exactly one initial ground placement. Independent actual-floor witnesses also reject travel underneath the six central halls, Tihe, the gallery and Chuxiu hall. This is not a claim about today's real museum entry policy or a measured walking distance.

Combined checkpoint `1515f34`: all 102 route/session test nodes passed (96 complete trajectories, two parent groups and four integrated UI scenarios). The separate integrated flight/input/operations group also passed 30 tests. All test worlds hold their zone collisions resident; real network timing, zone-streaming/render transitions and GPU/browser visuals are outside this replay's coverage. The complete route suite should be rerun after any further combined-scene change.

## Final integrated route correction

After the R34 Taihe display moved, the legacy z=5 segment endpoint intersected its front platform. The continuous visitor helper now derives a normal floor viewpoint one metre before the current stair toe (z=1.12), uses the same point at both segment boundaries, and preserves the real x=6.2 lateral aisle. No physics, collider, arrival tolerance, floor witness or single-spawn assertion changed. Final integrated route/session rerun: 102/102 passed, including B/S, both directions, 10/20/60 Hz, walk/sprint, Chuxiu excursion, all five bridges and desktop/mobile input simulations. These are CPU replays, not browser/manual or real-device evidence.
