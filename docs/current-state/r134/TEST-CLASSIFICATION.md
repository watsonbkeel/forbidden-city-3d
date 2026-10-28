# R134 旧断言与当前证据对照

保留所有历史测试原文和失败名，不删除断言制造全绿。当前累计门分开列“新针对门”“历史固定快照”和“真实几何后继验证”。标准112文件集合的最终多重集比较见 `reports/r134/gates/final-gates.json`。

| 保留的失败名/门 | 具体原因 | 后继证据与限制 |
|---|---|---|
| R124 all collision, support, room, map declarations and shared rest still equal R123 | R130 明示增加有限完成面/柱面，不能再与 R123 所有 collider payload 精确相等 | R130 59项实源清单、有限域反例、完整 canonical 三频三操作；未改渲染几何 |
| R123 moved corridor ramps support the complete original foot on actual F32 visible faces | 新真实三角有理数见证向上舍入与旧工程坡算式 strictEqual 相差5.55e-17 | 原断言不改；实际成品三角 endpoint及accepted microstep 0，未放宽 oracle epsilon |
| R123 emperor changes only the connected courtyard tail… | R129 明确修改太和起步六节点，不再满足1928点旧前缀原样 | 历史prefix SHA保留并标historical、当前prefix SHA另记；95,634建筑三角完整帝妃三频去返0/0/0 |
| R119 preserves exact R118 navigation… | 同上，早期全导航哈希不能代表后续已授权六点修复 | 版本来源与节点差异明确；不把历史hash当当前hash |
| R113 Lijing local body uses only its live existing floor… | 旧夹具硬设脚底.45；真实保留地砖.47/地毯.474，旧脚底处已是穿入实际面 | 使用真实完成面与完整路径的后继脚域验证；没有删除床/桌或缩小身体 |
| R113 two fitted front wings preserve scale… | 旧422前翼坐标，R123已改417；既有失败 | 前后版本原始位置记录和储秀累计通路证据保留，不作为R130新增成功 |
| rear accepted quality scope preserves high and physical contracts | 旧rear几何/物理固定快照已经被后续已授权院落更新超越 | R126→R131东西六宫低/高4组全网格属性/index/world matrix/draw group hash完全相同；材质仅核脚本列出的name/color/opacity/side/transparent/depthWrite，不称所有材质标量/纹理字节全核 |

## 工作树恢复诊断，不混作产品缺陷
首轮稀疏工作树未物化旧375KB R126 physical fixture，以及旧报告写出目录，产生 ENOENT。只恢复已在Git中的fixture和670个目录骨架；首轮raw保留于`initial-gates`。后续完整重跑在`gates`，R126 targeted8/8通过。没有下载或恢复巨型旧版本副本。

## 真实负例仍是负例
R130 18个承乾额外边界探针中15个不完成：373.55在30/60Hz的原返程停点与freshR126一致；373.70在原本穿入的真实柱脚前被阻挡。108个正向canonical/局部组合完成，不能把这15项混记为通过。西侧人工空投(99,448)位于原桌边内部的失败raw保留，不以它证明通路；正向种子取实际已走路线(98.37,448)。

实际 GPU、手机、完整任意路线、网络下载/首次shader、连续全宫扫掠均未以CPU门代替。

## R134新增的预算失败，不是旧失败
`R124 no new texture request and bounded real geometry/material allocation` 的相对R123≤4000三角断言新增失败：110603→115687，累计+5084，超旧上限1084。R134自身新增1088符合本阶段DESIGN的≤4000增量预算；不修改旧上限，不声称全门绿。明确后继 `tests/r134/resource-bound.test.mjs` 核低高新增1088tri/104448bytes、同104mesh/104materials/36texture、43实际请求。CPU三组交替成本无稳定性能收益结论。其他七个针对集合历史失败继续保留。

R134新增主阶/两前配完成面及22挂饰意味着不能继续用R131整区renderhash相同证明所有新增物。R134门裙保同域；22挂饰world-F32与实际owner逐三角绑定、闭边/正体积、完整身体高处接触及卸载重建后继门独立核。非目标物理旧声明过滤本版新增owner之后精确保持。
