# 正常累计命令
```sh
NORMAL_INSTALLED=1 EAST_BASELINE=/tmp/r158-east-interior-cumulative-0044/world.json SOUTH_BASELINE=/workspace/scratch/02a8023d1a85/r158-luanjia-south-evidence-2051/world-summary.json EVIDENCE_OUT=/tmp/r158-south-interior-cumulative-0130/world.json node --test tests/r158-luanjia-south-twolevel/world.test.mjs
node --test --test-concurrency=1 tests/r158-luanjia-south-twolevel/{component,contact,routes,vertical}.test.mjs tests/r158-luanjia-east-twolevel/{component,contact,routes,vertical}.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-wenyuan-stair-contact/contact.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-south-interior-build-0131
```
verifyBuildSource({dist:'/tmp/r158-south-interior-build-0131',expectedBase:'/gugong/'})通过。不运行作者QA注入分支；后继重复运行必须保NORMAL_INSTALLED=1。
