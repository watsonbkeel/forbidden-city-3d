# 跨任务请求（Agent 写，总控分派）

> 当你需要改动不在自己所有权清单里的文件时，在这里追加一条，**不要自己改**。
> 格式：日期 · 发起任务 · 目标文件 · 需要什么 · 为什么 · 紧急度

| 日期 | 发起 | 目标文件 | 需求 | 原因 | 紧急 | 分派给 | 状态 |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## P1-Z-axis

### R1 · 2026-10-12 · src/utils/Collision.js · 金水桥桥位改读 river.js（中）

- **原因**：A3 起金水桥按 dimensions.md:85 放在 x 0、±13、±30，宽 6.1；数据唯一来源是 `src/scene/palace/river.js`（`riverBridges` / `isOnBridge`），Layout 金水河条目带 `bridges`。`checkRiverCrossing` 仍按旧公式 `p.x − W·0.3 + i/4·W·0.6`（W=100 → 0/±15/±30）、半宽 2.4 判桥面，与造型 / 桥栏 / ramp 不一致：±13 桥在 x∈[−15.4,−10.6]∖[−17.4,−12.6] 的部分，碰撞层视为水域。
- **现状影响**（在本分支未改 Collision 时）：stepwalk「东侧金水桥(x=-15)」可走（x=−15 恰好同时在旧桥 −15 与新桥 −13±3.05 内）；但玩家走 x=−13 中线会被挡（|−13+15|+0.5=2.5 ≥ 2.4）。
- **改法**（Collision.js）：
  - 顶部 import 加：`import { isOnBridge } from '../scene/palace/river.js';`
  - L180–182 替换为：
    ```js
      // 桥位 / 桥宽唯一数据源：src/scene/palace/river.js（Layout 金水河条目 bridges）
      if (!isOnBridge(river, position.x, radius)) return false;
    ```
    并把 L176 的解构改为 `for (const river of this.rivers) { const { position: p, dimensions: d } = river;`
- **验证**：regression 中 (10, riverZ) 仍阻挡（|10−13|+0.5=3.5 ≥ 3.05）、(0, riverZ) 可走、(2.5, riverZ) 被桥栏阻挡（桥栏碰撞 ±[2.9,3.2]… 见下注）；stepwalk「东侧金水桥(x=-15)」仍过（|−15+13|+0.5=2.5 < 3.05）。
  - 注：桥栏碰撞在 PalaceBuilder 为 bx±halfW±0.15（x∈[2.9,3.2]），regression BRIDGE_RAIL_X=2.5 能通过是因玩家半径 0.5 → 包围盒 [2.0,3.0] 与 [2.9,3.2] 相交。
- 分派建议：Collision 所有者（P1-U / 总控）。

### R2 · 2026-10-12 · tests/regression.cjs · WUMEN_WING_GAP 改到凹口中部（低）

- **原因**：真实午门墩台凹形东西约 120、雁翅楼中心 (±45, −450) 宽约 13（dimensions.md:79–80）→ 墩台内皮约 ±38.5；现回归点 (40, −433.6) 会落在西翼墩台内。A1 为保该点把翼内皮放到 ±40.6、主墩台南皮 −432.9（余量仅 0.1 m）。
- **改法**：`const WUMEN_WING_GAP = [30, -20];`（世界 (30, −439.6)，凹口中部，无论翼内皮取 38.5 还是 40.6 都是空地）。改后 P1-Z-axis 可把 `DIMENSIONS.WUMEN.wingInnerX` 回调为 38.5。
- 分派建议：P1-T。
- **状态**：✅ 已在 P1-T 中完成并合入 main（commit 8751a7d）。

### R3 · 2025-01-15 · tests/stepwalk.cjs · 御花园四亭路线取点更新（中）

- **原因**：A5 改 GardenBuilder 按 anchors.json 读取四个亭子坐标后，万春/千秋亭从模板 `x ±32, z = pz（园中心）` 改为真实坐标 `x ±52.5/54.6, z 471.4/472.1`；浮碧/澄瑞亭从 `x ±32, z gz0+23` 改为真实 `x ±53.4/53.5, z 498.5/498.9`。stepwalk.cjs 第 26 行 `GARDEN_PAVILION_X = 32` 及第 40 行 `pz = L.IMPERIAL_GARDEN_Z`（园中心）不再匹配真实位置。
- **影响范围**：路线 20–23（第 86–91 行）：
  - 20: 御花园→万春/千秋亭（东侧）
  - 21: 御花园→千秋亭(西)
  - 22: 御花园→浮碧亭(桥)
  - 23: 御花园→澄瑞亭(桥)
- **验证结果**（tests/garden-pavilion-probe.cjs）：新坐标下全部 8 个关键取点均可走（footY = 1.7，walkable = true）。
- **改法**（stepwalk.cjs）：
  1. 删除第 26 行 `const GARDEN_PAVILION_X = 32;`
  2. 删除第 40 行 `const pz = L.IMPERIAL_GARDEN_Z;`（该行在 buildRoutes 函数内）
  3. 在 buildRoutes 函数顶部（第 35 行后）添加：
     ```js
     const wanchun = A['万春亭'];
     const qianqiu = A['千秋亭'];
     const fubi = A['浮碧亭'];
     const chengrui = A['澄瑞亭'];
     ```
  4. 修改路线 20–23（第 86–91 行）：
     ```js
     ['御花园→万春亭', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [GARDEN_PATH_X, gz0 + GARDEN_S_ROAD],
       [GARDEN_PATH_X, wanchun.z - PAVILION_APPROACH], [wanchun.x, wanchun.z - PAVILION_APPROACH], [wanchun.x, wanchun.z]]],
     ['御花园→千秋亭(西)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [-GARDEN_PATH_X, gz0 + GARDEN_S_ROAD],
       [-GARDEN_PATH_X, qianqiu.z - PAVILION_APPROACH], [qianqiu.x, qianqiu.z - PAVILION_APPROACH], [qianqiu.x, qianqiu.z]]],
     ['御花园→浮碧亭(桥)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [fubi.x, gz0 + GARDEN_S_ROAD], [fubi.x, fubi.z]]],
     ['御花园→澄瑞亭(桥)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [chengrui.x, gz0 + GARDEN_S_ROAD], [chengrui.x, chengrui.z]]],
     ```
- **分派建议**：总控在合并 P1-Z-axis 到 main 时同步更新。
- **注**：路线 6「坤宁宫→御花园→神武门」（第 56 行）中的 `GARDEN_PATH_X` 仍正确（东西甬路 x = ±17 未变）。
