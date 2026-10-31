# 午门上层 Task1 数值合同独立复审

结论：**Task1 有限通过，可进入父已批准的 Task2 完整前驱基线；不批准屋面实体、上层装配或生产接线。** 本轮未发现阻断纯数值合同的 P0/P1。后续实际三角承托、派生 Y、法线/UV、完整围护及台面 FP 仍是实体阶段的 P1 门禁，不能由本轮 5 个测试替代。

## 本轮身份与实际执行

只读树 `r157-wumen-joint-layout-1622`，HEAD `a32c65150b1080077ad6f92848b3e32983332525`。核 `task1/freeze-2110.json` 三路径逐 SHA 相符；虽文件名为 2110，其冻结 JSON 已嵌入 2112 配方/knots。本次另外逐文件对比全部 600 个已跟踪 src/data 与 HEAD 字节，全部相同。没有执行 World、FP、CPU 渲染、实体 capture、构建或远端操作。

独立实际命令：

```sh
node --test --test-reporter=tap tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs
```

终态 **5/5，fail/cancel/skip 均 0，exit 0，TAP 113.819898 ms**。原输出为同目录 `current-5.tap`、`current-5.exit`。已向作者释放轻测窗口。作者首 RED 是 missing-module 导致的 **1 个文件失败记录**，不能称 5 条逐项断言红；后继 5 个实际测试绿成立。外置生成脚本的 cwd 错误不是产品断言 RED。

## 静态及算术独核

- `upper-contract.mjs` 只读本地 JSON，先校精确 byte SHA，再递归冻结 canonical；validator 对 canonical 作完整 `isDeepStrictEqual`。无 runtime 安装，flags `accepted/runtimeInstalled/routeAccepted/wholeObjectCompleted` 均 false；8 个接口区域的实体柱数仍 null，横连位姿仍未接受。它是固定提案一致性合同，不是任意输入的建筑真实性认证器，也不会自动校当前全部源文件。
- 内嵌 roles/NE/recipe/knots 分别与外部 2104/2048/2112/2112 原件逐对象相等。recipe SHA 与每实例引用、knots 引用一致；原 RoofBuilder/HallKit/PalaceBuilder 三源 SHA 及 source-registration SHA 均实际相符。
- 188 个旧 path 独一；52 主楼保留、24 移除提案、88 模板移位、24 横连待定、16 内向轴新增的角色边界未改变。104 是 88+16 个可辨外圈候选位置，**不是完整历史柱数**。旧/新南排 1 px 读数分账保留，未重解释为两根实体柱。
- 2112 已正确分开下腰檐 **hipLineSteps=6 与 TubeGeometry segments=8**；源码确是 `hipLine(..., Math.max(6, ctx.seg.tube >> 1))` 后由 `ctx.seg.tube` 生成管。
- 下檐 `L=11.4*.03=0.34199999999999997`、inset=1.3679999999999999；旧内边 knot=4.332000000000001、上檐 eave=5.532000000000001 等均直接对齐配方，而非人为 epsilon 或十进制近似。
- 翼屋面配方恢复 **local base 6.5，在局部生成 Float32 顶点后 parent Y+12.3**；不再把 18.8 直接作为原几何生成输入。该坐标层级与旧源码一致；本轮未重新生成该屋面或证明其完整属性字节。
- 六实例每轴 old/new knots 一一对应且严格递增。翼 X 显式包括 old ridgeHalf 13.2 与 new `eaveHalfX-eaveHalfZ`，关闭之前插值到 21.79 与默认 23.15 左右两种选择的歧义。此选择是已声明的工程拟合，非新屋脊实测。
- 四亭 lower 新 inner/bearing/eave 与 upper footprint 的数值关系一致；NE 空间仍 `NE_PAVILION_LOCAL`，父平移另列，没有重复叠加原点。名义 .3375 m 间隔仍不等于可行走净廊。

独立算术和身份记录在 `input-numeric-audit.json`。Task1 的 19 个变异覆盖 false acceptance、接口错误实体化、角色/稀疏/NaN、NE 空间、柱径、源 SHA、厚度/lift、缺 ridge knot 及额外字段。递归 freeze 与 caller clone 隔离实际通过。

## 后续不可替代的验证

**P1 实体门禁继续保留**：数值 knot 必须成为瓦面与底面实际共同采样行，并核真实三角/边交点；基础剖面 Y 锚点与 corner lift、定半径管 Frenet 截面等派生 Y delta 分账。旧 apex 退化面移除须明确拓扑差异。完整 normal/UV/index/group/drawRange、材质、矩阵和资源所有权需真实实体负控，不由 knots 单调性推出。横连 24 位姿及专用物理、东北独立围护、真实上层承托与完整平台 FP 未关闭；8 个接口未知不造门/柱。

**Task2 前驱口径**：`IMPLEMENTATION-PLAN-PHASE1-2112.md` 已明确 castShadow/receiveShadow/frustumCulled 和全部列出的几何、对象、材质、物理字段；捕获只能声明这些记录字段完整，而非所有 JavaScript 行为。当前 fixture 是 base-color、tile/aspect=1；它不代表真实 TextureLibrary maps、production UV 或 canonical finish/merge，后者须另验。必须在捕获时验证准确 600 源闭包，不仅信本 Task1 JSON 中的 3 个 SHA 字符串。现有 2056 bounds/position 签名不替代 Task2 完整基线。

**P2 复现说明**：外置 `make-roof-recipe.py` 保持生成历史 2108 版，不能直接称为当前 2112 recipe 再生器；本轮可靠消费对象是已经精确固定并完整嵌入 repo 的 2112 JSON。原 RED 和版本链应保留。不存在本轮 GPU、World、全套或远端复现结论。

## 关键 SHA

- `upper-contract.mjs`: `cc1d4815820c25649b177e861af45d0a1277adb16818d16d3cf4cfcda6af4bbe`
- `upper-contract.json`: `a4cf1263ae9a8cac38a4e0002458bc8cf413b6426cb59bad9c56575c1227e4b2`
- `upper-contract.test.mjs`: `e401f16ca3d6518af13fd4bf75b350d56abb5c8e3f1dd02e07d62bb000adfa2b`
- `OLD-ROOF-RECIPE-2112.json`: `ce14c0f4213a2d19b70ff4ad78b3a1979b5c26614d70e222890290ee917bde81`
- `ROOF-KNOT-PROPOSAL-2112.json`: `8a3e1ab3c7abe244d131063d0387721e9d9f4125c7529492778415fcf66a7766`
- `IMPLEMENTATION-PLAN-PHASE1-2112.md`: `12ae23517ff7cb401b1a7d888df6c5114dacd3b33af50b2b5ea51ef40fbae6ab`

本报告仅独立补审 Task1 与 2112 数值修订，不回写或扩大此前 2108 报告的验收范围。
