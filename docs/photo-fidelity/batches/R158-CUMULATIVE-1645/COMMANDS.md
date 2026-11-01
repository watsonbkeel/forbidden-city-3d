# Exact limited verification
```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenyuan-step/component.test.mjs tests/r158-nansansuo-common-gate.test.mjs tests/r158-nansansuo-common-gate-controller.test.mjs
EVIDENCE_OUT=/tmp/r158-second-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1645/world.test.mjs
VITE_BASE=/gugong/ npm run build
```
Final component run is 40/40; first 39/40 retained locally. World is one top-level test containing eight actual loops and explicit scene/negative assertions. Neither result is a full-suite/GPU claim. Dependency tree reused from the previously verified install; no fresh npm ci claim.
