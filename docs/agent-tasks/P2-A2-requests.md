# P2-A2：REQUESTS 遗留项处理

**目标**：处理 Phase 1 跨任务请求中的遗留项，确保架构一致性。

---

## 背景

Phase 1 在 REQUESTS.md 中记录了跨文件改动需求，其中：
- **R1**（金水桥桥位）：提交 9ec4a10 在 REQUESTS 中描述了改法，但实际并未修改 Collision.js
- **R2**（午门凹口）：已完成 ✅
- **R3**（御花园四亭路线）：待处理

本任务负责完成 R1 和 R3。

---

## 任务清单

### A2-1：验证并修复 R1（Collision.js 金水桥桥位）

**问题描述**（REQUESTS.md R1）：
- 金水桥真实位置：x 0、±13、±30，宽 6.1（数据源：src/scene/palace/river.js）
- Collision.js L180-182 仍按旧公式 `p.x − W·0.3 + i/4·W·0.6` 判断桥面
- 导致玩家走 x=−13 中线会被挡（误判为水域）

**验证步骤**：
1. 读取 `src/utils/Collision.js` L180-182，确认是否已按 REQUESTS R1 改法修复
2. 如果未修复，执行改法：
   - 顶部 import 加：`import { isOnBridge } from '../scene/palace/river.js';`
   - L180-182 替换为：
     ```js
     // 桥位 / 桥宽唯一数据源：src/scene/palace/river.js（Layout 金水河条目 bridges）
     if (!isOnBridge(river, position.x, radius)) return false;
     ```
   - L176 解构改为：`for (const river of this.rivers) { const { position: p, dimensions: d } = river;`

**验收标准**：
- Collision.js 按照 REQUESTS R1 改法修复
- `npm run test:regression` 通过（特别是金水桥相关测试点）
- 提交 message：`fix(collision): 金水桥桥位改读 river.js（REQUESTS R1）`

### A2-2：修复 R3（御花园四亭 stepwalk 路线）

**问题描述**（REQUESTS.md R3）：
- A5 改 GardenBuilder 后，四亭坐标从模板值改为真实值（anchors.json）
- stepwalk.cjs 第 26 行 `GARDEN_PAVILION_X = 32` 不再匹配真实位置（x ±52~54）
- 影响路线 20–23：万春亭、千秋亭、浮碧亭、澄瑞亭

**修复步骤**（按 REQUESTS R3 改法）：
1. 删除 stepwalk.cjs 第 26 行 `const GARDEN_PAVILION_X = 32;`
2. 删除第 40 行 `const pz = L.IMPERIAL_GARDEN_Z;`
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

**验收标准**：
- `npm run test:stepwalk` 132/132 全过
- 特别关注路线 20–23 是否正常
- 提交 message：`fix(stepwalk): 御花园四亭路线改读 anchors.json（REQUESTS R3）`

### A2-3：完整门禁验证

**命令**：`npm run test:gate`

**验收标准**：所有 8 个步骤全绿

---

## 所有权清单

**允许修改**：
- `src/utils/Collision.js`
- `tests/stepwalk.cjs`

**只读**：
- `src/scene/palace/river.js`
- `docs/D1/anchors.json`
- `tests/regression.cjs`

---

## 验收项

1. ✅ R1 验证与修复（Collision.js 金水桥桥位）
2. ✅ R3 修复（御花园四亭 stepwalk 路线）
3. ✅ test:regression 通过
4. ✅ test:stepwalk 132/132
5. ✅ test:gate 全绿（8/8）
6. ✅ 完成报告 docs/agent-tasks/REPORTS/P2-A2-requests.md

---

## 注意事项

1. **R1 改法务必严格按照 REQUESTS 中的描述执行**，不要自行修改
2. **R3 的四亭坐标从 anchors.json 读取**，确保与 GardenBuilder 一致
3. **提交规范**：每个修复一个 commit
4. **如果 Collision.js 已经修复过**，在报告中说明验证结果即可
