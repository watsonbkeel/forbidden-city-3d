# 必要累计命令
```sh
node --test tests/r158-west-middle/component.test.mjs
NORMAL_INSTALLED=1 EVIDENCE_OUT=/tmp/r158-west-middle-cumulative-0156/world.json.gz node --test tests/r158-west-middle/world.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-west-middle-build-0156
```
verifyBuildSource({dist:'/tmp/r158-west-middle-build-0156',expectedBase:'/gugong/'})通过；作者/tmp/r158-west-middle-0151/world.json.gz三组完整逐字对比，不重跑作者QA注入。
