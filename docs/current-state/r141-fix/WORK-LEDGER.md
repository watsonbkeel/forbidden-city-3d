# R141-fix — imperial characters and actual Taihe interior lifecycle

Emergency fix based on exact R141 a485abe324bfc70405838671efaa981b9fe3a9d8; no R142–R145 content included. No main/Pages changes by implementer.

## Reproduced defect
The production InteriorLoader validates and replaces eight Taihe B fallback batches with the actual S GLB. SharedRestNavigation treated the authorized fallback visibility transition as hostile static-source mutation. SharedRestRoutine then set both emperor and Chuxiu consort `routineRenderable=false` in daytime and nighttime. If west-six unloaded while this error was active, its offline-source record also remained invalid until rebuilt. This was reproduced with real decoded assets/InteriorLoader, not inferred from a synthetic route test.

## Bounded fix
- Runtime-only identity registry, exact eight same-scene fallback batches, registered only after validated atomic S installation, revoked before restoration/unload/failure/disposal.
- Unchanged old source ownership, transforms, geometry/material checks. Only the active registered replacement permits these fallback meshes to be hidden.
- Replacement exact ordered position/normal/index bytes, attribute identity/shape/version, parent chain, transforms, material visibility/side/opacity and draw range remain checked. Per-validation local reuse only; no cross-frame trust cache.
- Actual S source triangles replace the hidden B contact rows; actual S seated binding and shoe supports must resolve and match the retained daytime position before transfer. On unload the original B rows return. Cold construction with S already present is also supported.
- Unknown hidden fallback, mutation without needsUpdate, detached/invisible/transparent/moved S still fail closed, including when both actors are remote. No queue-budget, character identity, 40m residency, night schedule, movement route or player collision changes.

## Verification in progress
Actual RED then GREEN loader test; real lifecycle/negative mutation tests; actual InstancedMesh submissions at the shifted northwest bed with production lighting, occlusion, normal cache/eviction/rebuild and 40m hysteresis; S-loaded complete night/morning roundtrip at 10/30/60 Hz. Daytime submissions (both actors in low/high, actual instance count and 12 near-view unobstructed triangle rays) now pass; final retained gates, build and remote readback are tracked separately and are not implied by these results.

CPU scene/instance tests are not a physical GPU/phone acceptance. Real browser GPU rendering remains unverified unless separately evidenced. No claim all original architectural requirements are complete.
