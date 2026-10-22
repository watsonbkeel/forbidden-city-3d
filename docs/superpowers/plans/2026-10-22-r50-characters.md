# R50 Character System Implementation Plan

> For agentic workers: execute the approved v2.0 design using test-first independent modules, then one fresh whole-branch review.

Goal: Add a reversible, non-blocking Qing interpretation character layer over the frozen R49 architectural baseline.
Architecture: One manager owns state, time, lifecycle and a renderer of merged template/pose/LOD InstancedMesh batches. A read-only world adapter binds semantic actor data to existing geometry, supports and navigation. No building, collision or interior loader changes.
Tech Stack: Existing Three.js r162, ES modules, Node test runner, Vite. No engine/dependency upgrades. Exact QA-only @napi-rs/canvas 0.1.100 was subsequently authorized; existing versions remain locked.
Spec: supplied P3-C-characters-v2.0(1).md, read in full; source SHA will be recorded in P3-C report.

## Constraints and decisions
- Base local 92cf31ec1779d0d6266a2caa6ad1708c379d1500, remote R49 03d1f5b446823fbf924df5c239bfdf8c8b69312b. Separate R50 branch. No main or Pages operation.
- 38 required logical actors cannot be made optional: taihe 23, three gates 6, one patrol 3, three living sites 6.
- Model forward +Z, up +Y; world +Z north, -X east; metres.
- C1 visual approval is a hard expansion gate. Before approval, no expanded population is enabled in the application. Three quality prototypes are shown for review; explicitly isolated CPU validation may instantiate the full registry to test real buffers and lifecycle, without claiming scene rollout.
- CPU renders are actual geometric evidence, not WebGL screenshots or GPU verification. Desktop and mobile GPU A/B remain unverified in this environment.
- Complex ritual, walls, ambassadors, audio and network NPC sync deferred, not marked passed.

## Review focus
- Rapid off/on, zone reload and stale async completions never duplicate or resurrect actors.
- Background, low quality and rapid camera changes preserve time/pose/route state and essential actors.
- Missing seats/surfaces stay pending/error, never move to origin or roofs.
- NPCs never intercept raycast, change collision, UI control capture or time/flight state.
- Budget reporting separates estimates and actual full-frame measurements, logical count and render copies.

## Task 1: Three-pose quality kit
Owner: build_character_quality_samples. Files CharacterKit/CharacterAnimation/CharacterResourcePool and dedicated tests/evidence.
- [x] Write and run failing tests for geometry identity, feet/seat references, distinct silhouettes, shared finite cache and animation normals.
- [x] Implement merged geometry for 7 templates and standing/seated/kneeling bases; shared CPU/GLSL animation.
- [x] Render and inspect real geometry front/side/back, day/night, small actions and walking; send files for approval.
- [ ] Obtain user C1 approval and complete the specific hairstyle image comparison before rollout.

## Task 2: World contracts and registered coverage
Owner: bind_character_world_content. Files data/characters, WorldAdapter/Schema/Patrol/Ceremony and dedicated tests/evidence.
- [x] Write and run failing tests for required 38, references, supports and segment sweep validation.
- [x] Bind concrete current architecture, lifecycle readiness and semantic seats.
- [x] Verify two return trips and arc-length followers, thin obstacles, wrong layers and unknown supports fail closed.

## Task 3: Manager and renderer
Owner: integration. Files CharacterManager/CharacterRenderer/CharacterBehavior/CharacterLOD and dedicated tests.
- [x] Write and run failing lifecycle/time/LOD/budget tests.
- [x] Implement bounded shared resources, instanced rendering, hierarchy-preserving vertex/normal animation, no castShadow until validated.
- [x] Integrate data API, prefer off-camera schedule changes and use a bounded two-second opaque coverage transition when still in view, cap resumed dt and prevent independent timers.
- [x] Test 20 switches/reloads, projection-aware aerial LOD, fixed mobile taihe 19, no raycast/network/collision ownership.

## Task 4: Small approved integration and verification
Owner: integration. main.js only import/construct/update/dispose; SettingsMenu switch/copy; PerfHUD read-only provider. Root approval received 02:31 UTC.
- [x] Record interface request, write failing UI and integration tests.
- [x] Preserve existing settings controls and rendering info reset boundary.
- [x] Run targeted tests, the exact 337-file R49 comparison inventory (not confused with the smaller current-state package command), build, zones, anchors. Record baseline failures without weakening tests.
- [x] Fresh independent review and counterexample fixes with regression tests. Two documented P2 issues remain: cold/rebind spikes and missing specific hairstyle image evidence.
- [x] Freeze report and evidence; produce an external commit/tree/file-hash manifest for the release owner. Remote upload remains a separate owner operation.

## Frozen checkpoint 03:18 UTC
Production code and tests: c560681c9731ffeb119b50530dc1120aa16ad33d. Clean-install P3C 77/77, R49 focused 183/183, build and zones passed; anchor check retains baseline failure. Same-inventory complete regression finished 03:39:59 UTC: 5277 / 5119 / 158, no added failure identities, one changed legacy SettingsMenu snapshot diagnostic. User C1 approval, chosen hairstyle image support, browser/GPU/mobile acceptance and cold-frame experience remain open. No mass rollout or Pages publication.
