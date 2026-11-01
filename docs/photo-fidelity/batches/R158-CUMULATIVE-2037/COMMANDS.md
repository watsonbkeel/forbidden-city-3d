# Observed commands (all exit0)

Run at the fixed runtime with existing linked dependencies; E=`../r158-cumulative-evidence-2037`. Each command saves local output/exit separately. Baselines are local historical evidence, not remote raw payloads.

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-dapao/component.test.mjs tests/r158-luanjia-east/component.test.mjs
EVIDENCE_OUT="$E/dapao-world.json" node --max-old-space-size=1024 --test tests/r158-dapao/normal-world.test.mjs
EVIDENCE_OUT="$E/luanjia-world.json" BASELINE_REPORT=../r158-cumulative-evidence-2003/neige-world.json node --max-old-space-size=1024 --test tests/r158-luanjia-east/normal-world.test.mjs
VITE_BASE=/gugong/ node --max-old-space-size=1024 node_modules/vite/bin/vite.js build
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({expectedBase:'/gugong/'})))"
```

The normal versions remove the author's before-finish prototype injection/restore. Candidate pre-publication reference-identity proofs remain in author component/evidence; current registration is separately asserted by unique normal metadata/labels and exact owner counts. No before-hook assertion is silently represented as a current normal-source proof.
