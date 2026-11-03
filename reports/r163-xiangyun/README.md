# 香云亭 H43 本地候选

基于干净 cf80d1677a385602333631849ad247d0b3cc4392，新增 FC-3295FB46B4 香云亭的四方、四面闭门、四面抱厦外观和可走低石台/小阶。源提交 b3c31d6540980ff09500289f9bf90c38adc9ec22；后续冻结仅补入测试、图和证据。本地开发分支，无上传/main/Pages。

## 官图、拟合与历史

亲看[故宫2021院刊PDF](https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf)第7页/印20的自身全景及平面，第19页/印32正文。前者明确南北宝华→香云→中正→淡远，并可见香云黄瓦方攒尖/宝顶、红木构、蓝绿梁枋及下层四抱厦屋面；后者支持方形、四面门、每面抱厦。历史金塔等内景记述不作当前陈设库存，本次未造室内或文字匾额。原始官图不再分发，详 SOURCE-REVIEW.json。

全部坐标、尺寸、曲线、屋面交接、材质近似、格纹/构件数量与不可见面均为工程拟合，非测绘。中心(216,397.5)，完整候选包络x210.5..221.5、z392..403，低台.3m，四向各三道.1m/.3m小阶，仅浅台游戏通行，不宣称现实开放、内景或整栋完成。

## 运行与保留

- preflight.tap/json：真正无新hook、sourceDirty=false的cf80正常World基线；候选/旧宝华z388/z406/x209与223侧道均0旧owner、0可见三角相交。
- components.tap：串行指定既有及新组件/局部共210/210通过，不是全部历史测试。命令见下。
- component-local-final.tap：香云7/7，含四向低阶/浅台20组合、8门负控、仅移除南门owner后短探针可过；真实控制器每帧native0。台顶最高.30000000596m。
- normal-world.tap/json：正常静态宫城＋outer-west/west-six/garden，旧cf80全部被测几何/矩阵/材质字段/实例、碰撞/可走面、地图/房间/区域/建筑记录流完全相同，仅省略明确新对象。合批7 mesh、10324 triangles、172真实owners、17低石顶，无新旧实体正体积交叠。
- 新四面20条＋原宝华完整z388环路/六阶廊沿、z406全横向等旧16条路线；8新门＋4旧门/侧墙负控，全部native0。旧屋面59900三角精确保留，只加入本亭实际屋面6668三角。
- clean-build.log：干净b3c31d65 sourceDirty=false、741模块构建成功，保留大包警告；R163-8e963a223b01，sourceFingerprint 2b1ab9a2524628d02743498fe0de4a7162d645e17f1b9b2bd3e9406b9d3c0107。
- http-verify.json/log：在真实/gugong/ base验证137文件、44,380,835bytes全部HTTP MIME/bytes/SHA；root200、缺文件404。只本地HTTP，不冒称远端/GPU。

## 已知失败和未验

- red.tap为新缺失builder/hook五项RED，cleanup-red.tap为后补严格分配释放测试发现真实roof几何泄漏；现已改为先取材质/贴图尺寸再分配几何，7项最终通过。不把早期失败抹掉。
- 首次CPU渲染完成五张真实outer-west几何＋HD贴图PNG，随后proof读取旧名XiangyunHall.js失败。原错误与首次图hash留在cpu-render.log及cpu/image-manifest-first-render.json。脚本改正后，获父协调空闲资源窗口，单进程完整重渲退出0；最终cpu/proof.json源码hash及五图hash已重新独立核对，五图与首轮hash均相同。未改产品源，仍不作GPU/PBR验收。
- GPU/browser/PBR、手机、完整流式世界、全部历史套测、现实开放和整栋验收未验。CPU图只是局部实际几何轮廓，不能替代Runtime验收。独立审查待父安排。
- 首次git add继承sparse-checkout规则，源码提交未收入新增tests；此冻结显式扩展本树sparse规则并补入全部测试，不影响已测运行源或构建源。

## 可复现命令

```
node --test --test-concurrency=1 tests/r163-bilin.test.mjs tests/r163-central-stones.test.mjs tests/r163-fanzong.test.mjs tests/r163-fengyacun.test.mjs tests/r163-gaoyunqing.test.mjs tests/r163-jinzhao-rear.test.mjs tests/r163-shufang-front.test.mjs tests/r163-yinghua-west-ear.test.mjs tests/r163-xiangyun.test.mjs tests/r163-xiangyun/local.test.mjs
NODE_OPTIONS=--max-old-space-size=3072 node --test tests/r163-xiangyun/normal.test.mjs
npm run build
node tests/r163-xiangyun/http-verify.mjs
NODE_OPTIONS=--max-old-space-size=2048 node scripts/r163-xiangyun/render.mjs
```
