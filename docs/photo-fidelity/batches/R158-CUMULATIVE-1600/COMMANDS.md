# Reproduction commands
From repository root, with dependencies installed:

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenhua-grid/component.test.mjs tests/r59-wenhua-gate-window.test.mjs tests/r59-wenhua-gate-divisions.test.mjs tests/r158-arrow-south-head-bands.test.mjs tests/r158-arrow-south-door-lattice.test.mjs tests/r158-arrow-south-nameboard.test.mjs tests/r158-arrow-south-lattice-atomicity.test.mjs tests/r59-arrow-baseline-fixture.test.mjs tests/r59-arrow-south-knees.test.mjs tests/r59-arrow-knees-world-consumer.test.mjs tests/photo-fidelity/batches/r158-wenyuan-veranda/veranda.test.mjs tests/r59-wenyuan-upper-windows.test.mjs tests/east-west-city-gates.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/geometry.test.mjs tests/r158-donghua/contact.test.mjs
node --max-old-space-size=1024 --test --test-concurrency=1 --test-name-pattern='all six portals|normal complete outer-east' tests/east-west-city-gates.test.mjs tests/r158-arrow-south-head-bands.test.mjs
EVIDENCE_OUT=/tmp/r158-wenyuan.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1600/world-wenyuan.test.mjs
EVIDENCE_OUT=/tmp/r158-donghua.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1600/world-donghua.test.mjs
VITE_BASE=/gugong/ npm run build
```

The full component command above ran before the two test-only library fixes (137/139); only the exact two affected tests were re-run afterward (2/2). World and clean build bind the final runtime commit. Raw logs remain local; see VERIFICATION.json for hashes.
