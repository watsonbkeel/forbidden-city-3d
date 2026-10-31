# 午门上层阶段一前驱记录独立审查

**有限通过 Task2 当前前驱记录与保存；不批准新屋面实体、上层装配或生产接线。** 独立执行 Task2 新 6 项为 **6/6、exit 0**，实际完整 signature 与持久 v2 基线一致；加此前独立 Task1 5/5，为分轮 11 项覆盖，不冒称独立单轮 11 项。作者原 `final-11.tap` 的单轮 11/11 另已核内容。当前没有阻断该隔离基线保存的 P0/P1；实际屋面、UV、装配和平台 FP 门禁仍未关闭。

## 身份与实际运行

树 `r157-wumen-joint-layout-1622`，HEAD `a32c65150b1080077ad6f92848b3e32983332525`。`task2/freeze-2118.json` 的 6 路径（含旧 Task1 三路径）逐 SHA 全部相符。本轮实际枚举 src/data 完整集合，600 文件全部等于基线 sourceHashes、SOURCE-FINAL 清单及 HEAD Git 字节；未发现源软链。fixture SHA 也与基线相符。仅在外部独立目录写报告/日志，未修改 repo 源码、测试或基线。

实际命令：

```sh
node --test --test-reporter=tap tests/photo-fidelity/batches/wumen-joint-layout/upper-baseline.test.mjs
```

终态 6 tests / 6 pass / 0 fail / 0 cancelled / 0 skipped，TAP 2915.538273 ms，exit 0。原件 `current-6.tap/.exit` 在本报告同目录。随后一轮独立实际 fixture 轻探针 `probe.mjs`，6 类检查全部通过，exit 0；已释放窗口，无 World、FP、渲染、构建或远端执行。

## 实际记录与无损序列化

v2 原始 JSON **9,887,383 B**，gzip **323,488 B**。实际重放核到 **892 节点、188 根穿越平台高度的 cylinder 柱、452 collider 记录、16 walkable 记录**；188 是现有旧模型清单，不是拟议 180 或源图 104 的验收。

记录包含节点路径/类型/名字/userData、位置/四元数/缩放、local/world 矩阵、祖先、layers、visible、castShadow、receiveShadow、frustumCulled、renderOrder、矩阵更新标志；geometry 各 attribute 的原始 typed-array byte SHA、类型/长度/itemSize/count/normalized/usage/gpuType、index、groups、drawRange、morph 属性等；序列化材质、列明的 texture 参数/shape；以及实际整门 collider/walkable 数据。比较是完整记录 `isDeepStrictEqual`，不是只看 bounds、position 摘要或总数。

`-0`、非有限数和 undefined 使用显式 token，原值若恰有 numeric/primitive/escapedRecord 键则 escape，避免把真实对象误作编码 token。geometry attribute 始终保留原始字节摘要，不经过 JSON 数值重写。独立检查了 -0 与 +0 的区分、±Infinity、NaN、undefined、原形似 token 对象和 JSON 往返；改变 -0 为 +0 必须拒绝。没有 epsilon、数值容差或删字段来使持久基线通过。

作者原负控实际覆盖 normal/UV bytes、index、drawRange、emissive、castShadow、可见性/layers、matrixAutoUpdate、物理行漂移；恢复后再次匹配。独立额外实际变异为 opacity、material side、receiveShadow、真实新父节点平移、normal.normalized，以及上述编码区分，均实际拒绝并恢复后相等。

## 原记录与身份差的核实

- 首 missing-module RED 为 1 个文件加载失败，不是 6 个断言失败。
- `green-attempt1.tap` 为 3/4，CanvasTexture 资源 UUID 的不稳定真实暴露；后续 4/4。
- `persisted-red.tap` 为缺少 `decodeUpperPredecessorBaseline` export 的 **1 文件加载红**。
- 真正持久化 JSON signed-zero 问题的 **4/5 红**保存在名称误导的 `green-final.tap`，实际 exit 1；compact probe 定位 matrix 的 -0/0。文件名不能当终态证据。
- 显式编码负控 `encoding-red.tap` 为 0/1，后 `encoding-green.tap` 为 1/1；最终 `final-11.tap` 才是 11/11。
- 原 2115 gzip 未被替换；2118-v2 是源未变时的新捕获，不是找回旧丢失证据，也不是新实体反录为前驱。

v2 wrapper 中 capture-time helper SHA 为 `c3d5eb1d87b3d51f4a09a3d32803471eca4a9d49d7543570c5446275fe1501c4`，不是当前 helper SHA。本次独立把当前 helper 仅两处 decoder gzip/raw pins 换回 v1 值，所得字节 SHA **精确等于该 capture-time SHA**，因此能够确认本轮身份差确实只有这两处运输锁定值，不是未经记录的签名算法变化。

## 诚实边界与后续门禁

**P1 后续实体门禁未关闭。** 本轮捕获的是未改源的组件：`captureGate` 使用真实 PalaceBuilder.buildGate，但替换 `finish` 以保留未合批 group，材质来自简化 base-color library，tileSize/aspect=1。并非实际 TextureLibrary、production finish/merge、World 或 GPU。texture 像素未记录；shape/参数与 canonical UUID 不能证明图像内容或真实贴图 UV 正确。旧屋面完整列出的字段已重放，不代表新 roof generator、实际 knot 接触、去退化拓扑、法线/UV、派生 Y、东北围护、横连物理、未来移位柱脚承托已经实现或通过。

**P2 记录范围必须保持准确。** 该接口对已捕获 record 比较，不隐式重新捕获；签名会调用 updateWorldMatrix 刷新派生矩阵，不能宣传为绝不写矩阵缓存。它不替换/释放 geometry/material 或物理行，当前代码及检查支持这一有限资源所有权结论。它也不是任意 JavaScript 对象、函数、shader 回调、稀疏数组或恶意 getter 的通用无损/安全认证器；勿用“所有状态无例外”代替“全部列出的字段”。

**P2 源闭包不要偷换。** 捕获脚本在生成基线前确实检查完整源集合及 SHA；本轮也独立重核 600 源和 Git。持久 replay test 自身仅校 baseline transport/metadata 与实际 signature，没有重新校当前 600 源字节。未来测试若声称“完整源闭包 fail-closed”，须继续显式执行 source guard，不能只引用本轮一次核验，或以几何相同推断源码完全相同。此点不否定当前已独立核过的前驱身份。

本次保持既有黄金及历史失败，不宣称全套、World、GPU、全建筑完成或远端复现。允许继续按已批准阶段计划安全保存该离线基线；任何实体阶段另需数值/实际几何审查。

## 证据摘要

完整身份复算：`input-baseline-audit.json`；独立测试：`current-6.tap/.exit`；额外探针：`probe.mjs/.log/.exit/.json`。

- 当前 helper SHA：`368105e16dc15219c7e4451fea53d2cf4409ac22220f7603293745ab67b32644`
- 当前 test SHA：`862a5996eb5362bf687c02548e77bc0a60fbd7aea495bdfb311f69245a82d773`
- gzip SHA：`b582e5625227fbd5983e8dcca8800734e280451e3494a2da4fc83a3b5643b329`
- raw SHA：`fdcb51be87aa0a8f237f3cfd4d239f78cb49d11c7ec6a239f0b33639e95cf31c`
- fixture SHA：`89fad3aaf937b4db8bbeeff82dcf99f3538a87a2a04d5e41c778285985e0551f`
