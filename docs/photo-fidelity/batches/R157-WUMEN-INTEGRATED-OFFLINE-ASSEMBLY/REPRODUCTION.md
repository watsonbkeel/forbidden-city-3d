# Limited selected replay

Verify SOURCE-FINAL600 and QA-FINAL4428 complete path sets and hashes first. Use package-lock npm ci.

```sh
node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-surfaces.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-trims.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-combined.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-combined-cpu.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/assembly-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-assembly.test.mjs
```

This is105 selected top-level tests only, not the full historical batch. Older controls additionally need public/textures/hd/manifest.json if selected. All historical test/loader snapshots are gzip-only to prevent discovery; external scripts retain original absolute paths, not a universal runner contract. The actual gate fixture uses the real builder with finish interception and tile1 materials, not defaultWorld. New physical installation and CPU rendering are not part of this command.
