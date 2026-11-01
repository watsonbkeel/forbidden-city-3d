# Exact bounded commands

Run in the fixed cumulative worktree with its existing linked dependencies. E=`../r158-cumulative-evidence-2003`; raw output stays local. Each command's exit is separately stored; all observed exits are 0. The baseline files below are local historical evidence, not remote payloads.

```sh
EVIDENCE_OUT="$E/north-stair-world.json" node --max-old-space-size=1024 --test tests/r158-nansansuo-north-stair-world.test.mjs
EVIDENCE_OUT="$E/zhujing-world.json" BASELINE_REPORT=../r158-zhujing-north-evidence-1937/world-final.json node --max-old-space-size=1024 --test tests/r158-zhujing-north/world.test.mjs
EVIDENCE_OUT="$E/zhisheng-world.json" node --max-old-space-size=1024 --test tests/r158-zhisheng/normal-world.test.mjs
EVIDENCE_OUT="$E/neige-world.json" BASELINE_REPORT=../r158-cumulative-evidence-1927/neige-world.json node --max-old-space-size=1024 --test tests/r158-neige-text-wings/normal-world.test.mjs
EVIDENCE_OUT="$E/south-three-world.json" node --max-old-space-size=1024 --test tests/r158-cumulative-1927/nansansuo-world.test.mjs

node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-nansansuo-north-stair-contact.test.mjs tests/r158-nansansuo-north-eaves.test.mjs tests/r158-nansansuo-front-stair-contact.test.mjs tests/r158-nansansuo-courtyard-gates.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-wenhua-route/contact.test.mjs tests/r158-arrow-stair-contact/contact.test.mjs tests/r158-zhujing-north/component.test.mjs tests/r158-zhujing-north/routes.test.mjs tests/r158-zhisheng/component.test.mjs tests/r158-neige-text-wings/component.test.mjs tests/r158-neige-text-wings/routes.test.mjs tests/r158-neige-text-wings/flight.test.mjs

VITE_BASE=/gugong/ node --max-old-space-size=1024 node_modules/vite/bin/vite.js build
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({expectedBase:'/gugong/'})))"
```

The original author `world.test.mjs` files under Zhisheng and Neige wings contain clearly labeled author-only injection and are retained as historical QA. The accepted cumulative commands use their distinct **normal-world.test.mjs** variants, without prototype mutation. The north-stair test additionally hard-locks actual six support IDs; no original route or gap assertion was relaxed.
