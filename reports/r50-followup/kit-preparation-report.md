# Incremental CharacterKit preparation

## Scope and immutable performance-stage evidence

This report describes only the byte-identical preparation refactor at production SHA-256 `a5b5495e7f5c78f3d68fccd429a061b8d84aa5b68a1592f50bfb5bfd6444f3a0` (handoff 2026-10-22 04:14 UTC). The subsequent separately authorized female clothing / hairstyle / face revision is a visible-model phase and is not required to equal the original appearance. Later source edits must not be represented by these timings or equality results; retain this baseline and report unchanged. `kit-preparation-cold-timing.json.gz` is the final 21-process timing evidence; `kit-preparation-timing.json.gz` is explicitly a preliminary earlier run.

## Delivered contract

- `createCharacterGeometrySteps(templateId, pose='standing', lod=0, options={})` is a real synchronous generator. It produces progress records and returns a finished `BufferGeometry` only in the final `next()` with `done: true`.
- Existing `createCharacterGeometry` drives that same production generator until completion. There is no Promise wrapper, second geometry implementation, geometry simplification, color adjustment, or floating-point approximation.
- Progress is `{ kind: 'character-geometry', phase, workUnits, maxWorkUnits: 128, work }`.
- A work unit is one vertex, one face primitive (one or two triangles), one scalar copy, one decoration vertex/triangle, one normal triangle/vertex, or one bounds vertex. Therefore a call emits at most 128 vertices / 256 triangles, accumulates at most 128 normal triangles, or copies at most 128 scalar values; mixed operations share the 128-unit budget.
- Patch triangulation is isolated to one authored contour of at most 20 points. Buffer allocation is isolated from copying. Final commit consists of one `BufferGeometry`, seven already-filled attributes, one already-filled index, bounds, and unchanged metadata.
- Phases: `mesh`, `triangulate`, `attributes`, `normals`, `bounds`, `complete`. `complete` is a final cancellable checkpoint before allocation of a `BufferGeometry`.
- Consumers must not treat intermediate progress values as resources. Use `return()` to cancel; `throw()` also unwinds preparation. No renderer-visible geometry exists before completion. Builder arrays are cleared in `finally`.

## Exact equivalence evidence

The frozen original source SHA-256 is `8a0d392b602b555f48d195d3ffa38f97045766601d6890aed0489417bfe90a87`.

`kit-preparation-baseline.json` was written before the production edit. It stores original SHA-256 and compressed exact bytes for every array, together with attribute shape/version/usage/type, bounds, and userData. Coverage is all 7 templates × 3 LODs × (standing, seated, kneeling, and 3 additional seated variants): 126 complete outputs.

Tests compare the final byte buffers directly against decompressed pre-edit bytes, not merely checksums, tolerance comparisons, or comparisons between two new implementations. All 1,008 arrays match for each API (2,016 comparisons across both APIs), including position, color, normals, indices, character part/pivot/weight/torso weight. All userData and bounding box/sphere values also match exactly.

Normals preserve Three r162's order: Float32 accumulation after every face, followed by exactly the same Vector3 normalization order. The old bounding-box extrema and sphere center/radius arithmetic are preserved.

Targeted tests additionally cover cancellation in every phase, thrown cancellation, validation errors, no geometry publication/allocation through setAttribute before completion, independent actual Color/Vector3/BufferAttribute operation counts, and rejection of unbounded whole-buffer Three normal/bounds routines.

## CPU measurements, not GPU claims

The current source was measured in 21 fresh Node processes, three first-request samples per high-detail standing template. Every step duration is retained in `kit-preparation-cold-timing.json.gz`.

- Total CPU-only preparation: 15.096–23.018 ms.
- Calls per complete output: 446–612. Emperor: 557 calls.
- Worst measured individual call: 4.056387 ms, emperor `mesh`, 128 units.
- Another high outlier: guard normal accumulation, 128 triangles, 3.830769 ms.
- Typical per-process peaks were approximately 0.84–1.05 ms, but that is not a guarantee.
- Isolated triangulation peak: 0.776065 ms.
- Attributes-phase peak: 0.361973 ms.
- Final complete-geometry commit peak: 0.442744 ms.

This implements deterministic work bounds, not a wall-clock bound. The samples do not identify whether a slow call was caused by execution, JIT, GC, or host scheduling. No cause is assumed. The scheduler must still measure elapsed time. No FPS, GPU time, or end-to-end frame-performance claim is made. The purpose is interruptibility, not reducing total work by half; total generator overhead is real.

## Verification and limits

- `node --test tests/p3c-kit-incremental.test.mjs`: 6/6 pass.
- Full character suite at 04:11 UTC: 83/84 pass. The sole failure was parent-owned incremental test importing the not-yet-created `CharacterWorkQueue.js` during parallel implementation, not a Kit regression. The frozen world-source check passed.
- `npm run build`: passed, existing large-bundle warning remains.
- `npm test`: repository has no `test` script.

No source outside CharacterKit was edited by this task. No commits, uploads or deployments were performed. The original baseline is intentionally immutable evidence. Any later approved visible female-model change will require a separately reviewed expectation update, not silently rewriting this performance-refactor baseline.

## Storage-only packaging note

The historical original `kit-preparation-baseline.json` is now reversibly stored as `kit-preparation-baseline.json.gz.index.json` plus 25 binary parts. The uncompressed bytes and all historical assertions are unchanged. The current female expectation remains a separate indexed fixture. Timing `.json.gz` files decode to the exact historical JSON. See `report-packaging-manifest.json` and the verification/restoration command in README; no timings or oracle arrays were regenerated.
