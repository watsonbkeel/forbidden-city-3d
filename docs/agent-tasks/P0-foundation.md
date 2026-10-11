# P0 · 底座重构（推荐模型：opus5.5 high）

> 本任务阻塞所有 Phase 1 任务。完成前不得启动任何并行任务。
> 控制文件：`docs/ARCHITECTURE-1to1.md`，先完整阅读第 1、2、3 节。

## 背景
项目 `forbidden-city-3d/` 是 Three.js r162 + Vite 的故宫第一人称漫游，全程序化生成。
当前宫城尺度约真实 0.5 倍（内皮 380×640m，真实 753×961m）。目标：1:1 复刻 + 分区加载。
坐标约定：+Z 北，-X 东，原点太和殿中心，单位米。

## 前置动作
1. `git tag pre-1to1` 锁定当前 main（若 tag 已存在跳过）。
2. `git worktree add ../fc-p0 -b feat/p0-foundation`，在 worktree 中工作。
3. 运行 `npm run dev` + `node tests/stepwalk.cjs 60,10 0,1 all` 和 `node tests/regression.cjs`，记录基线（应全绿）。

## 任务清单

### P0-1 坐标迁移到真实米制
- `src/config/constants.js`：`LAYOUT.*_Z`、`DIMENSIONS.*`、`BOUNDARY` 按真实数据重算。参考值：
  - 宫城内皮 753(E-W) × 961(N-S)；午门中心到神武门中心约 850m
  - 太和殿 面阔 64m 进深 37m 高 35m（含三层台基 8.1m）；中和殿 24.2×24.2；保和殿 49.7×24.9
  - 乾清宫 约 46×20；坤宁宫 约 46×20；交泰殿 约 15×15
  - 其余按比例，标注 `// estimated`
- **不改** `PLAYER.*`（身高/速度/台阶高度是人体尺度）；步速可在 P1-U 调。
- `src/scene/Layout.js` 同步；`tests/stepwalk.cjs` 路线坐标同步（找到路线定义处，按同一比例换算）。

### P0-2 数据 schema + 中轴 JSON
- 新建 `data/schema.md`：按控制文件 2.1 写完整字段说明（hall/gate/wall/courtWalls/corridor/cityGate/region/garden/moat/river/outer_wall）。
- 新建 `data/zones/axis.json`：把 `PALACE_LAYOUT` 转为 zone JSON，bounds 覆盖中轴 ±45m。

### P0-3 ZoneBase + ZoneManager
- `src/scene/zones/ZoneBase.js`：
  ```js
  class ZoneBase {
    constructor(library, zoneJson)   // 内部 new CourtKit(library, zoneJson.id)
    build()  // 遍历 items，按 kind 调 kit 对应方法；返回 { group, colliders, walkables, rooms, mapItems, silhouette }
    update(dt)
    dispose()
  }
  ```
  `silhouette`：本区所有屋顶的合并低模（无阴影、单材质），用于远处替身。
- `src/scene/zones/ZoneManager.js`：
  - `register(zoneJson, BuilderClass = ZoneBase)`
  - `update(playerPos)`：所在区 + `neighbors` 常驻；其余区仅显示 silhouette；进入新区时 **分帧构建**（每帧 ≤ 8ms，用 `requestIdleCallback` 或时间切片）
  - 与 `CollisionManager` 联动：加载时 `addColliders/addWalkables`，卸载时移除（需给 CollisionManager 加 `removeByTag(zoneId)`）
  - 启动时校验各区 bounds 无重叠，有则 `console.warn`
- `main.js`：用 ZoneManager 替代直接 `new SideCourts().build()`；中轴 axis 区标记 `alwaysLoaded: true`。

### P0-4 SideCourts 拆分为 zone JSON（占位版）
- 把 `SideCourts.js` 各方法（axisCourts / sixPalaces / eastOuter / westOuter / ningshou / westNorth / gardenWalls）中的调用**机械转换**为 JSON items，写入：
  `data/zones/{axis-courts,east-six,west-six,ningshou,outer-east,outer-west,garden}.json`
- 坐标按 P0-1 的比例换算（粗调即可，细调是 Phase 1 的事）。
- `SideCourts.js` 保留但标记 `@deprecated`，Phase 2 删除。
- 写 `tests/zone-lint.cjs`：校验每个 JSON 符合 schema、item 在 bounds 内、gate 的 `w` 与 wall 的 `gaps` 对齐。

### P0-5 PerfHUD
- `src/ui/PerfHUD.js`：F3 切换显示 `renderer.info.render.calls / triangles`、fps、`renderer.info.memory.geometries/textures`、当前 zone、已加载 zone 列表。
- 开发模式默认开启，生产默认关闭。

### P0-6 性能基线测试
- `tests/perf.cjs`：复用 `tests/shot.cjs` 的机位方式，在 6 个固定点（午门前、太和殿前、乾清门、东六宫中、宁寿宫、御花园）各采 60 帧，输出 `tests/perf-baseline.json`：`{ point, calls, tris, fpsAvg, fpsP5 }`。

## 验收标准
- [ ] `npm run build` 无报错
- [ ] stepwalk 96 条全绿、regression 全绿（坐标已换算）
- [ ] zone-lint 全绿
- [ ] PerfHUD 可用；`perf-baseline.json` 已生成并提交
- [ ] 走出中轴进入东六宫时 PerfHUD 显示 zone 切换，无掉帧 > 100ms
- [ ] `docs/agent-tasks/REPORTS/P0.md`：改动清单 / 基线数据 / 接口说明 / 遗留问题

## 禁止
- 不改 `PLAYER` 参数
- 不引入新 npm 依赖（three 已够）
- 不动 `src/render/*`、`src/scene/palace/interiors.js`（归 Phase 1）
- 不修改 schema 以外的接口形态而不写进 `data/schema.md`
