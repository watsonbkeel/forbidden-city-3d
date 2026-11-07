# F49 construction-reference retention: narrow design

## Intent and boundaries

Exact base: `2544bab117846a7fd16175a0279e97190d28f549`, tree `c46f52079a60965f548d7b38086741f1d48a4b13`. The public helper's kit-keyed WeakMap value retains its target mesh, its detached parent frame and 24 geometries (97,080 backing-buffer bytes) after real construction release. This is bounded CPU retention, not proof of GPU leakage, unbounded growth or the reported gameplay stalls. The original inventory remains 373/397.

Only the helper's private idempotence cache changes. Preserve exact geometry, visual output, feature identity, routes, shared materials, return-record identity, transaction rollback, postcommit disposal-error semantics and every existing drift check. No new production browser API or dependency. No global release hooks, uploads, CI triggers, main changes or publication.

## Approaches

1. **Nested weak identity map, selected:** keep `done` keyed by kit, with an inner WeakMap keyed by the original mesh and containing the original frozen record. The kit remembers that a commit happened without strongly retaining its original scene. On reentry use the verified frame's slot 14; a missing inner record is drift, never a fresh build. The WeakMap value's back-reference to its own key does not keep the key alive. Existing WeakMap runtime support suffices.
2. **Explicit construction-release callback:** could drop strong references, but couples this private helper to shared lifecycle machinery and complicates return-record and retry semantics. Rejected as broader than required.
3. **WeakRef-backed record:** avoids the strong edge but changes browser requirements and potentially record field behavior. Rejected.

Approach 1 is selected because it preserves the existing interface and browser requirements while limiting the runtime change to the private cache. JavaScript and Three.js remain unchanged.

## Evidence and acceptance

A real production component fixture must run `kit.finish()` and `builder.releaseConstructionReferences()`. After fixture setup returns, keep builder/kit alive but no scene/geometry/record strong reference; compare unmodified, applied-and-released, unreleased and explicit externally-held-record cases across GC turns. Dropping the explicitly held record must allow collection too. Check postcommit dispose-listener throw plus release. GC non-collection alone is not a leak proof; retained controls and the known reference chain accompany the positive collection result.

Require exact return-record identity, rejection of a same-value replacement mesh and slot swap, restoration followed by successful reentry, the existing drift and rollback negatives, and unchanged candidate geometry/registration hashes. Add an exact source-normalization delta with immutable old bytes and hashes; do not overwrite historical source or geometry pins. Full-zone/build checks require a coordinated resource window and cannot be inferred from bounded tests.
