# R116 single equal-quality startup experiment

Root accepted this bounded experiment on 2026-10-27, after actual R115-fix startup profiling. This does **not** remove/defer the seven-zone prebuild loop. All original metadata, silhouettes, RoomNightLights collider sources, FlightEnvelope, first-entry sync readiness and future R118 routine zone readiness retain the original dependency graph.

## Scope
Only `src/utils/MergeUtils.js` and new pure `src/utils/MergeFloat32Writer.js`. Whole material bucket preflight; common Float32 position/normal/uv only, plain non-interleaved attributes, fixed item sizes/normalization/usage, valid triangle indices/counts, finite values/matrices, no morph/tangent/color/skin/custom attributes. Partial draw ranges or unsupported buckets use the original algorithm. Standard single-material BoxGeometry groups follow the original merge(false) semantics (output has no input groups), not new clipping behavior.

Write transformed vertices directly into final arrays instead of toNonIndexed/clone, per-source transformed arrays and a second concatenation. Use the actual Three Vector3 matrix/normal methods, preserving double intermediates and the exact final Float32 write; no affine shortcut, hypot, epsilon or early fround. Negative determinants preserve original triangle winding swap. Source/material identity and noMerge/instance retention are unchanged; source geometries are disposed once at the original end, not inside the writer. Unknown input must return null before output allocation/mutation; the fallback remains the frozen previous implementation.

## Evidence and rejection rule
- Frozen original MergeUtils bytes in tests/fixtures/r116 are the exact c09a66c8 Git blob, not a rewritten oracle.
- Pure indexed/nonindexed, mirror/nonuniform/perspective transform, missing/extra/normalized/interleaved/morph, groups/drawRange and shared ownership fixtures.
- Final full-world high/low rendered attributes, world matrices, actual texture pixels/sampling, collision/rooms/map/actors exact. Native CPU image decoding is not GPU validation.
- Same-root A/A five fresh pairs per quality before candidate, then same protocol five baseline/candidate pairs; keep all samples, p95/p99/max, first entry and retained memory. Resource counting is outside ready CPU timing. Reject if benefit is not distinguishable or countermetrics regress without explicit root disposition.
- Runtime baseline is independently delivered R115-fix c09a66c8 / remote5c16ee03. Unpatched R115 crashes and is never a performance timing baseline.
