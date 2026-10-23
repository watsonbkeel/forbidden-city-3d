# R51 courtyard route diagnostic

Result: PASS on frozen CharacterSystem SHA-256 `0e5764c8ac4b5417e5c4e2ab2b2d45876323da99b0f59c9a12fe9d7ea9be22a3`. Production hashes were equal at run start and end. This is a focused regression record, not a claim that the user's already-resolved cached-version observation persists.

## Reproduction and scope

Run `node tests/r51-courtyard-route-visibility.mjs` from the repository root. The script retains all 38 registry entries, builds actual PALACE_LAYOUT, registers/prebuilds all actual zones, and uses the real dynamic ZoneManager, Teleport.go, FirstPersonControls, CollisionManager, CharacterSystem, CharacterManager and CharacterRenderer. No actor positions, scales, bindings, architecture or colliders are replaced. Actual controller walking uses 1/60-second frame input. Daylight is 0.802 from the production Beijing cycle at 2026-10-22 08:20:10 UTC.

Map-destination selection calls real Teleport.go; it is not a browser map-click test. Ground is actual Environment.setupGround. Unrelated sky, Enclosure, Garden and optional streamed interior overlays are omitted. No browser was started and no prohibited browser path was retried.

## Routes and exact actor evidence

- 永寿门 landing: (95.4, 299.2), feet 0. Walk north through gate to (95.4, 308.5), then (94.9, 309.5). Actual endpoint approximately (94.924, 1.7, 309.448). `yongshou-consort-01` and `yongshou-maid-01`: one settled production render instance each, visibility 1, each 15/15 exact deformed-triangle targets visible in the camera viewport. Maid fixed at (88.9, 0, 316); consort remains on her immutable courtyard route.
- 翊坤门 landing: (94.6, 356.6), feet 0. Walk through gate to (94.6, 363), then (92, 363). `yikun-consort-01` at (91, 0, 369.5) and `yikun-eunuch-01` at (89.3, 0, 369.5): one instance each, visibility 1, each 15/15 visible triangle targets.
- 西二长街 from 永寿门 landing: walk to (95.4, 301), east to (122, 301), then north to (122, 314). `west-lane-guard-01`, `west-lane-guard-02`, `west-lane-guard-03`: one instance each, visibility 1. Initial rays 2/15, 2/15, 15/15 because the nearest patrol member occludes much of the other two when viewed straight down their line. After approximately 10.5 simulated seconds: rays 13/15, 13/15, 15/15; displacements 7.8196 m, 7.7530 m, 7.7268 m. They move and are not frozen stand-ins.

All walking segments reached within 0.12 m, no camera collisions were recorded. A first exploratory QA waypoint south of the 永寿门 landing was blocked by an existing wall; the final passing route uses the real cross-street at z=301 and makes no geometry/collision change.

## Lifecycle

- Characters off: actual CharacterRenderer batches = 0.
- Characters on: three patrol IDs return as one visible instance each, 13/15, 13/15 and 15/15 visible triangle targets.
- Teleport to 午门: actual ZoneManager unloads west-six, zero west-six actor render instances and no stale bound west-six roles.
- Return via the same actual 永寿门 and 翊坤门 walking routes: both pairs recover as single visible instances, 15/15 rays each. Patrol reentry is not independently re-sampled after this unload; its separate off/on and movement checks are recorded above.

## Small CPU images

- `r51-courtyard-route-yongshou-court.png`: 6,927 visible character pixels after occlusion.
- `r51-courtyard-route-yikun-court.png`: 6,869 pixels.
- `r51-courtyard-route-west-second-lane.png`: 364 pixels; straight-down-line view, therefore overlapping patrol silhouettes. Use exact-ID rays for individual patrol evidence rather than interpreting this as three separated figures.

These are perspective CPU z-buffer diagnostics of actual scene and submitted instance geometry, base/vertex colors only. Architecture is untextured white because the test material library does not reproduce image textures. They are NOT browser screenshots and establish no GPU, mobile, runtime lighting, shadow, visual-quality or historical acceptance. Total pixel counts are not per-actor counts. Raw geometry exports remain under /tmp, not in repository deliverables.
