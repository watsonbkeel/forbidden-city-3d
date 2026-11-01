# 有界命令

在本仓根目录，使用已验共享依赖；不是全套 npm test。

```sh
node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenhua-gate-contact/contact.test.mjs tests/r158-zhifang/component.test.mjs tests/r158-luanjia-south/component.test.mjs tests/r158-neige-east-ear/component.test.mjs tests/r158-neige-east-ear/routes.test.mjs tests/r158-neige-east-ear/flight.test.mjs tests/r158-donghua/contact.test.mjs
EVIDENCE_OUT=/tmp/zhifang-normal.json.gz node --test tests/r158-cumulative-2109/zhifang-world.test.mjs
BASELINE_REPORT=../r158-cumulative-evidence-2037/luanjia-world.json EVIDENCE_OUT=/tmp/luanjia-normal.json node --test tests/r158-cumulative-2109/luanjia-world.test.mjs
BASELINE_REPORT=../r158-cumulative-evidence-2003/neige-world.json EVIDENCE_OUT=/tmp/neige-normal.json.gz node --test tests/r158-cumulative-2109/neige-world.test.mjs
NODE_OPTIONS=--max-old-space-size=1024 npm run build
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(verifyBuildSource({root:process.cwd(),dist:'dist',expectedBase:'/gugong/'}))"
```

两条 BASELINE_REPORT 依赖本地保留的前驱原件，不随本次远端上传。严格低盘情况下每条命令前核 df；本次构建前541962240 B，预算7340032 B，底线524288000 B；构建后536494080 B。默认 emptyOutDir:false，旧资产未清除。复跑这些命令不代表本次已经做过 GPU 或用户实机验收。
