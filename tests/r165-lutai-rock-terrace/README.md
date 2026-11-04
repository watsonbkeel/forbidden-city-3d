# 露台岩台与通路一期检查

冻结da2cb44791efe4ae160aeb3e545efc1b1f256232真实ZoneBase及全src/data清单，不以候选倒推旧区。只新增有限主体和一次同步hook139，公共物理/渲染/20落点不改。

## 复现

- 轻量18项：`node --test --test-concurrency=1 tests/r165-lutai-rock-terrace/{red,component,controller,high,jump,ascent-contact,lifecycle,negative,source,yizhai-retention,ledger}.test.mjs`
- 串行真实宁寿：`node --test tests/r165-lutai-rock-terrace/production-zone.test.mjs`。可设LUTAI_EVIDENCE_DIR为已有目录保存完整结果JSON。不要与大构建/另一单区并行；不构建World。
- 累计清单见docs/current-state/r165-lutai-rock-terrace/BOUNDED-TEST-FILES.json。保留3项旧红而不称全绿。

60走跑双向/多帧率路线、8岩体阻挡和西栏板删除负控；20普通跳跃，阶上允许落高一级0.15m但必须真面支撑、无身体相交。80高落为20空间起点×4帧率；前5秒自然下降只核末状态，之后连续退出每帧核身体无相交和最终到地，不称任意起点/方向均通。

原北阶高落后继续向上再从南端退出，80探索都到地但69采样帧普通阶体/平台clearance重叠，最大约0.163601m，无岩壁/栏杆接触。正式ascent-contact保留该相对路径、仅指定普通阶/平台、<0.17m上限、到地及峰值松键<=0.12s消退。没有把它描述为纯Float32或零接触。整体北移前起点z381、后继对应z383.2。

新实际累计发现初版南阶阻断旧抑斋高落退出；原60条Yizhai high-runner一字未改，双组件旧过/新红后整体北移2.2m，真实da2新reserve重新核空。新yizhai-retention直接复用全部60条，防止只换自己的绕路掩盖旧通路。新邻接路线的首段曾斜穿旧抑斋后阶而脚高0.113m；明确选南侧外空地折线，不放松地面高度断言，旧路径不变。

几何/材质先登记再填充，故障本体释放、宿主不部分提交；finish/release与三轮CM清空再注册保留。所有旧运行源逐字保护，仅精确剥离本轮import/yield/call。不是整露台/整院/完整World/GPU验收。
