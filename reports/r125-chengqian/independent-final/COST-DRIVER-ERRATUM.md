# Cost driver erratum — independently scoped review

**The R125 correction is a diagnostic-driver correction, not a product optimization.** Current source-bound pair data retains runtime `8755dbbd…`; no product algorithm or geometry is changed by these helper edits. Original raw is retained; only one complete replacement 3-pairs-per-quality batch is used. The exact initial R125 driver bytes were not preserved, so no original-driver SHA or byte-exact reconstruction is claimed.

## What the timers actually include

The frozen R123 helper statically imports its own current ZoneBase/TextureLibrary/quality graph before the outer cost timer. Inside `readyScene`, only `sourceRoot != root` dynamically imports another target graph. R124's paired driver explicitly invokes this same R123 cost process. Thus their `allReadyMs` comparison has direct asymmetric import inclusion.

`buildMs` begins **after** imports and texture loading. It is wrong to say that the import duration was directly counted in `buildMs`. Its execution state nevertheless differs (one versus two module graphs), and the `buildHall` diagnostic wrapper performs matrix, bounds and snapshot work inside `builder.build`. Those timings are instrumented-build observations, not isolated production construction costs. Their exact bias cannot be calculated from these records.

The corrected R125 helper dynamically imports only the target graph for either root; `capture:false` disables both per-hall diagnostic snapshots and the final physical JSON snapshot for cost runs. The inner build timer is still around `builder.build`, and the outer timer covers target imports, real local decode, build and readiness. This is a meaningful measurement-boundary correction, not a renamed timer or weakened physical validation. Diagnostic exports retain capture by default.

Legacy `memoryAfterDispose` can retain the extra module graph and snapshots. It is not owned product heap. Disposal timing remains a separately timed observation, not import time or a demonstrated optimization. Exactly-once object-disposal counts remain usable.

## Scope of historical correction

Confirmed: R123 and R124 paired timing paths using `scripts/r123/ready-zone.mjs`; record the caveat without rewriting frozen trees. R119/R120 reviewed helpers dynamically select the target for both roots and do not have this particular branch asymmetry. This is not a blanket audit of all old performance work.

Unchanged evidence: actual geometry/body/controller results, source bindings, deterministic final target resources, exactly-once disposal. Separate whole-world startup and routine profiles are not automatically invalidated by this helper defect; their own single-sample, transport, timer and GPU limitations remain.

## Corrected recorded results (12 fresh processes)

Independent arithmetic and recorded driver SHA checks:

| Median candidate − base | High | Low |
|---|---:|---:|
| buildMs | +146.841431 ms | −3.208031 ms |
| allReadyMs | +154.290654 ms | −41.394546 ms |

High build pair deltas: +146.841431/+24.783096/+199.750986 ms. Low: −3.208031/−79.878893/+28.042207 ms. Report all samples; no speedup or no-regression claim. Do not subtract initial versus corrected batch to claim a causal import-overhead number: capture also changed and noise remains.

Both initial and corrected batches have exactly the same deterministic feature delta: +3,652 triangles, +350,592 geometry ArrayBuffer bytes, +2 finished meshes/geometries/materials and +2 owned materials; +54 colliders/+6 walkables/+2 rooms/+2 map items/+2 scope owners, ordinary box scalar payload +2,592 B. Textures/logical RGBA and actual surface face counts unchanged. All recorded tracked target disposals once; no full JS/native/GPU memory claim.

`review.py`, `review.json`, `review.log` preserve calculations, exact source/driver references and hashes. Reviewer did not rerun a world or benchmark.
