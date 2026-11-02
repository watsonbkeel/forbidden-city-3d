# 必要累计命令
```sh
node --test tests/r158-east-middle/component.test.mjs
NORMAL_INSTALLED=1 EVIDENCE_OUT=/tmp/r158-east-middle-cumulative-0147/world.json.gz node --test tests/r158-east-middle/world.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-east-middle-build-0148
```
verifyBuildSource({dist:'/tmp/r158-east-middle-build-0148',expectedBase:'/gugong/'})通过；作者World原件/tmp/r158-east-middle-0139/world.json.gz用于完整三组逐字比较，不重跑作者QA注入。
