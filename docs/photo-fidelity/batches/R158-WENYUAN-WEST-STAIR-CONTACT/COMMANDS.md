# 已执行命令（本地私有原件）
```sh
node --test --test-concurrency=1 tests/r158-wenyuan-stair-contact/contact.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-nansansuo-front-stair-contact.test.mjs tests/r158-nansansuo-north-stair-contact.test.mjs tests/r158-wenhua-route/contact.test.mjs tests/r158-arrow-stair-contact/contact.test.mjs tests/r158-wenhua-gate-contact/contact.test.mjs tests/r59-wenyuan-upper-windows.test.mjs
BASELINE_REPORT=/tmp/r158-wenyuan-weststairs-2154/route-frames.json.gz EVIDENCE_OUT=/tmp/r158-wenyuan-stair-contact-2200/world-final-current.json.gz node --test tests/r158-wenyuan-stair-contact/world.test.mjs
node --import ./tests/r158-wenyuan-stair-contact/baseline-loader.mjs tests/r158-wenyuan-stair-contact/capture.mjs
node tests/r158-wenyuan-stair-contact/capture.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-wenyuan-stair-build-2211
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({dist:'/tmp/r158-wenyuan-stair-build-2211',expectedBase:'/gugong/'})))"
```
每阶段 df -B1 检查根盘 ≥524288000B；构建后528846848B。/tmp为独立tmpfs，原件/构建非持久。不存在的私有基线不能冒称远端可直接重验。
