# Selected replay

```sh
node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-surfaces.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-trims.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-combined.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-combined-cpu.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```

65 selected top-level tests only. Check600source/4423QA full manifests first. To retain per-pair classification, set WUMEN_ROOF_PAIR_AUDIT_DIR to a new private directory. External diagnostic scripts record their original absolute paths, not universal filesystem portability.

Export only into a new directory with `node --max-old-space-size=384 scripts/photo-fidelity/batches/wumen-joint-layout/roof-combined-cpu.mjs <new-dir>`; then each `python3 scripts/photo-fidelity/batches/wumen-joint-layout/render-roof-combined-cpu.py <input.json.gz> <output.png>` serially. These commands are component diagnostics, not World/GPU.
