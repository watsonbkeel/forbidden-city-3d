# 故宫 1:1 复刻 · 架构方案与多 Agent 推进计划

> 版本 v1.0 · 2026-10-11 · 总控：当前 WorkBuddy 全局对话
> 本文件是所有开发 Agent 的"控制文件"。接口冻结后，任何 Agent 不得单方面修改 Schema / Kit API。

---

## 0. 现状诊断（基于代码实读）

| 维度 | 现状 | 1:1 后的问题 |
|---|---|---|
| 尺度 | 宫城内皮 380×640m（真实 753×961m），约 0.5 倍线性 | 线性只放大 2 倍，**面积与建筑密度放大 ~4 倍** |
| 布局数据 | `Layout.js` 中轴 JSON 化；`SideCourts.js` 330 行硬编码坐标 | 无法分区、无法多人并行、无法按需加载 |
| 构建方式 | 全部程序化（HallKit / RoofBuilder / CourtKit），无外部模型 | 外景可继续程序化；**真实内景程序化做不到** |
| 场景组织 | `CourtKit.finish()` 全场景合并为 1 个 group | 无法按区卸载；frustum cull 粒度过粗 |
| 性能手段 | mergeByMaterial、InstancedMeshPool、阴影 LOD(250ms)、匾额图集 | 已有基础，但缺 draw call 监控、无遮挡剔除、无 LOD 替身 |
| 测试 | Playwright: smoke / regression / stepwalk(96 条) / shot | **可直接作为多 Agent 合并门禁** |
| 导航 | 步行 5 m/s，冲刺 10 m/s | 1:1 后南北 961m，步行 3 分+；必须加传送 |

**核心结论**：瓶颈不是"地图大"，是"对象多 + 无分区 + 内景无管线"。先打底座再并行。

---

## 1. 目标架构

```
┌──────────────────────────────────────────────────────────┐
│ main.js (App 壳)                                          │
│   ├── ZoneManager        按玩家位置 加载/卸载 分区          │
│   ├── PerfHUD            draw call / tris / fps / 显存     │
│   ├── Teleport           小地图点击 / 快捷键 瞬移           │
│   └── 现有: Controls / Collision / PostProcessing / Shadow │
├──────────────────────────────────────────────────────────┤
│ data/                                                     │
│   ├── zones/*.json       每区建筑清单（真实米制坐标）        │
│   ├── interiors/*.json   重点殿内景陈设清单 + GLB 引用      │
│   └── schema.md          冻结的数据格式                     │
├──────────────────────────────────────────────────────────┤
│ src/scene/zones/        每区一个 Builder，只读本区 JSON     │
│   ├── ZoneBase.js        build(json) → { group, colliders, walkables, rooms, mapItems } │
│   ├── AxisZone.js        中轴（现有 PalaceBuilder 收编）    │
│   ├── EastSixZone.js     东六宫 + 乾东五所 + 奉先殿          │
│   ├── WestSixZone.js     西六宫 + 养心殿 + 重华宫            │
│   ├── NingshouZone.js    宁寿宫区                           │
│   ├── OuterEastZone.js   文华殿 / 南三所 / 箭亭 / 东华门     │
│   ├── OuterWestZone.js   武英殿 / 慈宁宫 / 寿康寿安 / 西华门  │
│   └── GardenZone.js      御花园（现有 GardenBuilder 收编）   │
├──────────────────────────────────────────────────────────┤
│ src/scene/interior/     内景管线                           │
│   ├── InteriorLoader.js  进殿加载 GLB(draco+ktx2) / 出殿 dispose │
│   └── InteriorFallback   未加载时沿用 interiors.js 盒子陈设 │
├──────────────────────────────────────────────────────────┤
│ src/render/                                               │
│   ├── BatchedBuilder.js  r162 BatchedMesh 替代 mergeByMaterial │
│   ├── OcclusionByWall.js 宫墙内/外 区块级可见性切换          │
│   └── ShadowSetup.js     阴影相机跟随玩家、半径 ≤ 120m        │
└──────────────────────────────────────────────────────────┘
```

### 1.1 分区策略
- 玩家所在区 + 相邻区 **常驻**；跨两区以上 **卸载**（dispose 几何体，保留 JSON 随时重建）。
- 区边界用宫墙对齐（故宫天然分区）。进出宫门触发加载/卸载。
- 远处区卸载后用 **屋顶剪影替身**（每区 1 个合并 mesh，无阴影）保持天际线。

### 1.2 内景策略（三档）
| 档 | 范围 | 做法 |
|---|---|---|
| S 高保真 | 太和殿、乾清宫、养心殿、坤宁宫、皇极殿、慈宁宫（6 座） | GLB 模型（Blender 建）+ KTX2 贴图，进殿加载 |

> 工具环境（2026-10-11 确认）：Blender 5.2.2 LTS 已装于 `/Applications/Blender.app/Contents/MacOS/Blender`，可用 `--background --python <脚本>` 无头建模导出。`gltf-transform` 未装，P1-I 启动时安装到 `/Users/watson/.workbuddy/binaries/node/workspace`（禁止 `npm install -g`）。watson 已确认 S 档走 Blender 路线。
| A 模板 | 东西六宫前殿、各门殿等约 40 座 | 参数化内廷模板：宝座/屏风/匾额/藻井/金砖地 |
| B 简化 | 其余 | 现有 `interiors.js` 盒子陈设 |

### 1.3 渲染预算（中端手机 30fps / 桌面 60fps）
| 指标 | 上限 |
|---|---|
| draw calls（可见） | ≤ 300 |
| triangles（可见） | ≤ 1.5M |
| 阴影投射物 | 玩家 120m 内 |
| 显存（纹理+几何） | ≤ 400MB |
| 单区加载时间 | ≤ 500ms（分帧构建） |

---

## 2. 冻结接口（Phase 0 完成后生效）

### 2.1 zone JSON schema
```jsonc
{
  "id": "east-six",
  "name": "东六宫",
  "bounds": { "x0": -200, "x1": -80, "z0": 330, "z1": 520 },   // 真实米制
  "neighbors": ["axis", "ningshou"],
  "items": [
    { "kind": "hall", "name": "景仁宫", "x": -130, "z": 350, "rot": 0,
      "w": 29, "d": 15, "colH": 6, "ph": 1.2, "roof": "xieshan", "layers": 1,
      "enter": true, "interior": "A:palace-front" },
    { "kind": "gate", "name": "景仁门", "x": -130, "z": 335, "rot": 0, "style": "wall" },
    { "kind": "wall", "from": [-145, 335], "to": [-115, 335], "h": 7, "gaps": [...] },
    { "kind": "corridor", ... }, { "kind": "region", ... }
  ]
}
```
`kind` 与现有 `CourtKit` 方法一一对应（hall/gate/wall/courtWalls/corridor/cityGate/region）。

### 2.2 ZoneBase 接口
```js
class ZoneBase {
  constructor(library, zoneJson)
  build(): { group, colliders, walkables, rooms, mapItems, regions, silhouette }  // P0b 增 regions（位置提示必需）
  update(dt)
  dispose()
}

class ZoneManager {                       // P0b 定稿
  register(zoneJson, BuilderClass = ZoneBase)
  init(scene, library, collisionManager, initialPos)   // 同步；启动时 dry-build 全部区收集 regions/mapItems/rooms
  update(playerPos)                       // 当前区+neighbors 常驻；距 bounds ≤40m 预载；>60m 卸载；分帧 8ms
  ensureLoadedAt(x, z)                    // 传送/测试用：同步加载该点所在区+邻区
  getRegions() / getMapItems() / getRooms() / getLoadedIds() / getCurrentId()
  onLoad / onUnload                       // 回调 (id, group)，main.js 用于维护阴影 LOD 列表
  dispose()
}
```
- zone JSON 的 bounds 字段为 `{ x0, x1, z0, z1 }`（P0b 定稿，与 CourtKit.region 参数一致）。
- 分区清单入口 `data/zones/index.js`（静态 import，构建期打包）。新增分区只在此登记。
- 等价性门禁：`npm run test:zone-equiv`（SideCourts 删除前有效）+ `npm run test:zones`（schema lint）。

### 2.3 坐标约定（不变）
+Z 北，-X 东；单位米，**1:1 真实尺寸**；原点 = 太和殿中心。

---

## 3. 推进阶段

### Phase 0 · 底座（串行，1 Agent，阻塞一切）
- [ ] P0-1 坐标迁移：`constants.js` LAYOUT/DIMENSIONS 改为真实米制；`PALACE_LAYOUT` 同步；stepwalk 路线坐标同步
- [ ] P0-2 `data/schema.md` + `data/zones/axis.json`（中轴先行）
- [ ] P0-3 `ZoneBase` + `ZoneManager`（加载/卸载/邻区预载/分帧构建）
- [ ] P0-4 `SideCourts.js` 拆为 6 个 zone JSON（坐标先 ×2 占位，细调留给 Phase 1）
- [ ] P0-5 `PerfHUD`（renderer.info，F3 切换）
- [ ] P0-6 `tests/perf.cjs`：固定 6 个机位采 draw call/tris/fps，输出 JSON 基线
- **验收**：stepwalk 96 条 + regression 全绿；perf 基线入库

### Phase 1 · 并行开发（6~8 Agent，各自 git worktree）
| 任务 | 所有权文件 | 模型 |
|---|---|---|
| P1-R 渲染性能 | `src/render/*`, `src/utils/MergeUtils.js`, `InstancedMeshPool.js` | sonnet5.5 |
| P1-I 内景管线 | `src/scene/interior/*`, `data/interiors/*`, `assets-src/interiors/*` | sonnet5.5 |
| P1-U 传送与 UX | `src/ui/*`, `src/controls/*`（只加不改碰撞） | gpt-6.1-sol |
| P1-Z1 东六宫区 | `data/zones/east-six.json`, `src/scene/zones/EastSixZone.js` | glm-5.3 |
| P1-Z2 西六宫区 | `data/zones/west-six.json`, `WestSixZone.js` | glm-5.3 |
| P1-Z3 宁寿宫区 | `data/zones/ningshou.json`, `NingshouZone.js` | glm-5.3 |
| P1-Z4 外东/外西 | `data/zones/outer-east.json`, `outer-west.json` + Builder | glm-5.3 |
| P1-D 测绘数据 | `docs/research/dimensions.md`, `docs/research/interiors-*.md` | kimi-k3 |
| P1-T 测试工具 | `tests/*` | gpt-6.1-sol / glm-5.3-flash |

### Phase 2 · 集成与审查
- 每个分支 → `npm run build` + stepwalk + regression + perf（不得劣化 >10%）
- 交叉审查：sonnet 代码由 gpt-6.1 审；gpt-6.1 代码由 sonnet 审；glm 内容由 opus 抽审
- opus5.5 终审后合入 main

---

## 4. 多 Agent 协作规则（硬性）

1. **文件所有权**：只改任务卡列出的文件。跨文件需求 → 写入 `docs/agent-tasks/REQUESTS.md`，由总控分派。
2. **worktree 隔离**：`git worktree add ../fc-<task> -b feat/<task>`，不在 main 上直接改。
3. **接口冻结**：schema / ZoneBase / CourtKit 签名 Phase 0 后只增不改。
4. **测试门禁**：合并前 `node tests/stepwalk.cjs 60,10 0,1 all` + `node tests/regression.cjs` 必绿。
5. **提交粒度**：每个任务卡 1~3 个 commit，message 以任务 ID 开头（如 `P1-Z1: 东六宫 zone JSON`）。
6. **不猜数据**：建筑尺寸优先取 `docs/research/dimensions.md`，没有的标注 `"source": "estimated"`。
7. **汇报格式**：完成后在 `docs/agent-tasks/REPORTS/<task>.md` 写：改了什么 / 测试结果 / 遗留问题 / 对其他任务的影响。

---

## 5. 模型分工依据

| 模型 | 角色 | 理由 |
|---|---|---|
| opus5.5 high | 架构师 / 终审 | 跨模块重构判断力最强，Phase 0 不容出错 |
| sonnet5.5 high | 核心实现 | 代码质量与 three.js 熟悉度高，承担性能与内景管线 |
| gpt-6.1-sol high | 独立实现 + 交叉审 | 不同模型族，审查视角互补；UX 与工具链 |
| glm-5.3 | 内容生产 | zone JSON 模式固定、量大，性价比高 |
| glm-5.3-flash | 杂活 | 跑测试、批量配置、文档同步 |
| kimi-k3 | 研究 | 长文本资料检索与结构化整理 |

---

## 6. 风险与对策

| 风险 | 对策 |
|---|---|
| Phase 0 迁移打断另一对话正在进行的开发 | 另一对话先提交并打 tag `pre-1to1`；Phase 0 在新分支做，完成后 rebase |
| 坐标 ×2 后台阶/马道/碰撞全部失效 | PLAYER 参数不变；只缩放位置和建筑尺寸，台阶高度等人体尺度常量不变 |
| 内景 GLB 资源体积爆炸 | Draco + meshopt + KTX2；单殿 ≤ 8MB；进殿加载出殿释放 |
| 多 Agent 坐标冲突 | 区边界在 schema 中显式声明，ZoneManager 启动时校验重叠 |
| glm 生成的 JSON 质量不稳 | 加 `tests/zone-lint.cjs` 校验 schema、边界、门与墙对齐 |
