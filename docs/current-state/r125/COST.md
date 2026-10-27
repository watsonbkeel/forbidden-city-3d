# R125 feature cost (not a performance optimization)

**Historical correction:** [R123/R124 paired timing erratum](COST-ERRATUM.md). Those older helper-based paired build/allReady deltas are not reliable causal comparisons. Original frozen/raw evidence is preserved. This correction must carry into R126.

## Corrected same-driver pairs

Actual whole east-six, 22 color + 21 normal SD file loads ready; high/low here are building-detail variants, not full-world startup quality. Three alternating fresh-process R124/R125 pairs, target-only dynamic module loading on both sides, diagnostic capture off. Product 0773 baseline versus 8755 candidate; before=after each process. Exact corrected raw: `reports/r125-chengqian/cost/pairs.json`, `deltas.json`; rejected asymmetric pass retained separately.

| building detail | build Δ, candidate−baseline, ms | median Δ | allReady Δ, ms | median Δ |
|---|---|---:|---|---:|
| high | +146.841 / +24.783 / +199.751 | +146.841 | +154.291 / −4.054 / +272.397 | +154.291 |
| low | −3.208 / −79.879 / +28.042 | −3.208 | −41.395 / −213.098 / +38.717 | −41.395 |

Only three pairs; signs vary and no speedup claim is made. allReady includes target imports, platform/library load and ready completion, not whole-world all-ready startup. Initial asymmetry did not constitute product performance improvement.

## Deterministic owned cost

Both qualities add **3652 triangles / 350592 geometry ArrayBuffer bytes / 2 merged meshes / 2 owned materials / 54 colliders / 6 walkables / 2 rooms / 2 map entries / 2 finite entry scopes**.

- High east-six triangles 109801→113453; low104147→107799.
- Geometry bytes high10540896→10891488; low9998112→10348704.
- Collider count1243→1297; walkables53→59. Ordinary Box3 scalar payload +2592 B (6 doubles per box). ActualSurface source-face scalar payload unchanged576 B; this is **not** full JS object/index/native or retained heap accounting.
- Unique textures30, logical decoded RGBA24338432 B **unchanged**. No new atlas/request. This is not full VRAM/mipmap/native allocation.
- Every corrected sample tracks all final geometries plus owned materials, disposed exactly once: old115/115, new119/119. Library-owned resources follow existing disposal; no full heap-retention claim.

Full low/high startup observations: allReady7474.274/7447.943ms, ordinary returns958.751–1489.853/915.024–1524.787ms, independent TTL expiry2114.692/2190.814ms. First-entry58.119–114.145ms is Teleport setup, not walking FPS; no new construction on first entry. These are separate single samples, not paired performance gains. Final source-bound cumulative gates are recorded in VALIDATION; GPU/mobile/render-frame timing NOT_RUN. Inherited R124 routine CPU observation P99 18.831/max50.533 ms remains an unresolved stutter risk, not a new R125 measurement or attribution. R116/R117 and R120 NR1/NR1b optimizations remain unaccepted.
