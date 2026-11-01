# Selected reproduction
Use the pinned package-lock dependencies and existing Node 24 environment. No World/CPU required.

```sh
node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/roof-section-evaluator.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/roof-section-surfaces.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```

Expected selected48 only. Original command/environment/resources and TAP are archived. Mathematical mutation loaders are diagnostic inputs, not production; their exact source SHA pins must hold and expected red must be a named assertion, not import/SHA failure. Historic early source-error attempts and signed stages must not be relabeled.

Current 600 source manifest must be checked separately before replay: persistent tests do not all independently enumerate runtime source. No claim of complete history-free QA reproduction.
