# 实际命令
```sh
PRIOR_FLIGHT_REPORT=../r158-neige-second-store-evidence-2122/flight-first.json node --test --test-concurrency=1 tests/r158-middle-hall/{component,normal-registration}.test.mjs tests/r158-hanben-text/{component,routes,flight}.test.mjs
EVIDENCE_OUT=/tmp/r158-cumulative-evidence-2356/middle-world.json.gz node --test tests/r158-middle-hall/normal-world.test.mjs
BASELINE_REPORT=../r158-cumulative-evidence-2003/neige-world.json EAR_BASELINE=../r158-cumulative-evidence-2109/neige-world.json.gz SECOND_BASELINE=../r158-neige-second-store-evidence-2122/local-first.json.gz LOCAL_REPORT=/tmp/r158-hanben-evidence-2226/local-final.json.gz EVIDENCE_OUT=/tmp/r158-cumulative-evidence-2356/hanben-world.json.gz node --test tests/r158-hanben-text/normal-world.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-cumulative-build-2357
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({dist:'/tmp/r158-cumulative-build-2357',expectedBase:'/gugong/'})))"
```
原作者overlay World不得在已接线树直接重跑；用这里的normal副本。私有原件缺失时不得声称可远端直接重验。全程单槽，无新clone，实际构建后根盘5382578176B，远高于500MiB线。
