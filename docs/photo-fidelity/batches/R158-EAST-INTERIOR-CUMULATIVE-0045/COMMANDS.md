# 必要累计命令
```sh
node --test --test-concurrency=1 tests/r158-luanjia-east-twolevel/{component,contact,routes,vertical}.test.mjs
NORMAL_INSTALLED=1 BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2037/luanjia-world.json EVIDENCE_OUT=/tmp/r158-east-interior-cumulative-0044/world.json node --test tests/r158-luanjia-east-twolevel/world.test.mjs
node --test --test-concurrency=1 tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-wenyuan-stair-contact/contact.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-east-interior-build-0045
```
verifyBuildSource({dist:'/tmp/r158-east-interior-build-0045',expectedBase:'/gugong/'})成功。正常World测试标题沿作者旧名字，但实际环境NORMAL_INSTALLED=1和输出scope/零注入断言硬锁正常入口，不以旧标题冒称QA已装。
