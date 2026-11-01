# Exact bounded verification commands
Run from r158-wenhua-route-1821 with existing externally linked dependencies; no new npm install or clone.

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenhua-route/contact.test.mjs tests/r158-jingxing/component.test.mjs tests/r158-nansansuo-courtyard-gates.test.mjs tests/r158-nansansuo-common-gate.test.mjs tests/r158-nansansuo-common-gate-controller.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-nansansuo-front-stair-contact.test.mjs
EVIDENCE_OUT=../r158-cumulative-evidence-1840/jingxing-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1837/jingxing-world.test.mjs
EVIDENCE_OUT=../r158-cumulative-evidence-1840/nansansuo-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1837/nansansuo-world.test.mjs
EVIDENCE_OUT=../r158-cumulative-evidence-1840/wenhua-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenhua-route/world.test.mjs
VITE_BASE=/gugong/ node --max-old-space-size=1024 node_modules/vite/bin/vite.js build
node --input-type=module -e "import{verifyBuildSource}from'./scripts/build-identity.mjs';console.log(verifyBuildSource({expectedBase:'/gugong/'}))"
```

Each test/build terminal exit was captured separately in local evidence; all commands above exit0. Actual execution was serialized: Jingxing, SouthThree, Wenhua, components, clean runtime commit/build/verification. Inherited old-red reproduction and candidate raw evidence are referenced, not reclassified as these commands' results.
