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
