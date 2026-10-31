# 午门下层实际候选：独立代码/物理核查

2026-10-31 00:47 UTC。只读生产及测试；仅写本目录私有脚本/结果。未重跑全世界，未混入上层研究验收。

## 结论

未发现本轮下层连通/实体碰撞阻断；可进入来源双机位残差核对。不是全世界或GPU接受。明确一项保留差异：旧主/翼base-band盒横向与纵深各加0.2（每边伸0.1），新分格band不再加伸出，外周白基座投影整体退0.1；不影响本轮路线通过，但不能声称所有非洞区域逐顶点保留。顶台三块的尺寸/pose另有显式严guard，不能把band差异混称顶台漂移。

## 独立执行证据

- `independent-lower-check.mjs/.json`：23,836个点式tiny-body体积探针；将五条空域并集及32段北券下缘作独立解析，与实际注册普通/三角碰撞比对，0不符。门扇近域在此网格剔除，后续单独测。不是声称全部身体路线覆盖。
- 同脚本5北券头连续上撞返回head-impact、5个高落返回foot-impact且落12.3台顶；5个平内顶limitUpwardFeet按实际净顶拒入，合计10个位置组（其中北组各查上下）。两侧口平顶上/下、1.3m余墙、L主翼接缝通口均核查。
- `independent-lower-mesh.mjs/.json`：3,164条实际Mesh北口/侧口lip射线，与分段券顶/平顶空实一致；10扇真实门叶各自实体中心被对应triangle owner覆盖。侧口确为平顶，不是旋转北券头。
- 独立运行 `node --test tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs`：4/4通过，包括12.3台顶微精度回归。
- 阅读并解析父已有 `lower-routes-precision.json`：28条均arrived（20五门/8马道）；此28路线由父运行，本审未冒称重跑。

## 代码核查

1. PalaceBuilder只替换本体下层旧块，旧 `buildWumenNorthPortal`/旧registerOverheads/旧三门leaf构建不再调用，旧head collider与mesh在捕获树中不存在；新十门叶owned geometry各有独立triangle ID。上层变化另审。
2. 空域有限分格真实切掉红墙及base-band，不是贴黑片；主台与翼台接缝共享切口，两个L角交集完整。全高普通实体注册0…12，不再3m假墙。内平顶以explicit overhead注册，北闭合cap/lining以三角实体注册，台顶与门扇也同形三角。
3. `triangleBody`拷贝实际局部Float32顶点到Float64 BufferAttribute，再乘双精度matrix；没有重新把世界Y量化回Float32。台顶与渲染同一组局部顶点/pose，因此修复0.19µm阻挡是消除额外量化，而非碰撞高度人为削薄。
4. `WumenTransverseLinks`以明确6个实际endpoint引用及新lower.platform取代不再成立的child索引。所有endpoint要求唯一、直属parent、旧位置/旋转/缩放；floor要求属于lower-root、root单位变换、原pose/材质及position/normal/uv逐元素同原盒。无效空数组/重复endpoint/空对象3例均在新增mesh/collider前抛错。guard保证所有权和pose，非证明endpoint内部所有几何永远未变；上层结构改动仍需单独审。
5. lower own合同先验证午门name、精确尺寸、finite位置、布尔开闭，再分配。当前explicit link仅原锚点接入；translated fixture不强套link。共享库材质未dispose，新漆料进入builder.ownedMaterials；prism/door/slab几何由场景builder生命周期持有，临时triangle复制geo在finally释放。
6. 内部直角/平顶、sideZ及当前开门策略均有unknown/gameplay标签，未伪称现状复原。新南canopy依central profile匹配，旧9/5强制合同不会被偷偷绕过。

## 本轮哈希

- WumenLowerBase.js `48a7db6987234cae2fb80ca08c094c4224b8395c9646071b4213b2d41f44d5c4`
- PalaceBuilder.js `aa5c443643bc4b6040ac15b5fc2fef93fc6d3e255bc0ae7b55ecb7020632544a`
- WumenTransverseLinks.js `dff442a3df86cf4511605652ebb6994ca6ba2fec6d61378bc5ef19d5b587dabd`

上列是本轮检查瞬时树，不代替父最终冻结hash。待项：双机位来源投影、实际全角色跳/墙侧边与更多掉落终态、完整集成回归、浏览器GPU。没有将历史旧±17.5/9m断言失败记为本候选新物理故障。
