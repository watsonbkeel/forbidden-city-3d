# 午门左／东掖门近叶 64 帽：独立有限组件评审

时间：2026-10-31 15:05 UTC。审查者：`/root/review_chunked_qa`。

## 结论先行

**允许作为有源、有限的单叶装饰候选继续后继验证；不代表整门、完整硬件、真实 World、累计门禁或 GPU 验收。** 当前组件范围未发现未解决的 P0/P1 生产缺陷。先前标准材质认证漏检已独立证实、保留 RED，并在 1456 QA 修复后重验通过。

独立最终轻测为 **新 12 + 原 lower 19 = 31/31，exit 0**；另以精确 `eec6847e` 前驱源独立重放金样 **2/2**，旧入口负控真实失败 **0 !== 1**。没有运行重 World、CPU exporter 或改动仓库生产/QA。

## 1. 输入身份与实际接线

树：`r157-restored-411214`；HEAD `eec6847e8783ad28cb95371f50eba7bbb98078c2` 加本轮 WIP。

本报告绑定 `wumen-left-leaf-evidence-1444/component-freeze-1456.json` 的六路径。15:04 再逐 SHA 校验全部一致；详见同目录独立 `final-input-cpu-identities-1504.json`。两生产字节为：

- `WumenLowerBase.js`：`7b04078aefacddab78921f56a3aa47f21facc260b47af044d31a7bf9836c6b89`
- `WumenLeftLeafStuds.js`：`52d65dcfb73fe46792a591338f5372b2267d4dd11b2a223083e14ada80dcb554`

实际 LowerBase 构建门叶时调用新 installer；只有 `east-yemen / side -1` 接受，另叶／西门返回 null。新组与原 leaf **同 hinge 下同局部位姿的兄弟**，不挪原 leaf，不扩大 leaf 自身 Box3；原 triangleBody 注册仍消费原 leaf。当前没有新增 collider 或 walkable，也没有借 QA 注入创建实际入口的结果。

验证包括开、闭与中间 45° 铰角的实际矩阵：帽组随同门铰，帽相对木叶姿态固定。这里只证明渲染对象跟随；不把中间铰角视作新加入的动态碰撞系统。

## 2. 原照位点及方位

先前独立源报告：`independent-wumen-left-leaf-1444/SOURCE-REVIEW.md`，SHA `974f4e66023aab72e58ee31cff0142d9e795b8b6a74c1c945ef5d4284f25650e`。

原图左掖门 JPEG SHA `d2e7d060d4c295b59a2d2721d2abffbfb15018e3eed82b6c88e6f1233c7b372e`。原照片及未缩放精确裁图均已亲看；作者裁图与原像素独立一致。来源：[原图片页面](https://condoret76.wixsite.com/forbiddencity/wu-door)。日期、摄影者和当前现场状态未经认证。

- 目标是照片**右侧较宽的近叶**，不是照片左边远叶。
- 从照片上到下 r1–r9、左到右 c1–c8：每行 c1–c7 共 63 位，加 **r8c8**，为 **64 可见占位**。
- c8 的 r1–r7、r9 共 **8 遮挡未知**；**0 确证缺帽**。不以未知处未建模推断真实缺失。
- r8c8 可辨圆帽位于同一红木叶，不属于石座；r7 暗／绿圆体仍是占位，不能误判空洞。r9c1 可见，不能移植右门的缺损表。
- east frame `Ry=-π/2`；近叶 side=-1 的 local -Z 闭门朝 +X、开门 90° 朝 +Z。照片左→右对应叶 local +X→-X。上述方向由独立矩阵计算与实际组件捕获核对，不是左右镜像猜测。

上述捕获坐标属于 **premerge 午门组件**；全城 finish 另加午门 z 原点 -419.6。不要将二者混作同一坐标或重复加原点。

归一位置 u=.07..93、v=.03..955，半径=.0275×保留叶宽以及 15mm 外凸均是**工程拟合**，非照片测量米制值。实际帽基底 z=-.11 与原 0.22m 厚木面接触，顶 z=-.125，无继承右候选首轮的 1mm 悬浮缝。统一金色不复制原照暗色／锈色。8 未观测位点留空是证据约束下的局部表达，不是完整修复。

## 3. 非目标、物理和生命周期

`before-eec.json` SHA `5249a98c5284cd9132d89c773c8fc7c487b1e5037a1aaf410b0de5149735cf7f`；其 LowerBase 前驱字节 SHA `d85a585607578f25cfb4e25b8f2db2ba39cd806241498bae1792344c8f52c1f6` 已独立与 Git 的 eec 原件核对。

独立 hash 锁定 loader 只换回该真实前驱 LowerBase，开／闭两次实际 capture 都复现原金样：**827 原对象记录、452 collider、16 support**。当前也在两姿态精确保留这些记录和完整物理数组摘要；包含既有右叶帽及成组外额，未缩成仅数量相等。827 的含义是 helper 明列的几何、矩阵、metadata、渲染标志、选定材质／贴图字段，不是全部 Three 对象属性或任意 GPU 行为穷尽证明。

正常实际 canonical finish 使用真实 TextureLibrary，64×132=**8448** 三角的位置数组与组件逐点一致，架构身份唯一保留，完整物理/支承摘要不变。正常 dispose 已随原 lower 的生命周期测试通过；非法／冻结宿主先拒绝，半途 ownership push 或 hinge.add 抛错会恢复旧 children/parents/owned 数量并尝试回收新 geometry/material。dispose 回调再抛也保留原错误，相关故障注入均通过。

## 4. QA 红绿及独立运行

独立证据目录：`independent-wumen-left-leaf-1452/`。

| 证据 | 独立结果 |
|---|---|
| `component-and-lower.tap`（1451） | 29/29，exit 0 |
| `baseline-proof.tap` | 精确前驱开闭 2/2，exit 0 |
| `prehook-negative.tap` | 仅实际入口项失败，0 !== 1；不是缺模块假红 |
| `material-blindspot-probe-1455.json` | 1451 verifier 确会漏过 emissive 与 flatShading 变异 |
| `component-final-1500.tap`（1456） | **31/31，exit 0，5635.87ms** |

最终命令在仓库 cwd：

```sh
node --test --test-concurrency=1 --test-reporter=tap \
 tests/photo-fidelity/batches/wumen-left-leaf-studs.test.mjs \
 tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```

最终 TAP SHA：`38dfc790f31f9e19ad93aa1f4c407a02b22b6160eb25b45e21f973e10ae828f2`。

负控不只检 metadata：缺 r8c8/r9c1、补未知 r7c8、隐藏／缩放／祖先状态、列反转、悬浮、顶点漂移、材质可见性／side／roughness／opacity、stale matrix、陌生嵌套 mesh、drawRange、vertexColors 均有实际变异拒绝。1456 另以独立标准材质调用 `Material.prototype.toJSON`、仅去随机 uuid 后精确比较，避免依赖实例 override，并真实拒绝 emissive/flatShading。该结论是标准材质序列化及列明字段，仍不称任意自定义 shader callback 全覆盖。

## 5. CPU 图片只读复核

已逐一亲看 `cpu-before-1457` 与 `cpu-after-1457` 的近斜、近景、东侧环境 **六张 PNG**。相同 camera 下可见新增帽位于正确近叶；r8c8 额外一位可辨，其余 c8 留空；外额、另一门叶及台基在对比中未呈现额外变化。

两套 PROOF 的 source SHA 绑定真实前驱／上述最终两生产源；六个 gzip 的逐字 SHA 均核过。每视图记录 **49,536→57,984，增量 8448**。作者黑盒 exporter 1/1 的原日志已只读检查，其测试将所有实际顶点／法线／颜色／side 三角行与独立真实 gate 遍历比较；本次独审**没有重跑 exporter 或声称已独立重算全部导出行差集**。

这些是全组件输入的局部门面 CPU 基色透视诊断，不带运行贴图、光照或阴影；不是浏览器/GPU截图、测绘相机匹配或整午门大形制认可。页脚已准确标明此边界。

## 6. P0–P2 与后继门槛

- **P0：未发现。**
- **P1（当前有限组件）：未发现未解决阻断。** 但不能据此宣布累计版通过：旧 591 源闭包在新增第 592 源后如何保持历史断言、有限比较视图、真实 World/路线和全套/batch/build 尚待后继验证。既有缺史门禁及整项未完成状态不由本报告关闭。
- **P2／证据边界：** 拍摄时点未知、8 遮挡位置未知、米制尺寸/均匀排布/统一金色为工程表达，其他叶与五金未做；15mm 纯装饰无独立碰撞，必须明说而非称厚实体物理已建。

后继任何删新组的比较视图必须先完整认证该唯一 64 帽目标，再在独立 clone 中移除，保留 raw World/路线；不能仅凭 material 名称、metadata 或数量过滤。旧 591 runner/gold/断言需原字节保留。拟议 592→eec591 历史源镜像应使用独立文件复制并逐 SHA 认证（硬链接不是只读隔离），不能把历史视图通过冒称真实592源通过。此方案尚未审其实施，不在本次批准范围。
