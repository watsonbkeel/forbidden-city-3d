# Selected local command, not full suite

From repository root after exact source/QA/fixture verification:

```sh
node --max-old-space-size=384 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```

Recorded Node v24.22.1,30/30,5235.797519ms TAP; Python wall5.295877796s/RSS338472KiB. Actual command/cwd/start/end in author/task2/focused-30.resource.json. No World/FP/export/build is executed by this command. Snapshot generator is author/task2/capture-baseline.mjs; it explicitly verifies600 paths/SHA before capture. Its final helper transport-pin identity is documented separately; do not overwrite the existing pinned snapshot when replaying.
