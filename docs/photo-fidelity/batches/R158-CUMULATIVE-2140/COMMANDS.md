# 实际命令
```sh
node --test --test-concurrency=1 tests/r158-wenhua-companion-steps/component.test.mjs tests/r158-chuanxin-zhuban/component.test.mjs tests/r158-neige-second-store/{component,routes,flight}.test.mjs
EVIDENCE_OUT=/tmp/r158-cumulative-evidence-2140/companions-world.json.gz node --test tests/r158-cumulative-2140/companions-world.test.mjs
EVIDENCE_OUT=/tmp/r158-cumulative-evidence-2140/zhuban-world.json.gz node --test tests/r158-cumulative-2140/zhuban-world.test.mjs
BASELINE_REPORT=../r158-cumulative-evidence-2003/neige-world.json EAR_BASELINE=../r158-cumulative-evidence-2109/neige-world.json.gz LOCAL_REPORT=../r158-neige-second-store-evidence-2122/local-first.json.gz EVIDENCE_OUT=/tmp/r158-cumulative-evidence-2140/neige-world.json.gz node --test tests/r158-cumulative-2140/neige-world.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-cumulative-build-2140
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({dist:'/tmp/r158-cumulative-build-2140',expectedBase:'/gugong/'})))"
```
逐阶段核df，工作盘必须>524288000B。私有原件路径不在远端仓库，不得将缺原件的重验冒称可直接通过。
