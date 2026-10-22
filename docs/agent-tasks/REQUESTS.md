# 跨任务请求（Agent 写，总控分派）

> 当你需要改动不在自己所有权清单里的文件时，在这里追加一条，**不要自己改**。
> 格式：日期 · 发起任务 · 目标文件 · 需要什么 · 为什么 · 紧急度

| 日期 | 发起 | 目标文件 | 需求 | 原因 | 紧急 | 分派给 | 状态 |
|---|---|---|---|---|---|---|---|
| 2026-10-12 | P1-R | src/scene/zones/ZoneBase.js 构建循环；src/scene/palace/kit.js finish | 允许新增内部build迭代器与finish分阶段合并，不改变公共build签名 | 当前只允许ZoneBase末尾接入，CourtKit.finish不可切片；预合并消除首次流式重复构建，但卸载重建仍可能超过8ms，需跨所有权才能严格完成R-4/R-6 | 中 | 总控 | 待审批 |
| 2026-10-13 | P2-A1 | data/zones/outer-east.json（补景）/ src/scene 园景 | 文渊阁院南入口按 D1 补「方池 + 单孔石桥」 | P2-A1 删除了虚构的「文渊阁门」（其 `w=40.5` 与文渊阁本体同值，系误抄；`docs/research/dimensions.md:406-414` 无此建筑）。院墙现以 12 m 洞口通行；D1 记载的真实南入口是「文渊阁前方池石桥」（方池~20 m + 单孔石桥，位于文渊阁正南）。建议后续补景时按此重建入口 | 低 | 总控 | 待办 |
| | | | | | | | |

## P1-U

- 2026-10-12 · 已解决（总控 10-12）· 落点改为安全搜索：门外 8 m → 前移至 6 m → 10/12 m → 街内由近到远至 1 m → 横移 ≤ min(门宽/2, 6 m)，并加视线检查（落点与正面之间无碰撞体）。88/88 通过，15 个点回退（见 REPORTS/P1-U.md）。所属区预加载已在 206eafb 解决。
- 2026-10-12 · **场景缺陷候选 → P1-Z-east-six / P1-Z-west-six** · 东西六宫二、三排宫门（及乾东五所）门前东西向夹道过窄：门正面到对街院墙（如 east-six courtWalls z1，x −114.6~−72.6，z 409.2~410.2）净距仅约 2.1 m，扣除玩家半径后只剩约 1 m 可站；对街院墙外还有一道矮墙/台基（如 z 408.4~409，y 0.45~3.45）。导致传送只能落在门外 1.5–1.75 m：钟粹门、景阳门、长春门、咸福门（1.5 m）、乾东五所（1.75 m）。真实夹道宽约 6–9 m（dimensions.md 东西六宫节）。建议：P1-Z 细化各宫院落时按真实尺寸核对前后两排院墙间距，修完后 `tests/p1u-teleport.cjs` 中这几个点应回到 ≥ 4 m。紧急：中。

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
- **状态**：✅ 完成 @ 65135dd（2026-10-13 补落）。说明：该改动原提交为 1feceed，但 1feceed 未进入 main（悬空提交），main 上 Collision.js 一直是旧硬编码公式；P2-A2 报告与提交 b82c404 曾据此把 R1 标为完成，属**误报**。2026-10-13 复核发现后按 1feceed 原样补落，regression 24/24、stepwalk 132/132 通过。

### R2 · 2026-10-12 · tests/regression.cjs · WUMEN_WING_GAP 改到凹口中部（低）

- **原因**：真实午门墩台凹形东西约 120、雁翅楼中心 (±45, −450) 宽约 13（dimensions.md:79–80）→ 墩台内皮约 ±38.5；现回归点 (40, −433.6) 会落在西翼墩台内。A1 为保该点把翼内皮放到 ±40.6、主墩台南皮 −432.9（余量仅 0.1 m）。
- **改法**：`const WUMEN_WING_GAP = [30, -20];`（世界 (30, −439.6)，凹口中部，无论翼内皮取 38.5 还是 40.6 都是空地）。改后 P1-Z-axis 可把 `DIMENSIONS.WUMEN.wingInnerX` 回调为 38.5。
- 分派建议：P1-T。
- **状态**：✅ 已在 P1-T 中完成并合入 main（commit 8751a7d）。

### R3 · 2025-01-15 · tests/stepwalk.cjs · 御花园四亭路线取点更新（中）

- **状态**：✅ 完成 @ b960b82（P2-A2 前置）
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
| 2026-10-12 | P1-I | `main.js`、`src/ui/PerfHUD.js` | 「碰撞检测」步骤后 `this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer })`；animate 里 `this.interiors.update(this.camera.position)`；PerfHUD 增加一行 `interiors.hudLine()`；`dispose()` 调 `interiors.dispose()` | InteriorLoader 已自测通过（p1i-loader PASS），但 main.js 不在 P1-I 所有权内，运行时尚未自动触发 S 档加载 | 中 | 总控（合并时顺手接） | 待办 |

## R50 characters: minimal integration approved by current integration owner (2026-10-22)
- main.js: import and construct CharacterSystem after existing world/UI readiness, pass existing camera/day-cycle/quality/hidden state to one update, dispose before world. No architectural or flight mutation.
- SettingsMenu.js: add one accessible 宫廷人物 toggle and historical interpretation notice. Existing modal/input/focus behavior remains owned by existing implementation.
- PerfHUD.js: accept a read-only characterProvider and display separate logical/load/render/CPU stats. Existing complete-frame renderer.info reset remains unchanged.
- Frozen: data/zones, palace/zone builders, InteriorLoader, Collision, prior stepwalk and regression tests.
- R50 samples require user style approval before expanded population. Formal seat supports are checked against visible furniture rather than collision proxy heights.
- 2026-10-22 additional QA-only approval: package.json/package-lock.json add exact devDependency @napi-rs/canvas@0.1.100 from the official npm registry. No production dependency, existing package version, existing lock entry, or npm script changes. Clean npm ci, native PNG and all affected character tests verified.

### R50 independent readiness follow-up · 2026-10-22

- Base: frozen local `5495e2acb42924a27e2d5c07eda5a8ff0944464c`, published candidate `306f5eeba65164fdcb65f173f3fa45a0f154cd3c`. The delivered candidate is unchanged and remains available for rollback.
- Approved scope: resumable `CharacterWorldAdapter` queries, one `CharacterWorkQueue` advanced only inside `CharacterSystem.update`, and bounded `CharacterResourcePool`/Kit preparation. No worker copy of the world, extra RAF/timer, production dependency, building, collision, zone, InteriorLoader or main change.
- All three LODs of an actual actor's pose/seat variant are prepared before its binding becomes visible. First-template work is included in the total NPC update deadline; no half-built geometry is published. Cancellation closes generators and stale work cannot publish ready results.
- Queries continue to use real source triangles, groups, draw ranges, material sides and the existing collision data. A flat exact-layer candidate may be tested first but its box is never accepted as support. World and character/surface/body configuration are part of cache validity.
- The budget is cooperative, not a strict wall-time guarantee: one bounded step and JavaScript/GC/scheduling can exceed the deadline. Reports retain p95, maxima, total update wall time, process CPU, and full/first-core readiness latency separately.
- User confirmed the earlier male three-pose and corrected-throne style direction at 03:58:03 UTC, not historical/GPU/overall acceptance. Female candidate-05 images were separately supplied at 04:28:42 UTC and must never be overwritten; they remain a separate confirmation item until an explicit answer is received.
- Female changes retain the 1.70 m calibration and all seat/foot contact metrics. Ninety male combinations remain byte-identical to the frozen baseline; 36 female combinations have a separate new visual candidate baseline. Official source images are research-only and must not be committed or republished without rights.
- `CHARACTER_ROLLOUT_APPROVED` remains false. Registered required actors are not removed from coverage while preparing or blocked. Plaque repairs are a separate version and are not merged here.

- Readiness integration approved at 04:35 UTC: CharacterManager applies a 0.35 s readiness factor, multiplied by existing schedule visibility. Normal LOD/quality switches do not restart it. PerfHUD adds read-only ready/pending/error counts and does not reset full-frame counters.
- Physical support proof is tied to exact hit owners, ancestor transforms/visibility and geometry/material/group/draw-range versions. The first query snapshot is retained; changes before commit fail closed. Completed caches check local route/body/turn bounds against appended collider/walkable boxes. Full collection replacement, large append batches or root ownership changes conservatively invalidate.
- Scene geometry attributes modified in place without their normal Three.js version update, or existing collision/walkable boxes edited in place without collection replacement, require explicit world.invalidate(). The existing append/remove-by-tag collection lifecycle is covered; no building/Collision event contract is silently changed.
- Manager-only synchronous revision reads share a per-update snapshot. A try/finally ends that snapshot before any resumable work advances; no ready-support snapshot survives to the next update.
- Actual high and low preparation budgets are both 1 ms total NPC update targets. The earlier 0.6 ms low target caused a measured 25.6 s readiness delay and was rejected. This is a cooperative target, not a guaranteed maximum; the retained final primary low run includes a 16.12 ms tail.

### R50 storage-only evidence packaging · 2026-10-22 05:19 UTC

- Preserve commit/worktree 314751a381bdbf159a3dd5bdb3c92fcbe7240700. No production, data, dependency, candidate-05 image/cache or rollout change.
- Explicit follow-up authorization permits the two immutable test oracles to move to gzip binary parts, at most 120000 bytes each. The test reader only checks ordered pieces, concatenates, decompresses and parses; all original 126/36 cases and existing assertions remain byte-identical. No oracle regeneration.
- Each index records per-part/full-gzip/original JSON SHA256 and original Git blob identity. Verification optionally compares all original bytes with 314751; normal clean-checkout verification does not require that unpublished local commit. Missing/order/corruption and manifest/index divergence fail closed.
- The one-time female capture script now recognizes compressed/indexed existing fixtures and refuses replacement. Its historical generation logic is otherwise unchanged; it is not a current oracle-recreation command.
- Large measurement reports are losslessly archived; regenerable readiness expanded triangles are omitted with source hash and reconstruction instructions. Previous numerical/GPU/history limitations remain unchanged.
- User supplied a new female art reference at 05:13 UTC; candidate-05 is not approved. New actual models are developed separately and are not included in this storage-only revision.


## R50 final joint successor, 2026-10-22 06:28 UTC

Approved scope: original R49B 95db2af114-path cherry-pick, plus independently frozen Benren depth-only ad64 patch; no R49C experiment. Preserve old R49/R49B/R50 branches and manifests. World-source expectations are read from frozen Git blobs, with explicit 182→185→185 provenance; inherited QA remains identified, not relabelled fresh.

Female06-06 appearance approved by user 06:02 (Sentinel_074343e350388191b624c8316491eaf1), limited to exact original three PNGs/Kit hash. Kit07 repairs seated weights only; independent buffers/metadata verification preserves the approved static scope. Runtime route-identity variant and stable near<=2 were approved. Gate remains false pending runtime/history/GPU acceptance.

SettingsMenu change in this successor is wording only: “待视觉确认”→“待验收”; main, architecture and collision otherwise only inherit explicitly approved owner commits. New test-only current07 semantics keep old fixture bytes/assertions and old red. Evidence transportation changes containers only, with original GIF/gzip byte equality and safe restore. See reports/r50-joint/README.md, geometry-acceptance.md, world-benren-inheritance.md and transport-README.md.
