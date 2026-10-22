# R50 independent review

Final independent code-review checkpoint: 2026-10-22 03:28 UTC. Reviewed candidate: `c560681c9731ffeb119b50530dc1120aa16ad33d`, based on `92cf31ec1779d0d6266a2caa6ad1708c379d1500`. Exact candidate archive passed the final checks below; all 1,178 captured source/test inputs were unchanged afterward. No additional functional defect was found. Two P2 findings remain open: cold/rebind CPU spikes and missing image-based support for the female hairstyle. C1/browser/GPU/device acceptance also remains open. The owner is still running the complete 337-file legacy comparison; this report does not pre-announce its result.

## Verdict and release boundaries

The integrated system has real Three.js instanced rendering and a configured, physically validated 38-character minimum. Independent CPU execution exercised the production CharacterSystem, Manager, Renderer, actual retained architecture, and production ZoneManager unload/load methods. It is not merely a registry or mocked renderer.

**C1 visual approval, browser/WebGL compilation, complete-frame GPU A/B performance, and real-mobile acceptance remain unverified.** The release gate correctly remains `CHARACTER_ROLLOUT_APPROVED = false` (`src/scene/characters/CharacterSystem.js:10–12`). The normal app therefore registers 38 but does not mass-display them; independent tests explicitly inject approval. The settings UI distinguishes this from an enabled/approved scene. No desktop-browser validation or full first-version completion is claimed.

The reviewer changed only `reports/r50/baseline-*` and this report. Production and old tests were not altered, and browser restrictions were not retried or bypassed. All independent final checks used a git-archive of the exact candidate and existing installed dependencies. The owner additionally verified clean lockfile installation; those separate results are attributed below.

## Fresh baseline, not assumed green

- Immutable baseline commit: `92cf31ec1779d0d6266a2caa6ad1708c379d1500`. All 1,136 captured source/test/input files retain their original hashes.
- Exact `npm run test:current-state`: 85 files, **1,068 tests / 952 pass / 116 fail**, exit 1.
- R49-comparable inventory: 337 unchanged files, one complete serial run, **5,277 / 5,119 / 158**, exit 1, 1,354,463.357 ms, ended 03:09:53 UTC. This single-run result supersedes the earlier parallel run with two SIGKILL placeholders. Both interrupted logs and the successful 74-test focused retry remain preserved.
- Baseline build: exit 0, 240 modules, existing chunk-size warning. Zones: 7 files / 0 errors / 20 warnings; 23,253 colliders and 1,075 walkables. Anchors: exit 1; existing Shenwu Gate z difference 11 m exceeds 5 m, plus Qian Dong Wu Suo gate/group mismatch not compared.
- Evidence: `baseline-summary.json`, `baseline-review.md`, `baseline-full-sequential.tap`, matching command records and manifest.
- Final implementation's same-inventory comparison is owned by the integration owner and has not yet completed at this checkpoint. Existing 158 failures cannot be described as a green suite.

## Open findings / acceptance blockers

### P2: synchronous cold and zone-rebind work still stalls the approved scene

`CharacterWorldAdapter.js:59–79,118–135,170–187` performs repeated bounded support rays and collider sweeps during synchronous binding; `CharacterManager.js:72–74` invokes this from the frame update. With actual retained architecture, the initial version independently measured 487 ms cold and 20 zone-reload character-update calls with median 438.70 ms / maximum 503.13 ms. These exclude the pre-existing ZoneBase rebuild, which is logged separately.

The first 32 m mesh-grid optimization retained correctness but did not solve the cost. Its 20-cycle run measured cold 566.77 ms and reload median 389.35 ms / maximum 573.13 ms. A later, distinct fix stopped unrelated west-six load/unload from invalidating static actors: an intermediate focused profile measured unload 0.690 ms, but cold 501.16 ms and reload 342.38 ms.

Inclusive profile evidence locates the real cost: cold supportAt 288.25 ms, of which `Raycaster.intersectObjects` consumed 273.24 ms across 939 calls; collider sweeping consumed 132.98 ms. Kit resource acquisition was only 13.87 ms; initial mesh-index construction was small. Profiling totals are inclusive, so they must not be summed as disjoint components. Future optimization must preserve actual short-ray support, full route sampling and body-radius clearance rather than weaken tests.

The frozen candidate includes exact-layer short-circuiting and collider-grid filtering. Final independent whole-System evidence: **cold 443.68 ms; 20 reload updates median 269.47 ms / maximum 323.16 ms; unload median 0.309 ms / maximum 0.633 ms**. Concurrent legacy regression and new-suite CPU work can influence timings; this is not a controlled hardware A/B. Nevertheless the large synchronous binding work remains a real open P2 risk. It is not paid in normal gated mode before C1 approval. Warm p95 0.379 ms does not close it.

Evidence: `baseline-independent-final-integration-results.json`, the earlier `baseline-independent-integration*.json` and `baseline-independent-cold-profile-v2.json` / `-v3.json`, with timestamped immutable-input manifests. A later ground-priority experiment exists only outside the candidate: the World owner reported fresh-Adapter medians 241.79 → 117.73 ms with identical 954 support queries plus five hole/layer probes. That is a future candidate idea, not shipped code, not this whole-System measurement, and not an accepted performance result.

### P2: required Qianlong-period hairstyle image support is still missing

Spec §3.2 requires a selected Qianlong-period image supporting the female hairstyle. `CharacterKit.js:12–13,100–103` uses a small dressed/simple bun; the owner confirmed no image-to-model visual comparison was completed. H4 evolution text does not establish this exact bun. `c1-samples/README.md:74` and `c1-samples/history-reference/hairstyle-evidence-card.md` now explicitly retain that gap. Catalog dates, anonymity, avoiding late-Qing winged hair and an interpretation label cannot replace the required image evidence. C-A15 remains partially unverified, the rollout gate remains closed, and the failed image access was not bypassed.

### C1 visual acceptance remains a release blocker, not a test failure to hide

The CPU sample sheets show procedural geometry, not a browser render. Initial raised-footstool emperor geometry had physically supported feet but an implausibly extended sitting pose; the sample owner rejected that visual result. The final front-perch candidate uses a visibly bent-knee pose; the reviewer inspected the actual-palace front/side/oblique CPU sheet and found a clear improvement over the rejected horizontal-leg pose. The sample owner preserved the rejected image and recorded matching actor/Kit/furniture/seat source hashes. Numeric contact success and internal visual improvement are not user style approval. Only the user's concrete C1 review can permit mass rollout.

### Browser/GPU and device evidence remains unavailable

No actual shader compilation, rendered normal/shadow comparison, full-frame calls/triangles A/B, frame median/p95 comparison, browser input acceptance, or real-mobile run occurred. Existing socket EPERM/bwrap restrictions were honored, with no Chromium retry, alternate bypass or prohibited session-file read. CPU costs and CPU raster images must not be relabeled GPU or desktop-browser acceptance.

## Closed findings with independent counterexamples

| Original severity | Defect found | Resolution and independent evidence |
|---|---|---|
| P1 | Old async zone result could respawn an actor after unload; off/on could retain a never-finishing request | Manager request identity + generation + adapter revision checks, and off/reset clearing; `baseline-independent-fixed-core-probes.json`. Current code `CharacterManager.js:23–29,38–59`. |
| P1 | Low-tier six officers per side were chosen from current visible candidates, silently replacing a hidden fixed member | Choose the stable cohort from the complete registry, then intersect visible candidates; actual low scene is 19 Taihe + 13 others, and cropped-camera counterexample no longer swaps members. `CharacterLOD.js:32–44`; same probe plus integration results. |
| P1 | A new binding revision reused the old patrol controller and old path geometry | Dispose/reset the controller on revision, off and dispose; remove System path-controller cache. Factory called twice and new revision's position used. `CharacterManager.js:27,40,80–83,109–111`; `baseline-independent-lifecycle-fixed.json`. |
| P2 | Camera inside the head still rendered a hollow close-up because only body-center distance was checked | Body-axis distance hides the representation within 0.4 m without moving the actor or adding player collision. `CharacterLOD.js:12–24`; camera `(0,1.57,.08)` now culled in fixed-core probe. |
| P2 | World support/path caches grew on each generation | Maps now replace each actor/path ID's current generation rather than append generation keys. Twenty actual zone cycles retain 38 binding entries and 2 path entries; standalone probe retains 1/1. `CharacterWorldAdapter.js:138,147,172,187`. |
| P2 | Runtime walking amplitude 0.7 scaled stance translation but not root travel, producing 6.75 cm foot slide over 0.30 s | Physical stance/root compensation no longer scales with ambient amplitude; CPU also accepts production poseIndex. Independent same probe drift is effectively zero. `CharacterAnimation.js:12,18,41`; `baseline-independent-walk-slip-probe.json` records the original failure and lifecycle-fixed evidence records closure. |
| P2 | Static radius 0.32 m was smaller than actual template half-width ~0.37 m | Static support and body clearance use 0.4 m. `CharacterWorldAdapter.js:143`; all required actual-world bindings resolve with the larger envelope. |
| P2 | Settings said characters were on while hard visual gate blocked every actor | Explicit approval flag and “待视觉确认 / 尚未批量显示” notice. `SettingsMenu.js:16–23,118–119,251–254`; `main.js:363–365`; independent existing UI/input/tour tests remain green. |

## Independent integrated CPU evidence

The final **c560681** archive independently passed all nine new test files: **77 / 77**, exit 0, 16,092.893 ms (`baseline-independent-final-p3c.tap`). This includes real retained-world support, two route roundtrips, independent full-ray comparison, and twenty actual S-layer interior swaps. The separate, independently authored full-System audit also passed:

- 38 logical required actors resolve and submit 38 distinct real InstancedMesh instances under a fitted camera. The initial wider camera legitimately saw only 36; the harness was corrected rather than lowering expected coverage.
- High fitted-camera submission: 9 batches, 16,830 triangle estimate at LOD2. Low: 32 instances, exactly 19 Taihe (six officers each side) + 13 others; 14,154 estimated triangles; no LOD0 on low. These are CPU submission estimates, not complete-frame rendered deltas.
- Real production ZoneManager unload/load methods invoked twenty times, with twenty off/on cycles. Unload retains 29 loaded and 9 pending, with no west-six instances; reload restores all 38. Off clears render batches and references, and simulation time does not advance. No duplicate IDs. Pool stabilizes at 10 entries / 9 references; support and path caches remain 38 / 2.
- Player collider hash, collider count 23,253 and walkable count 1,075 are unchanged after twenty cycles. Characters never register player colliders or map/treasure raycast targets.
- In-view night transition starts at visibility 0.95 and fades over two seconds; only nine guard-duty actors remain, not an all-night court. Hidden-page 30-second interval and first resumed frame advance simulation by zero; following 16 ms frame advances correctly.
- Six hundred final warm updates: CPU p50 **0.187 ms / p95 0.379 ms**. Concurrent candidate legacy-regression and independent P3C test workloads are disclosed. These numbers do not close the cold-frame finding or C-A10 GPU acceptance.
- Double dispose leaves zero listeners, zero shared resources/references, no meshes and detached character root.

The real Manager/Renderer then ran **133.684 simulation seconds, 1,337 frames and 5,348 actor-position checks**: the three guards each completed two roundtrips and the shorter stroll completed 3.208. Every movement segment retained body clearance and support error ≤3 cm; minimum patrol-member separation was 1.3714 m. High/low close cameras at the emperor, officials, patrol and Chuxiu seat, plus an overhead camera, retained unique instance IDs, finite bounds and tier budgets. Camera 0.08 m horizontally from a guard head culled that representation without changing logical position. These are camera-matrix/CPU checks, not rendered screenshots or actual helicopter operation. A reported `near` count is LOD0 count, not independent complex-node characters; the latter remains zero.

Evidence: `baseline-independent-final-integration-results.json` and `.log`, `baseline-independent-final-input.json`, `baseline-independent-final-input-verification.json`, and the reproducible `baseline-independent-final-audit.mjs` harness (copy to the archive root before running). All 1,178 captured input hashes remained unchanged after execution; live source/data/old-test paths also matched c560681. Earlier harness-only errors (missing Node window, initial camera fit) remain preserved separately and are not production failures.

## Shader, postprocessing and integration inspection

- Tested injection against installed Three r162 `ShaderLib.standard`: deformation modifies local position and object normal after `beginnormal_vertex` and before `defaultnormal_vertex` / instance normal transforms; `begin_vertex` uses that modified position. Opaque fragment dither is inserted after clipping. This proves hook placement, not GPU compilation. `CharacterRenderer.js:16–26`; `CharacterAnimation.js:27–50`.
- Actual application uses `DepthSSAOPass`, not an independent scene-normal override. `src/render/PostProcessing.js:4,53`; `DepthSSAOPass.js:7–28,35`: normals are reconstructed from main-pass depth and renderOverride is empty. This avoids an override shader silently reverting character deformation.
- Global BatchedBuilder explicitly skips InstancedMesh objects (`src/render/BatchedBuilder.js:104–109`), and the actual collect() probe excludes the character batches.
- Characters have `castShadow=false`, `receiveShadow=true`; there is no new shadow draw pass. Their correct reception under real lighting remains visual/GPU work.
- Main creates one system after real zones/interiors, updates after both using actual camera/daylight/current quality/viewport height, disposes it before world teardown, and only adds provider/toggle hooks. `main.js:183,193,363–365,569,590`.
- No extra renderer.info reset, per-character RAF/timer, audio, network/multiplayer NPC traffic, blocking collider, interactive raycast or frozen building edit was introduced. Buffer clones isolate zone disposal while a finite immutable geometry cache is shared.

## Existing UI and main regression checks

- Independent old Settings/input/tour plus new UI suite: 41 / 41 pass (`baseline-independent-ui-regression.tap`).
- Focused actual-main R34 tour / R36 helicopter plus V9 guard command: 17 tests / 16 pass / 1 existing V9 Settings exact-byte guard fail (`baseline-independent-main-regression.tap`). The failing name already occurs in the baseline's 158 failures.
- Nine additional historical source-guard files ran identically on frozen baseline and current implementation: both 87 / 74 / 13, identical failure identities. Most are outside the 337-file direct-current inventory, so absence from that inventory is not a newly failing test. `baseline-independent-source-guard-diff.json`.
- Old tests and byte fixtures were not weakened or updated to make these guards green. Exact historical-byte failures must be distinguished from runtime behavior regressions; final full-inventory comparison is still required.

## Final build and inherited-gate observations

The reviewer also independently ran the exact candidate's build to `/tmp/fc-r50-independent-build-c560681`: exit 0, final JS 2,887.45 kB / gzip 872.22 kB and the existing chunk-size warning. Zones again exit 0 with zero errors / twenty warnings; anchors again exit 1 with the same Shenwu 11 m issue and kind mismatch. Logs and exact command/time/exit records are `baseline-independent-final-{build,zones,anchors}*`.

The integration owner's separate clean `npm ci --ignore-scripts --include=dev --no-audit --no-fund` evidence confirms @napi-rs/canvas 0.1.100 is QA-only, production dependencies/scripts and existing lock-entry versions did not change, and production source imports no Canvas package (`qa-dependency-verification.json`). Its clean-install standard commands and the R49 targeted 183/183 suite also reached terminal results (`candidate-standard-commands.json`, `candidate-r49-focused.txt`). These are owner-provided results, not relabeled as the reviewer's clean-install execution.

## Acceptance matrix at this checkpoint

| Item | Status / evidence boundary |
|---|---|
| C-A01 configuration and required references | CPU checked: configured 38, actual support ready 38 under test approval; normal production rollout gated. |
| C-A02 three poses | CPU views exist; revised seat CPU sheet reviewed; user style approval pending; browser view unverified. |
| C-A03 multilevel placement | Actual architecture support and bounded rays inspected/CPU tested; no wall-walk claimed. |
| C-A04 static/seat contact | Numeric support, seat/whole-shoe tests available; full visual penetration acceptance pending. |
| C-A05 two route roundtrips | Final independent 77-test suite and separate Manager 133.684-second replay pass the numeric route/clearance checks; visual foot motion in browser remains unverified. |
| C-A06 ceremony | Waiting-only shared phase; formal ritual deliberately deferred, not passed. |
| C-A07 LOD/protagonist | Stable low cohort and close-camera CPU counterexamples closed; real camera visual popping unverified. |
| C-A08 region lifecycle | Final c560681 independent real ZoneManager 20 unload/load + 20 off/on cycles pass; actual browser streaming route remains unverified. |
| C-A09 resources/background | CPU reference/cache/listener/30-second resume checks pass; browser memory not measured. |
| C-A10 frame/performance | Not accepted: cold binding stall plus no complete-frame GPU/hardware A/B. |
| C-A11 day/night/shadow | CPU night scheduling/dither source checked, shadows cast off; real lighting/shader output unverified. |
| C-A12 helicopter | Existing runtime lifecycle tests pass and no parking intrusion in route validation; browser operation/overview pending. |
| C-A13 map/treasure | Noninteractive NPC source and existing input tests checked; browser hit-testing/readability pending. |
| C-A14 earlier building fixes | Buildings untouched; owner clean-install R49 targeted 183/183 pass, full old-inventory diff pending, visual reconfirmation unavailable. |
| C-A15 historical evidence | Partial only. Anonymous labels and interpretation boundaries are explicit, but spec §3.2 selected-image support for the actual female hairstyle is missing; see open P2 and the hairstyle evidence card. |
| C-A16 off/rollback | Off/disposal verified on c560681; baseline commit 92cf31ec retained. Publication/rollback instructions belong to owner; no reviewer upload. |

Formal ceremonial excerpt, foreign envoys and wall patrol are explicitly deferred. No “8/8 gate,” desktop-browser pass, GPU pass or complete cross-platform acceptance is claimed.

## Integration-owner terminal regression addendum, 03:41 UTC

After the independent review checkpoint, the exact frozen candidate finished its 337-file serial run at 03:39:59 UTC: 5277 tests / 5119 pass / 158 fail, exit1. The owner comparator found no added or removed failure identities; 157 normalized failure diagnostics match, while the already-failing V9 SettingsMenu byte-snapshot actual hash changes with the authorized character UI addition. Full differences are preserved in candidate-regression-comparison.json. This addendum does not change the independent reviewer’s open C1, hairstyle, cold-frame or browser/GPU findings.
