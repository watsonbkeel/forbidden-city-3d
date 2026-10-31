# 北口竖衬：独立复核

2026-10-31 01:10 UTC。目标为 `r157-wumen-integrate/src/scene/palace/special/WumenLowerBase.js` 本轮north-vertical-jamb-lining，未改生产/测试。亲看 `cpu-candidate-north-jamb/north-source-conditioned.png`。

## 结论

材质分区修复正确且守住近口范围；无新增物理阻断、叠贴缩孔或漏面证据。**有一项小而真实的UV相位接缝待修**，不能报告“UV完全连续”。该问题不推翻空域/碰撞验证。

## 独立证据

- 独跑 `node --test tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs`：12/12通过，包含实际production材质合批后jamb射线和五北净口。
- 私有 `independent-jamb-check.mjs/.json`：10个jamb（五口各两侧）三角面积分别严格等于spring×1.2（容差1e−5），所有顶点落z17.4…18.6、y0…spring、既有孔边面；306条非网格边界侧射线在孔边相同深度仅1次brick交点。无共面红/灰双层，无缺失壁面。
- 将原ning pre-jamb与集成candidate的全部lower collider序列（含AABB、overhead、triangle模板/offset）序列化比对，hash相同，记录于JSON。因此本轮只是可见面材质分拆，没有衬板缩孔、改变门宽或改变旧门叶/头碰形体。
- BoxGeometry第0/+X、第1/−X面选取正确；selected与retained索引互补。applyBoxUV消费并dispose临时indexed clone，返回nonindexed owned lining；原mesh保留其余面且清groups。共享库砖材质未新克隆/释放。新增水平箱体分层接触面在实体内部，不是洞口共面贴片。

## UV问题及最小建议（只建议，未改）

`applyBoxUV(geo,tileSize)`当前使用分层box局部y，1.2m以下与1.2m以上每块居中位置不同，砖行V相位重启。私有fixture tileSize=1下，王门jamb在y=1.2±1e−5的V分别约0.59999与−1.12499，跳−1.72498，并非repeat整数周期；其它jamb同样存在相位重启。实际库tileSize会缩放此差值，但不会自动保证相位吻合。

最小处理是仅lining调用传入 `offsetV: m.position.y / tileSize`，使该竖侧表面的V统一按根节点y；两层z中心相同，U本轮不需要为纵向连续额外变化。再测y1.2及其它分层交界上下UV差仅反映真实微小高度差，并检查实际合批UV不丢失。不要以补细分几何或新增重叠面来遮缝。

## 来源范围与CPU

灰/灰褐竖侧壁在自身北图可见，本次仅北1.2m已知口颈，未扩展到深隧道、L转角或南广场侧掖口，范围守住。CPU能看到灰竖侧与弧底形成完整近口衬里；仍存在无实机阴影、后方红面等图像现象，不应再据此把未知深洞全部涂灰。四亭大轮廓与既有轴线残差不由此小修解决，保留上份报告。

## 冻结期间私有最小修复验证（01:11 UTC）

按父要求不改变正在全套读取的生产。`private-jamb-uv-fix-check.mjs`自动读并复制模块到同目录 `WumenLowerBase-private-offset-v.mjs`，仅唯一jamb UV调用加入上述offsetV；生产前后SHA均为 `3f4b249ab169b6c91e5cd6ecfb8363b358cd1b52554662ea99f67b3c8fc8885e`。

脚本从实际jamb片段提取全部内部分界，不只y1.2（邻口spring不同会多分一段），共14处：现生产负控14/14发现相位重启；私副本14/14连续（最大误差2.385e−8）；真实builder.finish合批后14/14连续（最大误差1.464e−15）；lower collider序列hash相同。结果 `private-jamb-uv-fix-check.json`。这是私有修复证明，不冒称生产已改或最终全套通过。
