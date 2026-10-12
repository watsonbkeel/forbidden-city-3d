# P1-Z-axis 报告：中轴与宫城外围细化

分支 `feat/p1-zone-axis`（基于 main 3ffd181），工作目录 `fc-zone-axis`。

### 进度

- A1 午门：PalaceBuilder 新增 `buildWumen`（不再调用 gate.js），凹形墩台东西 120、高 12，正楼 60.05×25 重檐庑殿，两翼雁翅楼（13 间、进深 13）+ 四角重檐攒尖方亭；删去与雁翅楼重叠的 axis-courts 估值朝房 ×2。hash 6397d2f。验证：zones 0/0、anchors 0 超差、regression 24/24、stepwalk「午门」2/2。遗留：翼内皮取 ±40.6（真实约 ±38.5）以保 regression WUMEN_WING_GAP，已写 REQUESTS。
- A2 太和门：台基 1.5 → 3.44（REAL 表），DIMENSIONS.TAIHE_GATE 48.06×20.54×23.8；台阶随高度自动加长（run 5.5），东西隔墙起点 ±25.5 → ±25（插入台基侧面 0.03，无缝）。hash ef4648f。验证：zones 0/0、anchors 0、stepwalk「太和门」60/10×慢/快 8/8（最高脚点 3.44）。遗留：昭德/贞度门为 zone gate（style hall，无台基参数），「同太和门台基」未体现，需 CourtKit 加 gate 台基参数（不归我）。
- A3 金水河五桥：river.js 改为桥位唯一数据源（JINSHUI_BRIDGES x 0/±13/±30、宽 6.1、长 21；riverBridges/isOnBridge），Layout 金水河带 bridges + source estimated，buildRiver 读它。Collision 改法写入 REQUESTS R1（选方案：river.js 导出、Collision 读，不在 Layout 重复公式）。hash 见 A4 行。验证：zones 0/0、anchors 0、stepwalk「金水桥」8/8；regression 几何断言全过（桌面截图步骤因机器负载 22 超时，A6 重跑）。遗留：河身弓形 / 河宽无实测，仍为 100×15 矩形；Collision 未改前 x=−13 中线会被挡（R1）。
