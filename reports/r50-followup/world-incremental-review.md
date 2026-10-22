# R50 incremental world-query review

Status: latest production-owner-executed oracle and 20-cycle regression results have been independently checked against their saved logs and current source hashes. All 38 bindings agree with the frozen reference, and the 27-test regression file passes without skips. This is CPU geometry/lifecycle evidence, not GPU or visual acceptance, and not a claim that the inherited full regression suite (including the previously reported 158 failures) is green.

## Execution provenance and current evidence

The original reviewer authored the independent comparison script and regression file and personally ran earlier versions, including the initial red cases and the earlier 3-cycle, 27/27 run. The implementation owner subsequently added physical support proofs and synchronous read scopes, changed both lifecycle loops from 3 to 20, and executed the latest heavy runs. The reviewer did not personally rerun those latest large-world jobs. On 2026-10-22 at 04:53 UTC, the reviewer performed only lightweight read/hash checks and updated this Markdown report; no test, production, or frozen-source file was changed in this closing pass.

Current evidence is:

Storage revision: the JSON is published as `world-incremental-review.json.gz`; all `.tap` / `.log` files below are published as same-name `.gz`. Original filenames and hashes in the historical audit identify the decompressed bytes. `report-packaging-manifest.json` and `publication-evidence-manifest.json` record the reversible mappings; this changes packaging, not the audited runs.

- world-incremental-review.json and world-oracle-final.log: the owner ran the existing independent oracle script. Every field present in the final stdout log matches the corresponding JSON field. The JSON records matching sourceInput/sourceOutput hashes for all five production files, and those hashes match the current files.
- world-regression-final20.tap: 27 tests, 27 passes, 0 failures, 0 skips, approximately 7.38 seconds. The current test source contains exactly two cycle<20 loops: actual Taihe B/S/B transitions and actual System disable/enable transitions. Execution of this latest 20-cycle run is attributed to the owner; the log does not independently embed a production-source manifest.
- work-bounds-review.md: a separate reviewer documents 29/29 lightweight proof/work-bound cases and 53/53 when combined with existing world/incremental tests, with the same current production hashes. That review is separate evidence, not a run performed by this reviewer and not an additional full-palace performance measurement.

The earlier world-incremental-review-final.tap, world-incremental-review-fixes.tap, and red/working files are historical evidence. The earlier adapter hash 0a53fa6908013547168203292a12b887885be08930fec7cc1bc772b0243dbf15 is superseded; it is not presented as evidence for the current implementation.

## Independent reference and comparison method

The reference is the original CharacterWorldAdapter module imported from the read-only frozen r50-character-system worktree, commit 5495e2acb42924a27e2d5c07eda5a8ff0944464c. The script verifies that this reference file exactly matches git show HEAD before using it.

The frozen adapter, candidate synchronous drain, and candidate queued resolver receive the exact same actual scene and collision manager from tests/p3c-world-fixture.mjs. Opaque mesh IDs are remapped through each adapter's WeakMap to the exact same real THREE object; IDs are not merely removed or treated as interchangeable. Nonphysical validationGeneration strings are omitted from structural equality, while generation behavior is separately exercised by lifecycle tests.

## Latest real-world findings

- All three modes resolve 38 of 38 actors to ready, with identical physical bindings.
- Both actual chair/kang seat bindings use Kit pelvis, contact, and foot metrics. These metrics match the frozen original Kit module exactly despite cosmetic changes.
- Two actual routes contain 104 and 44 samples, totaling 148. Route coordinates, sampling, lengths, and physical results match the frozen reference.
- During actor binding, each implementation performs 954 support queries. Arguments and normalized physical support results match exactly.
- After the script explicitly queries the two paths again, cumulative counts are frozen 954, candidate synchronous 1714, and candidate incremental 1714. The frozen adapter reuses its path cache while the candidate performs additional validation under its distinct request context. The script compares the returned paths and finds no physical difference. It would be incorrect to report that all three implementations performed 1714 queries or that the post-query traces have equal counts.
- 796 distinct rendered-support probes are independently checked by full THREE raycast against their actual owning mesh. Coordinates, normal, face material, material side, source groups, and drawRange are recorded.
- The final differences array is empty. Collision/walkable data and source material side, groups, and drawRange remain unchanged.

## Defects reproduced in the original review

Historical red evidence is preserved in world-incremental-review-red.tap. Production fixes were made by the implementation owner, not this reviewer.

1. Sliced multi-material hits lost face.materialIndex because the proxy used a scalar material. Twelve indexed/nonindexed and unaligned drawRange/group cases exposed the metadata mismatch; physical coordinates, normals, and triangle indices already agreed. The original group material index is now restored.
2. bodyHeightMeters affected the cache key but was not passed to collision checks. A 2.1 m actor incorrectly passed a 1.8 m beam. Positive finite height is now checked and used for initial, segment, and turnaround clearance.
3. A changed pose for the same actor ID deduplicated to an old pending promise. Queue identity now includes actor revision, with current-revision checks.
4. A stale request could return pending after publishing ready actor/path caches. A mid-route surface change reproduced mixed-layer cached evidence. Actor/path specifications are checked before commit, and stale rejection clears associated caches.

The latest saved 27/27 run still includes these regressions and all corresponding positive/negative geometry cases.

## Later production changes and separate review

The current source additionally records actual support owners and their ancestor, geometry, material, and draw-range state before triangle queries, retains the original snapshots, and verifies them again before publication. Relevant physical changes advance actor-local physical epochs and invalidate affected bindings/routes. Stale rejection and query exceptions clear unusable spatial indexes to permit a fresh recovery request.

CharacterSystem shares read-only revision snapshots only within one synchronous manager traversal. endReadFrame runs in finally before resumable queue advance, including exceptional cleanup. The currently configured high- and low-quality preparation budgets are both 1 ms, with manager/render-submission time deducted before queue work.

These changes were inspected read-only here and are covered in detail by the separate work-bounds review. Its scope is bounded dependency tracking, not arbitrary Three.js mutation detection: same-length in-place collider/walkable edits, raw geometry-array edits without attribute version updates, and other unobserved mutations still require explicit invalidation or an authoritative mutation signal. No broader automatic invalidation guarantee is claimed.

## Latest regression coverage

- Indexed/nonindexed geometry; single/multiple materials; FrontSide, BackSide, DoubleSide; draw starts 0, 1, 2, 767, 768, 769; unaligned group/drawRange boundaries; transformed geometry; immutable source material/group/range state.
- Exact declared-layer support preferred over nearer off-layer support, within one mesh and across separate meshes.
- Holes, thin walls between samples, wrong-level support, height/radius changes, mutable surface definitions, explicit cancellation, and paused zone unload/reload.
- 20 actual Taihe B/S/B cycles: paused queries cancel on replacement, and completed queries use only the live fine-interior or fallback support owner.
- Real System preparation, hidden cancellation, paused world-version change, resume without a 30-second simulation catch-up, and 20 disable/enable cycles. Assertions retain 38 unique logical IDs, visible/render-copy/instance-count agreement, one pool reference per batch, zero live batches/references when disabled, and resource cleanup on disposal.

## Current source snapshot

- Frozen adapter SHA-256: c4791febf937df39d3baeac3c5816751f7c237306503204195165fc1fd0302cd.
- CharacterWorldAdapter SHA-256: ccb552b78fbec725d7241c2a8d795b97a7e4cc2c9b32f25473ff833dafb42829.
- CharacterWorkQueue SHA-256: 2e5e2d24c746647123bf6a20b9c169fe062e4a3db5cc28f86a0c531e304ad7b2.
- CharacterSystem SHA-256: 88fcb1978862601d7e539c788fb13c7b28e442a78b2f924c6554fe0c21a969fa.
- CharacterResourcePool SHA-256: 161787370bf9e4e9c9206d60caff8a29e6735e26d9311a72f5e6d96d2fc69aa0.
- CharacterKit SHA-256: 1bdcf7f5df6a55a82fc6b9074a0bdb5131e9792fbb1d04f97a6550baecdfbd8c.

## Evidence artifact hashes

These hashes identify the files read during this closing check; they are not invented source-at-execution attestations for the TAP log.

- reports/r50-followup/world-incremental-review.json: 02cb19752eb9d1db6740612bdc612a3afe639cbfeaa1439d025ed165b5bb6d4b.
- reports/r50-followup/world-oracle-final.log: 24b1ee1c1f69bbd8aebf4f595931cacad1205be4151fbe7cfd5406fbdc4de0e1.
- reports/r50-followup/world-regression-final20.tap: 51a57bf0e948e33513e4565a1e25dee4b3351475cef754c25f7cda4e9f8af803.
- tests/p3c-incremental-world-regression.test.mjs: ed74aaedb180979ac1c01bf95943b2b9362aeac1071e65a44ae9444e5c3e4603.

## Timing and acceptance limits

- Latest oracle world-query-only queue: 271 synthetic advances, 18564 yielded steps, 202.58 ms total queue CPU. Character geometry preparation and rendering are excluded, so this is not total NPC cost.
- The oracle uses a 0.75 ms target independently of the System's current 1 ms setting. Its maximum advance was 3.489 ms, maximum unpreemptible step 2.748 ms, and maximum overshoot 2.739 ms. The cooperative budget is soft, not a proven strict frame-time cap.
- These queue-only observations do not replace total-System CPU profiles or erase their slower tails. No GPU, full-display-frame, visual, or historical-content acceptance follows from this report.
- Earlier reruns were incomplete: one comparison process exited 137, and one runner emitted only file-level failure without a failed assertion. Memory pressure was observed but not proven as the cause. Later successful verification used a shared actual-world fixture and a 384 MB V8 old-space limit; failing assertions were not skipped or relaxed.

## Reproduce when the large-scene execution slot is available

node --max-old-space-size=384 scripts/p3c-compare-incremental-world.mjs
node --max-old-space-size=384 --test --test-reporter=tap tests/p3c-incremental-world-regression.test.mjs

No heavy rerun was launched during this closing update. No architecture, player collision, main, credentials, deployment, upload, or commit action was performed by this reviewer.
