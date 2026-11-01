# Selected replay
```
node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-surfaces.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-trims.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```
Expected selected58 only. Verify600 source manifest and4418 QA separately before replay. Source-pinned diagnostic loaders are archived; expected negative must be a mathematical/pose/render assertion, not a pin/import error. External capture script paths record the original environment and do not imply universal filesystem portability. Runtime source and prior upper baseline golden remain unchanged.
