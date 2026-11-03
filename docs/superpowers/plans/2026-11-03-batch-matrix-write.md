# Batch Matrix Write Implementation Plan

Execution: one bounded implementation, followed by independent review and release checks.

**Goal:** Avoid repeated writes of unchanged world matrices while retaining the 0b candidate as rollback.
**Architecture:** Per-entry successful-submission snapshots only. Keep scene collection, signatures, transforms, visibility and shadow paths intact.
**Tech Stack:** JavaScript ES modules, Three r162, Node tests, Vite.
**Spec:** docs/superpowers/specs/2026-11-03-batch-matrix-write-design.md

## Constraints and review focus

No main/Pages changes, no full World, no browser retries. Verify parent and child transforms, initial/rebuilt entries, source visibility and shadows, material/geometry invalidation, disposal/reinitialization. Preserve finite precision and signed zero; do not cache failed submissions. Identify any generated-batch matrix writers outside this owner before claiming equivalence.

## One implementation task

- [ ] Add tests/r163-batch-matrix-write/current.test.mjs with real BatchedBuilder and Three payload/culling/shadow assertions. Run unchanged-frame red test against 0b source and retain output.
- [ ] Modify only src/render/BatchedBuilder.js with the minimal per-entry matrix guard; rerun new and existing roof-batching / postprocessing lifecycle tests.
- [ ] Inject stale-parent-transform and missing-first-write faults; require failure without weakening the original assertions.
- [ ] Have an independent reviewer inspect the exact source and run focused cases. Check scene ownership assumptions and failure paths.
- [ ] Run necessary retained UI/recovery/control regressions serially. Record unsupported aggregate tests honestly.
- [ ] Commit and build with VITE_BASE=/forbidden-city-3d/ to a separate output; verify build-info identity and local HTTP assets.
- [ ] Only after passing gates, verify remote refs, upload a new development branch and read back every changed file. Retain 0b/main and all prior branches; no deployment.
