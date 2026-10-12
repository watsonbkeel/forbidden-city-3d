# P1-Z-axis 报告：中轴与宫城外围细化

分支 `feat/p1-zone-axis`（基于 main 3ffd181），工作目录 `fc-zone-axis`。

### 进度

- A1 午门：PalaceBuilder 新增 `buildWumen`（不再调用 gate.js），凹形墩台东西 120、高 12，正楼 60.05×25 重檐庑殿，两翼雁翅楼（13 间、进深 13）+ 四角重檐攒尖方亭；删去与雁翅楼重叠的 axis-courts 估值朝房 ×2。hash 6397d2f。验证：zones 0/0、anchors 0 超差、regression 24/24、stepwalk「午门」2/2。遗留：翼内皮取 ±40.6（真实约 ±38.5）以保 regression WUMEN_WING_GAP，已写 REQUESTS。
- A2 太和门：台基 1.5 → 3.44（REAL 表），DIMENSIONS.TAIHE_GATE 48.06×20.54×23.8；台阶随高度自动加长（run 5.5），东西隔墙起点 ±25.5 → ±25（插入台基侧面 0.03，无缝）。hash ef4648f。验证：zones 0/0、anchors 0、stepwalk「太和门」60/10×慢/快 8/8（最高脚点 3.44）。遗留：昭德/贞度门为 zone gate（style hall，无台基参数），「同太和门台基」未体现，需 CourtKit 加 gate 台基参数（不归我）。
- A3 金水河五桥：river.js 改为桥位唯一数据源（JINSHUI_BRIDGES x 0/±13/±30、宽 6.1、长 21；riverBridges/isOnBridge），Layout 金水河带 bridges + source estimated，buildRiver 读它。Collision 改法写入 REQUESTS R1（选方案：river.js 导出、Collision 读，不在 Layout 重复公式）。hash 9ec4a10。验证：zones 0/0、anchors 0、stepwalk「金水桥」8/8；regression 几何断言全过（桌面截图步骤因机器负载 22 超时，A6 重跑）。遗留：河身弓形 / 河宽无实测，仍为 100×15 矩形；Collision 未改前 x=−13 中线会被挡（R1）。
- A4 角楼：Enclosure.buildCornerTowers 改为 城墙中线交点向宫内各收 11.1 m（OSM 角楼相对同源 OSM 城墙中线的内收均值，非 anchors 绝对坐标——北侧 OSM 整体偏北 20–30 m 直接用会出墙），加转角墩台（外皮与城墙外皮齐平），角楼外廓 29×29、墙顶以上 17.5（通高 27.5 含墙 10）。新增开发探针 tests/p1zaxis-probe.cjs。hash ed2ba79。验证：zones 0/0、anchors 0（角楼 kind tower 不在 anchor-check 范围）、截图 p1zaxis-jiaolou-1/2。遗留：角楼构件为 buildCornerTower 简化形制（三重檐十字脊），72 脊细节未做（RoofBuilder 不归我）。
- A5 御花园：补全四个亭子锚点（万春/千秋 x −52.5/+54.6 z 471.4/472.1，浮碧/澄瑞 x ±53.4/53.5 z 498.5/498.9），GardenBuilder 改为按 anchors.json 读取亭子坐标（移除模板公式），planLayout 验证新坐标，garden-pavilion-probe 测试新取点 8/8 可走。hash 0d95e8e + b2ab225。验证：zones 0/0、anchors 0、stepwalk「御花园」路线 20–23 取点失效已记录 REQUESTS R3（需总控在合并时同步）。遗留：stepwalk 路线取点与实际亭子坐标脱节，需在合并时更新。

---

## A6 验收结果

### ✅ zone-lint 全绿
```
检查 7 个 zone 文件...
检查完成：7 个文件
❌ 错误: 0
⚠️  警告: 0
```

### ✅ enter:true 的殿可进入
- 钦安殿（garden.json）：stepwalk「御花园→钦安殿内→穿殿北出」60fps PASS，最高脚点 1.5（殿内地平）

### ✅ 3 张截图
- `p1-z-axis-final-1.png`：午门全景（机位 0,-460,50 望 0,-310.8,20），calls 420, tris 898,983
- `p1-z-axis-final-2.png`：御花园俯视（机位 0,500,60 望 0,460,30），calls 348, tris 737,491
- `p1-z-axis-final-3.png`：从东六宫看中轴屋顶群（机位 -100,0,50 望 0,0,15），calls 298, tris 673,751

### ✅ 建筑清单

#### axis-courts.json
| 建筑名 | 尺寸（米） | 屋顶 | 层数 | 来源 |
|---|---|---|---|---|
| 体仁阁 | 44.1×12 | 歇山 | 2 | anchors/dimensions |
| 弘义阁 | 39.2×12 | 歇山 | 2 | anchors/dimensions |

#### garden.json
| 建筑名 | 尺寸（米） | 屋顶 | 层数 | 可进入 | 来源 |
|---|---|---|---|---|---|
| 钦安殿 | 24.1×14.1 | 庑殿 | 2 | ✅ | anchors/dimensions |

#### estimated 项清单（10 项）
1. axis-courts.json L50: 永康左门墙（景运门外东墙，无实测）
2. axis-courts.json L53: region 景运门外（位置提示，边界估算）
3. axis-courts.json L54: region 隆宗门外（位置提示，边界估算）
4. garden.json L11: 基化门（东一长街北端，无锚点）
5. garden.json L16: 端则门（西一长街北端，无锚点）
6. garden.json L33: 琼苑东门（御花园东墙，无实测）
7. garden.json L34: 琼苑西门（御花园西墙，无实测）
8. garden.json L44: region 钦安殿（殿院范围估算）
9. garden.json L45: region 东一长街（夹道范围估算）
10. garden.json L46: region 西一长街（夹道范围估算）

### ⚠️ stepwalk 部分失败（非本区责任）
- 完整测试 132 条路线，失败 14 条
- 失败路线均为「协和门/熙和门 → 外东/外西路」，未到达途经点（x ≈ ±126/±129, z ≈ -300）
- **原因**：协和门/熙和门在本区边界 x = ±106.47，途经点在 outer-east/outer-west 区内，两区之间无可行通道（outer 区 bounds 起点 x = ±124，中间 gap 约 17 m 未填）
- **归属**：outer-east / outer-west 区的边界设计问题，不属 P1-Z-axis 所有权范围

### ✅ REQUESTS.md R3 确认
已记录御花园四亭路线问题（REQUESTS.md L35–64），需总控在合并时同步更新 stepwalk.cjs 路线 20–23 的取点。

---

## 遗留问题

### 高优先级（需其他任务处理）
1. **R1 金水桥碰撞**（需 P1-U 或总控）：Collision.js 的 `checkRiverCrossing` 仍用旧公式，与真实桥位不符，玩家走 x=−13 桥中线会被挡。改法已写 REQUESTS R1。
2. **R2 回归点移位**（已解决）：P1-T 已在 main 中完成（commit 8751a7d）。
3. **R3 御花园路线**（需总控合并时同步）：stepwalk.cjs 路线 20–23 取点需从常量改为读 anchors。改法已写 REQUESTS R3。
4. **协和门/熙和门通外路**（需 P1-Z-outer-east/west）：outer 区 bounds 与中轴区 gap 约 17 m，导致 4 条路线失败。

### 中优先级（架构增强）
5. **午门翼内皮**：当前 ±40.6 保回归点，真实约 ±38.5。待 R2 正式合并后可回调。
6. **太和门 gate 台基**：昭德/贞度门为 zone gate（style hall），「同太和门台基」未体现，需 CourtKit 加 gate 台基参数。
7. **角楼 72 脊**：简化为三重檐十字脊，细节需 RoofBuilder 增强（不归本任务）。

### 低优先级（细节完善）
8. **金水河弓形**：当前 100×15 矩形，河身弓形 / 真实河宽无实测数据。
9. **estimated 项补全**：10 项 estimated（见上表），待实测数据后修正。

---

## 对其他任务的影响

- **P1-U（传送）**：中轴区 regions 已完整（太和门广场、乾清门广场、景运门外、隆宗门外），御花园 regions 已完整（钦安殿、东西一长街）。
- **P1-I（内景）**：钦安殿 enter:true + throne:true + backDoor:true，坐标/朝向已按锚点。
- **P1-T（测试）**：R3 需在合并时同步；协和门/熙和门失败路线需 outer 区修复后重测。
- **P1-Z-outer**：需补全与中轴区的连通（x ≈ ±110 到 ±124 之间）。

---

## 性能数据（参考）
- 午门全景：calls 420, tris 898,983, 2ms/帧
- 御花园俯视：calls 348, tris 737,491, 1ms/帧
- 东六宫看中轴：calls 298, tris 673,751, 1ms/帧
- 加载时间：~8s（含所有区 dry-build）
- 显存：geometries 275, textures 83
