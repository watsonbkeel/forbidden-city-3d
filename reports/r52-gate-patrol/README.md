# R52: three gate pairs and east patrol candidate

**Result: PASS, CPU/geometry scope only.** Baseline `aa606946fe37c045791fd511cb224007713c5e7c`, with the existing bounded-starvation CharacterSystem fix. This isolated candidate combines the unchanged original 38 actors with exactly nine approved additions. It does not modify the live registry or any production code.

## Integration payload

Append the four arrays in [registry-fragment.json](registry-fragment.json): **4 anchors, 4 surfaces, 1 path and 9 actors**. Every actor is required and uses the existing `guard-duty` template and schedule. No new template, custom transform, Jingyun experiment, building, collider, navigation, zone or main change is included.

Fragment SHA-256: `b547104cccb37b0809af97530059df6bcde6b1004194a98495f1ea7d3910a52b`.

The tests are baseline-candidate tests: run them at the pinned 38-person baseline, not against a registry that has already incorporated these nine. The integration owner must subsequently validate the combined R52 roster.

## Source-bound placement

| Pair | Real source frame | Local north / south positions | World north / south positions (x,z) |
|---|---|---|---|
| Donghua | `outer-east`, 东华门, `cityGate`, east | (-4.2,0,9) / (4.2,0,9) | (-356.8,-252.8) / (-356.8,-261.2) |
| Xihua | `outer-west`, 西华门, `cityGate`, west | (4.2,0,9) / (-4.2,0,9) | (351.5,-256.4) / (351.5,-264.8) |
| Longzong | `axis-courts`, 隆宗门, `gate`, west | (9.2,0,-10.8) / (-9.2,0,-10.8) | (121.5,182.9) / (121.5,164.5) |

The actual zone-item coordinates/rotations come from [outer-east](../../data/zones/outer-east.json), [outer-west](../../data/zones/outer-west.json) and [axis-courts](../../data/zones/axis-courts.json). The adapter resolves them rather than copying a guessed Layout transform: [CharacterWorldAdapter](../../src/scene/characters/CharacterWorldAdapter.js#L80).

For both Hua gates, the actual [EastWestCityGate profile](../../src/scene/palace/special/EastWestCityGate.js#L11) gives three portals centered at -8.4, 0, 8.4 with 5.5 m clear width. Posts sit beside the corridors, in front of the intervening piers. Minimum lateral clearance from a door-path edge is **1.45 m**, leaving **0.95 m** after the tested 0.5 m body-plus-margin radius. Longzong's actual [SideGateProfiles](../../src/scene/palace/special/SideGateProfiles.js#L32) yields **2.38 m** door-path clearance; the posts are also outside the ramps' ±7.6 m width and beyond the front toe. They do not obstruct passages. These are model-fit geometry claims, not surveyed or newly verified historical guard-post claims.

All nine ground positions were resolved against the actual [Environment ground](../../src/scene/Environment.js#L79), including support footprint and production colliders. No pre-resolved support or geometry removal is used.

## East Second Lane route

The named 东二长街 region in [east-six.json](../../data/zones/east-six.json) supplies the real region frame, centered at (-120.8,0,382.6). The shared path `east-second-lane-patrol` has local points `(0,0,-18.6) → (0,0,-0.6) → (2.5,0,7.4)`, yielding world points `(-120.8,0,364) → (-120.8,0,382) → (-118.3,0,390)`.

- One continuous same-zone path, **26.3815273 m**, **107 complete support samples**, maximum segment sampling interval 0.25 m.
- Existing west-patrol contract preserved exactly: **0.75 m/s**, **3 s** endpoint turning pauses, **1.4 m arc spacing**, formation size 3; source [PatrolController](../../src/scene/characters/PatrolController.js#L6).
- 0.38 m body radius + 0.12 m safety margin, 0.55 m turning disc. Production support and collision validation includes continuous sweeps between samples and both endpoint discs: [CharacterWorldAdapter](../../src/scene/characters/CharacterWorldAdapter.js#L277).
- Actual System motion covered **1,379 steps / 137.9 simulated seconds**, exceeding two 68.8840728-second cycles. Outbound, far-turn, return and near-turn were all observed. Maximum movement per 0.1-second step was 0.07500000000005 m; minimum Euclidean center spacing at the corner was 1.3839763 m (arc spacing remains 1.4 m).
- All consecutive 0.5 m radius / 1.85 m height body sweeps were clear. 291 sampled actual deformed LOD0 geometry envelopes stayed within radius 0.3729672 m and height 1.8080472 m. These sampled animation checks are supplemental to the conservative full-route body envelope.

## Actual rendering and lifecycle evidence

[The fixture](../../tests/lib/r52-gate-patrol-fixture.mjs) builds existing PalaceBuilder/Enclosure/GardenBuilder statics, actual Environment ground, actual CollisionManager, and all seven zones through real [ZoneManager](../../src/scene/zones/ZoneManager.js#L69) / ZoneBase. World totals: **23,253 colliders / 1,075 walkables**. It does not substitute a fabricated isolated character scene.

[The test](../../tests/r52-gate-patrol.test.mjs) observes actual Manager-selected IDs and actual Renderer instance buffers. It reconstructs the existing animation from those buffers and ray-tests the actual submitted triangles against scene geometry and other submitted characters. It does not equate a ready counter with visibility. Every target has submitted visibility 1. Unrelated fading actors are retained as conservative opaque occluders rather than ignored.

- Initial and final snapshots: **47 registered, 47 loaded, 0 pending, 0 errors**. Original registry remains byte-equivalent in memory.
- **19 legal viewpoints / 171 of 171 clear triangle targets**. All nine additions have 9/9 targets initially and again at night after the reloads. Camera positions have ground support and no 0.5 m body collision.
- **20 complete off/on + east-six unload/rebuild cycles**, each returning to 47/47 ready. Off clears submissions/batches. Unload removes patrol bindings/submissions; reload replaces the real group and increments generation. No duplicate IDs.
- Additional real, API-driven unload/rebuild/reentry for **outer-east, outer-west and axis-courts**, each followed by all-nine readiness; their subsequent night views prove fresh actual instances. This checks real ZoneManager generation callbacks, not browser navigation or proximity-streaming acceptance.
- Global **64/32** and near **2** limits remain unchanged and are checked on every update. Sources: [CharacterLOD](../../src/scene/characters/CharacterLOD.js#L3), [budget](../../src/scene/characters/CharacterLOD.js#L47).
- Collider/walkable totals remain unchanged after each rebuild. Shared geometry resources remain **27 / 2,948,910 bytes** through all 20 cycles. No timing/performance acceptance is inferred from this non-exclusive diagnostic run.

## Reproduction and frozen evidence

Successful commands, exit 0:

```sh
node --test tests/r52-gate-patrol-fragment.test.mjs tests/r52-submission-visibility.test.mjs tests/r52-submission-batch-key.test.mjs
node tests/r52-gate-patrol.test.mjs
python scripts/r52-gate-patrol-raster.py reports/r52-gate-patrol/east-patrol-after-20-reloads.json.gz reports/r52-gate-patrol/east-patrol-after-20-reloads.png
```

**Six focused unit tests passed.** Full-run log: [verification.log](verification.log). Concise machine-readable findings: [summary.json](summary.json). The complete report is retained losslessly as `verification.json.gz`; full motion samples are `motion-rows.json.gz`. [artifact-manifest.json](artifact-manifest.json) freezes the actual sources and evidence hashes. The System source SHA-256 is `0e5764c8ac4b5417e5c4e2ab2b2d45876323da99b0f59c9a12fe9d7ea9be22a3`.

All ten PNGs and small raster summaries are retained. Four representative scene-triangle exports are kept losslessly: Donghua north, Xihua south, Longzong south and the east patrol after 20 reloads. The other six regenerable triangle exports and obsolete raw probe/motion/report dumps are excluded from this small freeze; their generated hashes are recorded in the manifest. Running the full test recreates all ten exports.

Visual review of those four representative final-run PNGs confirms unobscured full bodies, gates beside rather than behind the target bodies, and three distinct patrol members. PNG labels explicitly identify CPU perspective z-buffer rendering from actual scene + Renderer data. Base/vertex colors only: **textures, runtime lighting and shadows are not reproduced**. No browser, GPU, mobile or complete-history acceptance is claimed. Existing appearance is reused; production content approval flags are not changed.

Two strengthened-run diagnostic failures are preserved as compressed red logs/reports/harnesses: (1) an over-strict full-fade assertion on a non-target original actor; (2) a hard-coded standard batch key for non-target original seated variants. The diagnostic now uses [the exact production geometry options](../../src/scene/characters/CharacterGeometryOptions.js) for all batch lookups and tests that mapping with the actual Renderer across all 47 actors. Targets still require full fade-in, and non-target occluders remain conservative. Both failures were in the evidence helper, not the candidate registry or production source; the complete corrected run was then rerun successfully.
