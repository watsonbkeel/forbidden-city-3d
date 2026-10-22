# Female route-identity geometry wiring

Date: 2026-10-22 UTC. Based on `b687544` (female candidate06-04, after oracle packaging `06b9ed1`). This is a narrow runtime integration, not a new art candidate or a release approval.

## Change

- A shared option selector derives hanging-arm `femalePose: walking` only for `consort-daily` or `maid-daily` with standing base pose, `placement.mode: path`, and a nonempty `placement.pathRef`.
- No instantaneous speed, animation state, or `behavior.pathRef` participates. Route pauses intentionally retain hanging arms. Fixed-position women keep the default folded hands.
- Resource acquisition and cooperative preparation share a validated key. Omitted/resting options preserve the exact legacy `template|pose|lod|seatVariant` key; walking appends `|femalePose=walking`. The renderer preserves its old `template|pose|lod|zone|seatVariant` key with the same optional suffix and passes the option to the actual Kit factory.
- `System.prepareFor` derives the same options and prepares all three LODs before the existing WorldAdapter queue can publish a ready binding. Existing identity/version cancellation is reused unchanged.
- The current immutable registry has exactly one walking female, `yongshou-consort-01`. Both maids remain fixed surface actors. The actual registry now needs 27 cached resource keys instead of 24. Maid walking support is tested with an injected fixture; no maid route or actor was added.

Production edits are confined to CharacterResourcePool, CharacterRenderer, CharacterSystem and the 28-line CharacterGeometryOptions helper. Kit, Animation, Manager, WorldAdapter, buildings, collisions, interiors, main, configuration, packages and frozen evidence/oracles are unchanged. `CHARACTER_ROLLOUT_APPROVED` remains false. No upload/deploy.

## Verification

Test-first run before production edits: the initial 11 dedicated tests all failed, as expected, on missing variant keys, folded/hanging cache aliasing, merged renderer batches, unvalidated cached options, and default-only prewarming. After implementation they all passed. Four additional lifecycle/compatibility/queue-order regression tests were then added.

Final focused command:

```sh
node --test tests/p3c-female-runtime.test.mjs tests/p3c-data.test.mjs tests/p3c-renderer.test.mjs tests/p3c-runtime.test.mjs tests/p3c-system.test.mjs tests/p3c-readiness-fade.test.mjs tests/p3c-kit.test.mjs tests/p3c-incremental.test.mjs tests/p3c-work-bounds-review.test.mjs
```

Result: 102/102 passed, including all 15 dedicated runtime tests. Exact final output is stored once in `female-runtime-identity-green.log.gz`.

Dedicated coverage:

- Both female templates, every LOD: folded/hanging cache separation, same-source factory buffers, default/resting aliasing, unique batches.
- Invalid template/pose/LOD/female/seat options fail before cache hits.
- Standing route identity only; fixed, missing/misplaced pathRef, seated, kneeling and male cases retain default behavior.
- Every one of the 90 supported male geometry requests preserves its old key and exact current, unmodified Kit factory buffers/metadata. This is runtime-vs-factory verification, not replacement of the separate frozen historical oracle.
- All 38 immutable required actor specifications prewarm 27 resource keys; high/low rendering retains the required emperor and performs no extra geometry authoring. This coverage uses synthetic ready support, not the full palace.
- A separate actual System first-update test observes all 38 real queue entries, emperor first, then the first real cached geometry is `emperor-ceremonial|seated|0|throne-front-perch`, before any female generator starts.
- Actual PatrolController outbound/pause/return stages preserve mesh, geometry, resource key and completed readiness fade. LOD transitions and off/on cycles preserve the appropriate prewarmed variant and balanced references.
- A small real floor with the actual WorldAdapter/WorkQueue verifies readiness only after three walking LODs, cancellation, mutable pose/placement/template revisions, world invalidation/reload, partial-LOD resume, stale promise rejection, three System off/on cycles, and disposal mid-preparation.
- Idle eviction protects referenced siblings; released resources and batches dispose once without leaks.

`npm run build` passed (264 modules, 3.50 seconds). Vite retains its existing >500 kB chunk-size warning. `git diff --check` passed.

## Boundaries and remaining checks

- No browser/WebGL, visual, full-palace support-coverage or CPU-performance rerun was performed for this narrow change. These are not implied by the focused test result.
- No new smoothing was added. Existing gait deformation can still change at speed-to-zero; stable geometry/readiness is not a claim of smooth gait stopping or arm-fold blending.
- The old female geometry oracle and old fixed-lapel coordinate assertions are known art-change conflicts from earlier review. They were neither rewritten/deleted nor included in this focused green claim. The parent owns the newer reference-test fixture reader adaptation.
- Re-run the focused suite after the separately owned next Kit candidate is integrated. Candidate06-04 still contains preview-only `productionIntegration` metadata; the Kit owner is handling its removal. This patch does not change frozen Kit metadata.
