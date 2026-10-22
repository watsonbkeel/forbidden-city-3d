# R50 preparation work-bounds and stale-cache review

Review date: 2026-10-22, 04:30–04:52 UTC. Independent read-only production review of `CharacterWorkQueue`, `CharacterWorldAdapter`, `CharacterResourcePool`, `CharacterSystem`, and incremental `CharacterKit`. This reviewer changed only `tests/p3c-work-bounds-review.test.mjs` and this report.

## Outcome

Six actionable root causes were reproduced, reported to the production owner, and independently verified as fixed. These include stale-world/anchor reuse, two actual single-step work gaps, a last-hit/commit mutation window, and stale-index recovery. Cross-frame and exceptional-cleanup regressions also pass for the final synchronous read-scope optimization. No reproduced regression remains open in this review's covered contract. Earlier red runs are historical findings, not the final outcome.

The independent file contains **29/29 passing lightweight tests**. Final combined review + existing world + incremental suites: **53/53 passed**, no failures or skips, approximately **434.5 ms** at 04:52 UTC. All five reviewed production file hashes were unchanged before/after this final run and are recorded below.

No actual palace build, real-world profile, browser/GPU run, package change, external action, commit, upload, or deployment was performed by this reviewer. The previous browser permission denial was not retried or bypassed. No frozen baseline was rewritten. Visual/GPU acceptance is not established; rollout remains gated.

## Reproduced findings and fixes

### 1. High: completed world evidence was reused after relevant world changes — fixed

Originally, `_workVersion` noticed scene/collider changes for unfinished jobs, but actor revision and completed actor/path caches did not. After a successful one-meter route, removing its floor or appending a blocking wall still returned the old `ready` result. The manager's unchanged `getRevision` also prevented another request. An explicit `invalidate` correctly rejected the same world.

The fix uses actor-local physical epochs and saved support-owner/ancestor evidence, checked by `getRevision` before the manager's ready fast path. A changed dependency clears the actor and corresponding route cache plus spatial indexes. A separate route proof protects shared-route reuse. Regressions now cover:

- Support removal, owner/ancestor hiding, reparenting, translation, ancestor translation, rotation, scale, and geometry replacement.
- An appended blocker on the later part of a route, not merely at the actor's current point.
- A blocker inside the wider endpoint turning disc.
- Repeated small distant appends preserving revision and support-query count.
- A support-range append that is nonblocking but requires a fresh successful rebind, followed by stable reuse of that new proof.

### 2. High: shared path keys omitted path-anchor and surface-anchor definitions — fixed

Moving a route anchor from x=0 to x=2 changed actor revision but still reused cached route coordinates at x=0; `pathChecks` stayed 1. Raising a separate surface anchor by 0.2 m also incorrectly retained readiness on the original floor.

Both anchor definitions now participate in the shared path key and its final specification comparison. Independent regressions verify changed route coordinates and rejection at the changed support height. Arbitrary mutation of separate layout/zone resolver data is outside the frozen registry contract and still requires explicit invalidation.

### 3. Medium: seat occupancy copied an entire candidate list before yielding — fixed

A spread concatenation of a bucket and global candidates consumed all 4,096 instrumented references in the first `next()`, despite reporting 64 work units. The fix iterates the two lists directly. The regression counts actual iterator reads and bounds them per `next()`; it does not trust progress labels or a timing threshold.

### 4. Medium: DFS completion performed unbounded ancestor unwinding — fixed

A 1,024-group chain made a terminal `next()` read 1,025 child-array lengths before completion. Completion is still a work step. The fix adds bounded unwind checkpoints; the counter-instrumented regression covers all calls including completion.

### 5. High: proof capture could bless an old hit with a newly changed owner state — fixed

The first local-proof implementation captured owner state only at final publication. Hiding a supporting plane after the last actual triangle hit, but before the generator returned, therefore paired the old hit with a new hidden-owner snapshot and incorrectly published `ready`.

Actual mesh queries now capture owner/ancestor/geometry state before triangle work. The first owner snapshot is retained, later mismatches are sticky, and commit compares the original snapshots again. Evidence is passed as a non-enumerable option so independent support-oracle parameter cloning does not inadvertently clone the scene. Regressions mutate visibility, transform/matrixWorld, or geometry between queue advances immediately after the last hit and require a non-ready result with no actor cache/proof publication.

### 6. Medium: stale rejection or query failure retained an unusable spatial index — fixed

Replacing the last-hit floor with an equivalent new 20×20 plane correctly rejected the first stale proof, but subsequent requests repeatedly failed because the old index survived and the new geometry had no computed bounding box. An earlier replacement after `world-mesh-index` and before the first hit reached the same persistent error without ever reaching proof commit.

Stale physical commit and the request generator's exception handler now clear relevant actor/path/proof caches and spatial indexes. Both regressions require the next independent request to become ready on the equivalent replacement geometry. Fail-closed rejection alone was not accepted as sufficient recovery.

## Locality and bounded evidence

The production proof is capped at 16 owners, each with at most 16 ancestors; excess unsupported evidence fails closed. It records geometry/attribute/index identities and versions, relevant material/group/draw-range state, owner ancestry/visibility/transforms, and a conservative AABB accumulated from all route footprint and endpoint-turn support probes.

Collider and walkable arrays are tracked by identity and observed length. At most 64 newly appended entries per collection are examined against the proof AABB. Distant appends advance the observation cursor without changing actor revision or rerunning support queries. Relevant/unknown appends, array replacement/shrink, excessive appends, or changed scene roots invalidate conservatively. Walkable identity/length also participates in pending-job `_workVersion` cancellation.

This retains the older world test's locality requirement: an unrelated loaded zone plus a collider at x/z=500 does not invalidate a static binding. It does not copy or scan all 23,253 colliders per actor. Large irrelevant changes can conservatively trigger rebinds; avoiding those would require an authoritative spatial change summary.

## Synchronous read-scope optimization

Only `getRevision` shares object/geometry/root snapshots during one synchronous manager traversal. `CharacterSystem.update` calls `beginReadFrame`, runs the manager, and calls `endReadFrame` in `finally`, before any resumable queue advance. Support query capture and commit comparisons do not opt into that cache.

The added tests verify one geometry read for repeated revision checks inside a scope, fresh detection of an owner mutation in the next scope, cleanup before queue advance, and cleanup even when the manager throws. They do not authorize mutation of support objects halfway through a synchronous read-only traversal.

## Other reviewed safety that held

- `CharacterKit` performs real partitioned construction, scalar copies, normals, and bounds at the substantive work sites. Patch contours are capped at 20. No further Kit defect was found.
- Cancelled `CharacterResourcePool.prepare` publishes no partial entry and preserves the geometry/reference count of an already acquired entry.
- The queue checks an obsolete mutable request identity before resuming its paused iterator, resolves cancellation, and unwinds the iterator.
- The shipped 96-actor ceiling fits the 192 pending-job ceiling. No intentional dropping of required actors was found in the reviewed changes.
- `CharacterSystem` measures manager/render submission within the same total update interval and allocates preparation only its remaining budget. Total-update measurements, not queue labels alone, are the appropriate CPU evidence.

## Explicit limits of the claim

The local proof is not a general Three.js scene mutation tracker. Arbitrary same-length in-place collider/walkable box edits, raw geometry-array edits without the normal attribute version update, manual matrix/layer/character-tag changes, or changes to unrelated previously unobserved nested geometry require explicit `invalidate()` or an authoritative mutation signal. Identity/length checks cannot detect every such edit. These were not claimed as verified automatic invalidation guarantees.

The current shipped paths have three points each. Arbitrarily large injected paths are not schema-capped, while specification serialization and initial point validation/transformation are synchronous. Likewise, `getRevision` and `_workVersion` contain synchronous collection/spec scans outside iterator progress accounting. The supported fixed registry and explicit proof limits are material to bounded-work claims; the review does not establish a universal bound for unlimited injected scene/registry input.

No GPU, visual, historical-content, or real-world performance acceptance follows from these small correctness tests. Those independent gates remain with their owners.

The production owner separately reported a low-quality timed run with a **15.08 ms collider-cell step** and **16.12 ms total NPC update maximum**, despite a 1 ms requested preparation/update budget. This review did not rerun that profile or establish the tail's cause. Preserve the reported tail; do not describe the cooperative budget as a hard wall-time maximum.

## Reproduce and source snapshot

`node --test tests/p3c-work-bounds-review.test.mjs tests/p3c-world.test.mjs tests/p3c-incremental.test.mjs`

The regressions assert desired safe behavior and are neither skipped nor relaxed. They use tiny geometry or counter-instrumented lists, not elapsed-time acceptance thresholds.

Final source SHA-256 values, identical before/after the 53/53 run:

- CharacterWorkQueue: `2e5e2d24c746647123bf6a20b9c169fe062e4a3db5cc28f86a0c531e304ad7b2`
- CharacterWorldAdapter: `ccb552b78fbec725d7241c2a8d795b97a7e4cc2c9b32f25473ff833dafb42829`
- CharacterResourcePool: `161787370bf9e4e9c9206d60caff8a29e6735e26d9311a72f5e6d96d2fc69aa0`
- CharacterSystem: `88fcb1978862601d7e539c788fb13c7b28e442a78b2f924c6554fe0c21a969fa`
- CharacterKit: `1bdcf7f5df6a55a82fc6b9074a0bdb5131e9792fbb1d04f97a6550baecdfbd8c`

The initial historical red run predated parallel production edits and was not separately hash-captured; it must not be attributed to these final fixed-source hashes.
