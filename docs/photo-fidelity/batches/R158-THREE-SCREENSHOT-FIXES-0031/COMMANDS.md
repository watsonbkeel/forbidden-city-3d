# 实际累计命令
```sh
node --test --test-concurrency=1 tests/r157-wuying-paving/*.test.mjs tests/r52-wuying-moon-terrace.test.mjs tests/r52-wuying-next-forms.test.mjs tests/r158-wenyuan-bridge-axis/{alignment,retained-rails}.test.mjs tests/photo-fidelity/batches/taihemen-stair-contact.test.mjs tests/r158-taihemen-open/review-contact.test.mjs
node --test tests/r158-taihemen-open/world.test.mjs
EVIDENCE_OUT=/tmp/r158-three-screenshot-evidence-0027/parent-collision.json node --import ./tests/r158-three-screenshot/taihe-parent-loader.mjs tests/r158-three-screenshot/parent-collision.mjs
BASELINE_REPORT=/tmp/r158-wenyuan-axis-evidence-0006/world-red.json.gz PARENT_COLLISION_REPORT=/tmp/r158-three-screenshot-evidence-0027/parent-collision.json EVIDENCE_OUT=/tmp/r158-three-screenshot-evidence-0027/wenyuan-final.json.gz node --test tests/r158-wenyuan-bridge-axis/integrated-world.test.mjs
VITE_BASE=/gugong/ npm run build -- --outDir /tmp/r158-three-screenshot-build-0031
node --input-type=module -e "import {verifyBuildSource} from './scripts/build-identity.mjs'; console.log(JSON.stringify(verifyBuildSource({dist:'/tmp/r158-three-screenshot-build-0031',expectedBase:'/gugong/'})))"
```
太和脚本固定输出/tmp/r158-taihemen-open-world.json.gz，运行前保原件，运行后复制到累计私有目录。作者太和before组件绑定旧借用树，不在已接线树重跑并误称父比较。原始参照缺失时不能冒称远端可直接重验。无npm test脚本/未全仓测试。
