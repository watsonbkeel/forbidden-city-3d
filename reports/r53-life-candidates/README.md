# R53 household candidates, frozen-R52 evidence only

The additive fragment contains exactly six required anonymous roles. Composing it with the unchanged frozen R52 registry validates 77 required logical actors without changing the original 71 records, the original required IDs, the R52 additional-33 coverage, seven templates, runtime limits, or runtime/architecture code. It is **not integrated or deployed** by this commit.

Frozen source: `2a7c6fd09086e6b73c0745aa7cfca4534bbfd9a6`.
Original71 canonical actor SHA256: `bc42abd8b0fcd448d95eb72b95577c97992acd93f95845301229d960c7013098`.

## Candidate bindings

All positions are model coordinates in meters, not surveyed historical positions. Heights below are actual rendered support heights. The declared .62/.61/0 layers use 1 mm binding tolerance; no position offsets conceal a mismatched support.

| ID | Template | Binding / world coordinates | Visible support |
| --- | --- | --- | --- |
| xianfu-eunuch-01 | eunuch-daily | Standing `[154.8, .620000005, 427.3]` | west-six_kit_floor_flat |
| xianfu-maid-01 | maid-daily | 6 m route `[145.8, 0, 418.3]` to `[151.8, 0, 418.3]` | ground_brick |
| taiji-maid-01 | maid-daily | Standing `[145.2, .610000014, 323.65]` | west-six_stone_slab |
| taiji-eunuch-01 | eunuch-daily | 5 m route `[151.2, 0, 315.9]` to `[156.2, 0, 315.9]` | ground_brick |
| jingyang-eunuch-01 | eunuch-daily | Standing `[-154.5, .620000005, 429.2]` | east-six_kit_floor_flat |
| jingyang-eunuch-02 | eunuch-daily | 6 m route `[-152.5, 0, 420.2]` to `[-146.5, 0, 420.2]` | ground_brick |

Seeds are 53001–53006 in the order above. Walking is .4 m/s with 3-second endpoint turns; female hand geometry follows the existing route identity, including pauses. Male inner attendants retain the existing Kit front-held hand posture and existing walking animation. No clothing, props, role types, ceremonies or gesture system is added.

## Actual-world evidence

`candidate-world-proof.json.gz`, validated by its neighboring manifest, contains:

- One production world with 23,769 colliders, 1,092 walkables and all seven actual zones. All 77 bindings become ready through the real CharacterSystem/Manager/Renderer. The original71 are retained, not culled from the registry to make candidate checks pass.
- 202 before/after source fingerprints, unchanged throughout proof.
- Each of the six required target IDs has one submitted instance and 9/9 unobstructed in-frustum actual deformed-triangle rays in its high, low and reloaded views. There are 21 individual samples including the three motion-start samples. This is not a claim that all77 are simultaneously visible.
- Every sample preserves high64/low32/near2 limits and unique submitted IDs.
- All three routes have <=.25 m sampling: 25, 21 and 25 positions, respectively. Each validates a .5 m body radius plus .15 m margin, 17 actual visible-support probes per position, actual collider sweep and .7 m endpoint turn discs. All three standing posts receive the same .65 m support/clearance check.
- All three LODs over 24 deformation phases fit the .5 m body envelope. Maximum measured radius is below .377 m and height below 1.772 m.
- Conservative all-phase swept-path distances include every other original/new actor, not just visible actors. The closest pair is at least 9.2195 m apart, with .25 m sampling uncertainty explicitly retained, well beyond the 1.3 m combined clearance envelope. Real trees and opened doors remain in the scene/collider set.
- Real System playback runs at .1-second steps for at least two full cycles: 721 / 621 / 721 actual submitted frames, cycle lengths 36 / 31 / 36 seconds. Maximum movement per frame is .04 m. All outbound/return/near-turn/far-turn stages have visible target triangle evidence. Existing hand-geometry batch identity is stable across movement/turns.
- Actual per-instance GPU attributes are CPU-deformed for feet on every motion frame. At least one foot remains grounded; no penetration occurs; maximum swing lift is .064967 m. Each route has 120 sampled turn frames with both feet grounded. Standing posts require both soles within 1 mm of the first visible surface beneath the sole.
- Night fade, Off/On, zone unload/reload and pending preparation interrupted by generation changes pass. Both affected zones keep unique logical actors and restore all candidate submissions without collider/walkable duplication.

The six PNGs are inspected CPU perspective z-buffer renders of actual scene geometry and submitted instance buffers. Their JSON files retain camera/export metadata and pixel counts. The images are deliberately labeled: no browser/WebGL screenshot, runtime textures, lighting, shadows, mobile or GPU-performance acceptance is claimed. Raw regenerable triangle exports stay in `/tmp`, not Git.

## Diagnostics retained, not hidden

`rejected-walking-contact-contract.json.gz` records the first failed proof that incorrectly required both feet to touch while walking. The existing animation intentionally lifts a swing foot up to .065 m; the corrected contract requires one planted foot and a bounded nonpenetrating swing foot, not arbitrary hovering. Focused negative tests reject both-feet hover, stationary hover, penetration and excessive swing lift. Final motion evidence includes actual stream phase/amplitude/speed/pose/time at each stage and full-cycle foot statistics.

`rejected-taiji-lower-layer.json.gz` records the later valid rejection of the .60 m brick/platform binding. Actual sole rays hit the overlying visible stone slab at .610000014 m, exposing 10 mm penetration. The fragment now binds the stone-slab layer at .61 m, with the same 1 mm tolerance, not a model-position offset. All 17 .65 m footprint probes independently hit that stone slab.

One earlier retained probe process exited137 before final proof began. Its cause is unknown, not diagnosed as OOM. The successful retained process reported approximately 768 MB RSS after the focused stone-layer probe and 1.96 GB after complete proof. These are diagnostic observations, not performance acceptance. The final corrected proof reused the world after the rejected-layer diagnostic instead of rebuilding it again.

## Historical interpretation boundary

- [Xianfu](https://www.dpm.org.cn/explore/building/236507.html): the museum states occasional imperial use during Qianlong. This does not establish these two staff, their locations or a named occupant.
- [Taiji](https://www.dpm.org.cn/explore/building/236475.html): current domestic original-state exhibit and late-Qing/early-Republic ceiling are distinct from the switchable anonymous character interpretation.
- [Jingyang](https://www.dpm.org.cn/explore/building/236511.html): Qing book-storage context is not a Qing consort residence. There is no consort, book prop or invented archive procedure.

The existing generic staff evidence and templates are reused. Sources support contextual distinctions, not exact staff counts, attire, positions, routes, schedules or current exhibit occupants. No one is placed in the R53 Yangxin/Shoukang developing rooms.

## Reproduction and integration

Run `node --test tests/r53-life-candidates-fragment.test.mjs tests/r53-life-contact.test.mjs` for focused content/contact contracts.

Run `node --max-old-space-size=3000 tests/r53-life-candidates-world.mjs` from the candidate tree for full frozen-R52 candidate evidence. The runner writes a compressed report and manifest under this folder; geometry exports remain in `/tmp/r53-life-candidates-geometry`. Render an export using `python tests/lib/r53-life-raster.py <export.json.gz> <output.png>`.

`lifeCandidateViews()` in `tests/lib/r53-life-candidates.mjs` exposes the six source-frame view definitions for the owner's integrated proof. The owner must merge actors/anchors/surfaces/paths/evidence additively, add R53 coverage separately, and rerun all77 plus these support/view/lifecycle checks after final R53 architecture is integrated. This candidate-only proof is not a substitute for that final validation, historical review, browser/GPU/mobile checks or publication acceptance.

## Test scope and additional aggregate result

The targeted candidate/R52 regression run is **14 passed, 0 failed** (`focused-tests.log`). The candidate full-world proof is successful, with all six candidate bindings and all three routes passing.

An extra serial `node --test --test-concurrency=1 tests/current-state/*.test.mjs` aggregate was also started. It completed at 10:29:15 UTC on 2026-10-22 with **952 passed, 116 failed, 0 cancelled, 0 skipped, 1068 total**, before the owner's later stop instruction. The stop attempt returned the already-finished exit1 result; it was not an active termination and is not labeled as one. Its unmodified output is retained as `current-state-tests.log.gz`. The output includes failing epoch/source-retention expectations. No same-command frozen-R52 baseline comparison was performed, so this report does not attribute all 116 failures to the baseline. No tracked production or previous test/evidence files were changed here; those failures were not repaired, waived or used to weaken coverage. No second aggregate or new world was run to investigate their origin. This delivery makes no all-repository-green claim.

Final packaging changed only proof-output serialization from plain JSON to gzip plus a checksum manifest; it did not change the successfully executed geometric checks. The compression round-trip and all202 current source hashes were checked. No final integrated R53, browser, GPU or mobile acceptance is asserted.
